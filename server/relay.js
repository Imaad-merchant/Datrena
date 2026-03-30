/**
 * Rithmic MBO → WebSocket Relay
 *
 * Modes:
 *   1. SIMULATED (default) — generates realistic ES tick data at ~10 trades/sec
 *   2. LIVE — connects to Rithmic API and relays real MBO trades
 *
 * The frontend DataLayer connects to this via WebSocket and receives:
 *   { type: "trade", price: 5812.25, bid_volume: 3, ask_volume: 0, timestamp: "..." }
 *
 * Usage:
 *   cp .env.example .env   # fill in your Rithmic credentials
 *   npm install
 *   npm start              # starts on ws://localhost:8080
 *
 * Then update WS_URL in DataLayer.jsx to ws://localhost:8080
 * Or use ngrok: ngrok http 8080  →  wss://xxx.ngrok-free.dev
 */

import { WebSocketServer } from "ws";
import { config } from "dotenv";
config();

const PORT = parseInt(process.env.WS_PORT || "8080", 10);
const TICKER = process.env.TICKER || "ES";

// ══════════════════════════════════════════════════════════════════════════════
//  WebSocket Server — broadcasts trades to all connected frontends
// ══════════════════════════════════════════════════════════════════════════════
const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[relay] client connected (${clients.size} total)`);
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

console.log(`[relay] WebSocket server listening on ws://localhost:${PORT}`);
console.log(`[relay] Ticker: ${TICKER}`);

// ══════════════════════════════════════════════════════════════════════════════
//  Mode 1: SIMULATED MBO DATA
//  Generates realistic Level 3 trade flow for ES futures
// ══════════════════════════════════════════════════════════════════════════════

const HAS_RITHMIC = process.env.RITHMIC_USER && process.env.RITHMIC_PASSWORD;

if (!HAS_RITHMIC) {
  console.log("[relay] No Rithmic credentials found — running in SIMULATION mode");
  console.log("[relay] To use live data, fill in .env with your Rithmic credentials");

  // Price state
  let price = 5812.0;
  const TICK = 0.25;
  let trend = 0; // momentum: positive = bullish, negative = bearish

  function simulateTrade() {
    // Random walk with momentum
    trend = trend * 0.98 + (Math.random() - 0.5) * 0.3;
    const move = trend > 0.1 ? TICK : trend < -0.1 ? -TICK : 0;
    if (Math.random() < 0.3) price += move;

    // Snap to tick
    price = Math.round(price / TICK) * TICK;

    // Simulate MBO: each trade is on either bid or ask side
    const isBuy = Math.random() < (0.5 + trend * 0.3); // bias by momentum
    const size = Math.ceil(Math.random() * 8); // 1-8 contracts typical

    const trade = {
      type: "trade",
      symbol: TICKER,
      price: parseFloat(price.toFixed(2)),
      bid_volume: isBuy ? 0 : size,
      ask_volume: isBuy ? size : 0,
      size,
      side: isBuy ? "ask" : "bid",
      timestamp: new Date().toISOString(),
    };

    broadcast(trade);
  }

  // ~10 trades per second (realistic ES during RTH)
  setInterval(simulateTrade, 80 + Math.random() * 120);

  // Occasional bursts (iceberg fills, sweeps)
  setInterval(() => {
    const burstSize = 3 + Math.floor(Math.random() * 8);
    for (let i = 0; i < burstSize; i++) {
      setTimeout(simulateTrade, i * 15);
    }
  }, 3000 + Math.random() * 5000);

  console.log("[relay] Simulating ~10 trades/sec for ES futures");
}

// ══════════════════════════════════════════════════════════════════════════════
//  Mode 2: LIVE RITHMIC MBO
//  Connects to Rithmic Protocol Buffer API and relays real trades
// ══════════════════════════════════════════════════════════════════════════════

if (HAS_RITHMIC) {
  console.log("[relay] Rithmic credentials found — connecting to live MBO feed...");
  console.log(`[relay] System: ${process.env.RITHMIC_SYSTEM}`);
  console.log(`[relay] User: ${process.env.RITHMIC_USER}`);

  // ─── Rithmic connection ───
  // Rithmic uses Protocol Buffers over TCP (SSL).
  // Their API requires their .proto definitions and a multi-step handshake:
  //   1. Connect to ticker plant (port 443 typically)
  //   2. Send login request with credentials
  //   3. Subscribe to market data for specific instruments
  //   4. Receive trade/BBO/depth updates as protobuf messages
  //
  // For a production implementation, you need:
  //   - Rithmic's .proto files (request from Rithmic support)
  //   - protobufjs to encode/decode messages
  //   - TLS socket connection to their ticker plant
  //
  // Below is the connection scaffold. You'll need to add the proto files.

  import("net").then(({ default: net }) => {
    import("tls").then(({ default: tls }) => {
      const RITHMIC_HOSTS = {
        "Rithmic Paper Trading": "rituz01000.rithmic.com",
        "Rithmic 01": "rituz01000.rithmic.com",
        "Rithmic Live": "rlz01000.rithmic.com",
      };

      const host = RITHMIC_HOSTS[process.env.RITHMIC_SYSTEM] || "rituz01000.rithmic.com";
      const port = 443;

      console.log(`[rithmic] Connecting to ${host}:${port}...`);
      console.log("[rithmic] NOTE: Full Rithmic protobuf integration requires their .proto files.");
      console.log("[rithmic] Request them from Rithmic support: support@rithmic.com");
      console.log("[rithmic] Once you have them, place in server/proto/ and uncomment the handler below.");
      console.log("");
      console.log("[rithmic] For now, falling back to simulation mode.");
      console.log("[rithmic] The simulated data matches the exact message format the chart expects.");

      // Fallback to simulation when proto files aren't available
      let simPrice = 5812.0;
      let simTrend = 0;
      const TICK = 0.25;

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
  });

  // ─── Full Rithmic protobuf handler (uncomment when you have .proto files) ───
  /*
  import protobuf from "protobufjs";

  const root = await protobuf.load("./proto/request_login.proto");
  // ... load all required proto files

  const socket = tls.connect({ host, port, rejectUnauthorized: false }, () => {
    console.log("[rithmic] TLS connected, sending login...");

    // 1. Send RequestLogin
    const LoginReq = root.lookupType("rti.RequestLogin");
    const loginMsg = LoginReq.create({
      templateId: 10,
      userName: process.env.RITHMIC_USER,
      password: process.env.RITHMIC_PASSWORD,
      appName: process.env.RITHMIC_APP_NAME || "Datrena",
      appVersion: process.env.RITHMIC_APP_VERSION || "1.0.0",
      systemName: process.env.RITHMIC_SYSTEM,
      infraType: 2, // TICKER_PLANT
    });
    const buf = LoginReq.encode(loginMsg).finish();
    // Rithmic framing: 4-byte length prefix (big-endian) + protobuf payload
    const frame = Buffer.alloc(4 + buf.length);
    frame.writeUInt32BE(buf.length, 0);
    buf.copy(frame, 4);
    socket.write(frame);
  });

  socket.on("data", (data) => {
    // Parse Rithmic framed protobuf messages
    // Extract trade ticks and broadcast as JSON
    // { type: "trade", price, bid_volume, ask_volume, timestamp }
  });
  */
}
