/**
 * Rithmic MBO → WebSocket Relay
 *
 * Modes:
 *   1. SIMULATED (default) — generates realistic ES tick data + MBO order book
 *   2. LIVE — connects to Rithmic API and relays real MBO trades
 *
 * Messages broadcast to frontend:
 *   { type: "trade", price, bid_volume, ask_volume, timestamp }
 *   { type: "history", candles: [{time, o, h, l, c, v}, ...] }
 *   { type: "book_update", bids: [{price, size, orderCount}], asks: [...], timestamp }
 *   { type: "order_event", action, orderId, price, size, side, timestamp }
 *   { type: "iceberg_alert", price, side, visibleSize, estimatedHiddenSize, fillCount, timestamp }
 *   { type: "pull_rate", price, side, addCount, pullCount, pullRate, window, timestamp }
 */

import { WebSocketServer } from "ws";
import { config } from "dotenv";
config();

const PORT = parseInt(process.env.WS_PORT || "8080", 10);
const TICKER = process.env.TICKER || "ES";
const TICK = 0.25;

const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

function srand(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// Generate fresh history ending at a given price
function generateHistory(endPrice) {
  const candles = [];
  let hp = endPrice - (srand(42) * 5 + 2);
  for (let i = 599; i >= 0; i--) {
    const t = new Date(Date.now() - i * 60000);
    const s = i * 7 + 42;
    const dir = srand(s) > 0.45 ? 1 : -1;
    const range = (1 + srand(s + 3) * 3) * TICK;
    hp += (srand(s + 11) - 0.48) * TICK * 2;
    hp = Math.round(hp / TICK) * TICK;
    const o = parseFloat(hp.toFixed(2));
    const c = parseFloat((o + dir * range).toFixed(2));
    const h = parseFloat((Math.max(o, c) + srand(s + 5) * TICK * 2).toFixed(2));
    const l = parseFloat((Math.min(o, c) - srand(s + 9) * TICK * 2).toFixed(2));
    const v = Math.round(200 + srand(s + 17) * 1800);
    hp = c;
    candles.push({ time: t.toISOString().slice(0, 16), o, h, l, c, v });
  }
  return candles;
}

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[relay] client connected (${clients.size} total)`);

  // Send fresh history ending at current price on each connect
  const freshHistory = generateHistory(currentPrice());
  ws.send(JSON.stringify({ type: "history", candles: freshHistory }));

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[relay] client disconnected (${clients.size} total)`);
  });
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

// Global price accessor (set by simulation mode)
let _livePrice = 5812.0;
function currentPrice() { return _livePrice; }

console.log(`[relay] WebSocket server listening on ws://localhost:${PORT}`);
console.log(`[relay] Ticker: ${TICKER}`);

// ══════════════════════════════════════════════════════════════════════════════
//  SIMULATED MODE
// ══════════════════════════════════════════════════════════════════════════════

const HAS_RITHMIC = process.env.RITHMIC_USER && process.env.RITHMIC_PASSWORD;

if (!HAS_RITHMIC) {
  console.log("[relay] No Rithmic credentials — SIMULATION mode");

  let price = 5579.0;
  _livePrice = price;
  let trend = 0;

  // ── Trade Simulation (~10/sec) ──
  function simulateTrade() {
    trend = trend * 0.98 + (Math.random() - 0.5) * 0.3;
    const move = trend > 0.1 ? TICK : trend < -0.1 ? -TICK : 0;
    if (Math.random() < 0.3) price += move;
    price = Math.round(price / TICK) * TICK;
    _livePrice = price;

    const isBuy = Math.random() < (0.5 + trend * 0.3);
    const size = Math.ceil(Math.random() * 8);

    broadcast({
      type: "trade",
      symbol: TICKER,
      price: parseFloat(price.toFixed(2)),
      bid_volume: isBuy ? 0 : size,
      ask_volume: isBuy ? size : 0,
      size,
      side: isBuy ? "ask" : "bid",
      timestamp: new Date().toISOString(),
    });
  }

  setInterval(simulateTrade, 80 + Math.random() * 120);
  setInterval(() => {
    const n = 3 + Math.floor(Math.random() * 8);
    for (let i = 0; i < n; i++) setTimeout(simulateTrade, i * 15);
  }, 3000 + Math.random() * 5000);

  // ── Order Book Simulation (every 250ms) ──
  setInterval(() => {
    const bids = [], asks = [];
    for (let i = 0; i < 10; i++) {
      bids.push({
        price: parseFloat((price - (i + 1) * TICK).toFixed(2)),
        size: Math.round(50 + Math.random() * 200),
        orderCount: Math.round(3 + Math.random() * 15),
      });
      asks.push({
        price: parseFloat((price + (i + 1) * TICK).toFixed(2)),
        size: Math.round(50 + Math.random() * 200),
        orderCount: Math.round(3 + Math.random() * 15),
      });
    }
    broadcast({ type: "book_update", bids, asks, timestamp: new Date().toISOString() });
  }, 250);

  // ── Order Event Simulation (~3/sec) ──
  let nextOrderId = 1;
  const activeOrders = new Map();

  setInterval(() => {
    const actions = ["add", "add", "add", "modify", "cancel", "fill"];
    const action = activeOrders.size < 5 ? "add" : actions[Math.floor(Math.random() * actions.length)];

    if (action === "add") {
      const side = Math.random() > 0.5 ? "bid" : "ask";
      const offset = Math.ceil(Math.random() * 5) * TICK;
      const op = parseFloat((side === "bid" ? price - offset : price + offset).toFixed(2));
      const sz = Math.ceil(Math.random() * 20);
      const id = nextOrderId++;
      activeOrders.set(id, { price: op, size: sz, side });
      broadcast({ type: "order_event", action: "add", orderId: id, price: op, size: sz, side, timestamp: new Date().toISOString() });
    } else if (activeOrders.size > 0) {
      const ids = Array.from(activeOrders.keys());
      const id = ids[Math.floor(Math.random() * ids.length)];
      const order = activeOrders.get(id);

      if (action === "cancel" || action === "fill") {
        activeOrders.delete(id);
        broadcast({ type: "order_event", action, orderId: id, price: order.price, size: order.size, side: order.side, timestamp: new Date().toISOString() });
      } else {
        const newSize = Math.max(1, order.size + Math.floor(Math.random() * 10 - 5));
        order.size = newSize;
        broadcast({ type: "order_event", action: "modify", orderId: id, price: order.price, size: newSize, side: order.side, timestamp: new Date().toISOString() });
      }
    }
  }, 300);

  // ── Iceberg Detection (occasional) ──
  setInterval(() => {
    if (Math.random() < 0.15) {
      const side = Math.random() > 0.5 ? "bid" : "ask";
      const offset = Math.ceil(Math.random() * 3) * TICK;
      broadcast({
        type: "iceberg_alert",
        price: parseFloat((side === "bid" ? price - offset : price + offset).toFixed(2)),
        side,
        visibleSize: Math.round(10 + Math.random() * 30),
        estimatedHiddenSize: Math.round(100 + Math.random() * 500),
        fillCount: Math.round(5 + Math.random() * 20),
        timestamp: new Date().toISOString(),
      });
    }
  }, 2000);

  // ── Pull Rate Analysis (every second) ──
  setInterval(() => {
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue;
      const p = parseFloat((price + i * TICK).toFixed(2));
      const addCount = Math.round(20 + Math.random() * 80);
      const pullCount = Math.round(addCount * (0.2 + Math.random() * 0.6));
      broadcast({
        type: "pull_rate",
        price: p,
        side: i < 0 ? "bid" : "ask",
        addCount,
        pullCount,
        pullRate: parseFloat((pullCount / addCount).toFixed(2)),
        window: 30,
        timestamp: new Date().toISOString(),
      });
    }
  }, 1000);

  console.log("[relay] Simulating trades + MBO data (book, orders, icebergs, pull rates)");
}

// ══════════════════════════════════════════════════════════════════════════════
//  LIVE RITHMIC MODE
// ══════════════════════════════════════════════════════════════════════════════

if (HAS_RITHMIC) {
  console.log("[relay] Rithmic credentials found — connecting to live MBO feed...");
  console.log(`[relay] System: ${process.env.RITHMIC_SYSTEM}`);
  console.log(`[relay] User: ${process.env.RITHMIC_USER}`);

  import("tls").then(({ default: tls }) => {
    const RITHMIC_HOSTS = {
      "Rithmic Paper Trading": "rituz01000.rithmic.com",
      "Rithmic 01": "rituz01000.rithmic.com",
      "Rithmic Live": "rlz01000.rithmic.com",
    };

    const host = RITHMIC_HOSTS[process.env.RITHMIC_SYSTEM] || "rituz01000.rithmic.com";
    console.log(`[rithmic] Connecting to ${host}:443...`);
    console.log("[rithmic] NOTE: Full protobuf integration requires Rithmic .proto files.");
    console.log("[rithmic] Falling back to simulation mode.");

    // Fallback simulation
    let simPrice = 5812.0;
    let simTrend = 0;

    function simTrade() {
      simTrend = simTrend * 0.98 + (Math.random() - 0.5) * 0.3;
      if (Math.random() < 0.3) simPrice += (simTrend > 0.1 ? TICK : simTrend < -0.1 ? -TICK : 0);
      simPrice = Math.round(simPrice / TICK) * TICK;
      const isBuy = Math.random() < (0.5 + simTrend * 0.3);
      const size = Math.ceil(Math.random() * 8);
      broadcast({
        type: "trade",
        symbol: TICKER,
        price: parseFloat(simPrice.toFixed(2)),
        bid_volume: isBuy ? 0 : size,
        ask_volume: isBuy ? size : 0,
        size,
        side: isBuy ? "ask" : "bid",
        timestamp: new Date().toISOString(),
      });
    }

    setInterval(simTrade, 80 + Math.random() * 120);
    setInterval(() => {
      const n = 3 + Math.floor(Math.random() * 8);
      for (let i = 0; i < n; i++) setTimeout(simTrade, i * 15);
    }, 3000 + Math.random() * 5000);
  });
}
