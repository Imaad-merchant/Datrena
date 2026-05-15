import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  RefreshCw, Wifi, WifiOff, ChevronsRight, ChevronDown, Layers, Eye, EyeOff,
  Search, Save, FolderOpen, X as XIcon, MousePointer, PenTool, Type, Minus,
  Activity, Clock, FileText, MessageSquare, Briefcase, Settings,
  ChevronLeft as CLeft, ChevronRight as CRight, ChevronsLeft, ChevronUp,
  Maximize2, Plus,
} from "lucide-react";
import MainNav from "../components/navigation/MainNav";

// ── Config ────────────────────────────────────────────────────────────────────
// Binance live data — direct WebSocket from the desktop app.
const BINANCE_WS_BASE = "wss://stream.binance.com:9443/stream?streams=";
const BINANCE_REST_BASE = "https://api.binance.com/api/v3";

// Tick size is now per-symbol (set when ticker changes). Default = 1.0.
let TICK = 1.0;
const IMB = 3;

const VOL_W   = 52;
const PRICE_W = 58;
const SUM_ROWS  = 3;
const SUM_ROW_H = 20;
const TIME_H    = 22;
const FOOTER_H  = SUM_ROWS * SUM_ROW_H + TIME_H;

// Zoom — effectively unlimited
const MIN_CW = 2;
const MAX_CW = 2000;
const MIN_CH = 2;
const MAX_CH = 200;
const DEFAULT_CW = 72;
const DEFAULT_CH = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────
function srand(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function distVol(open, high, low, close, volume, ts) {
  const lvls = {};
  if (!volume) return lvls;
  const minP = parseFloat((Math.floor(low / TICK) * TICK).toFixed(2));
  const maxP = parseFloat((Math.ceil(high / TICK) * TICK).toFixed(2));
  const isG = close >= open;
  if (Math.abs(maxP - minP) < TICK * 0.5) {
    lvls[minP] = { b: Math.round(volume * (isG ? 0.4 : 0.6)), a: Math.round(volume * (isG ? 0.6 : 0.4)) };
    return lvls;
  }
  const ps = [];
  for (let p = minP; p <= maxP + TICK * 0.01; p = parseFloat((p + TICK).toFixed(2))) ps.push(p);
  const mid = (high + low) / 2, sig = (maxP - minP) / 2.5;
  let wt = ps.map(p => Math.exp(-0.5 * ((p - mid) / sig) ** 2));
  const ws = wt.reduce((a, b) => a + b, 0) || 1;
  wt = wt.map(w => w / ws);
  const oP = parseFloat((Math.round(open / TICK) * TICK).toFixed(2));
  const cP = parseFloat((Math.round(close / TICK) * TICK).toFixed(2));
  ps.forEach((p, i) => {
    const v = Math.max(1, Math.round(volume * wt[i]));
    const r = srand(ts + p * 137 + i * 31);
    let ar;
    if (isG) ar = p > cP ? 0.55 + r * 0.25 : p < oP ? 0.2 + r * 0.2 : 0.4 + r * 0.25;
    else     ar = p > oP ? 0.2 + r * 0.2   : p < cP ? 0.55 + r * 0.25 : 0.35 + r * 0.25;
    lvls[p] = { b: Math.round(v * (1 - ar)), a: Math.round(v * ar) };
  });
  return lvls;
}

function fmt(n) {
  if (!n && n !== 0) return "";
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (a >= 1e4) return (n / 1e3).toFixed(0) + "k";
  if (a >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
}

function tfMinutes(tf) {
  if (tf === "D") return 1440;
  if (tf === "W") return 10080;
  if (tf === "M") return 43200;
  if (tf.endsWith("h")) return parseInt(tf) * 60;
  return parseInt(tf) || 5;
}

function genDemo(base, n, tf) {
  const ohlc = {}, candles = {};
  const now = new Date();
  const m = tfMinutes(tf);
  let price = base;
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * m * 60000);
    const bk = t.toISOString().slice(0, 16);
    const range = (1 + srand(i * 7 + 3) * 3) * TICK;
    const dir = srand(i * 13 + 7) > 0.45 ? 1 : -1;
    price += (srand(i * 19 + 11) - 0.5) * 2 * TICK;
    const o = parseFloat(price.toFixed(2));
    const c = parseFloat((o + dir * range).toFixed(2));
    const h = parseFloat((Math.max(o, c) + srand(i * 23 + 5) * TICK * 2).toFixed(2));
    const l = parseFloat((Math.min(o, c) - srand(i * 29 + 9) * TICK * 2).toFixed(2));
    const v = Math.round(200 + srand(i * 37 + 17) * 1800);
    price = c;
    ohlc[bk] = { time: Math.floor(t.getTime() / 1000), open: o, high: h, low: l, close: c };
    candles[bk] = distVol(o, h, l, c, v, i * 100 + 42);
  }
  return { ohlc, candles };
}

// ── Trade bucketing helpers ──────────────────────────────────────────────────
function bucketTrade(candlesObj, ohlcObj, d, tf) {
  const ts = new Date(d.timestamp);
  const tfMs = tfMinutes(tf) * 60000;
  const floored = new Date(Math.floor(ts.getTime() / tfMs) * tfMs);
  const bk = floored.toISOString().slice(0, 16);
  const pl = parseFloat((Math.round(d.price / TICK) * TICK).toFixed(2));
  if (!candlesObj[bk]) candlesObj[bk] = {};
  if (!candlesObj[bk][pl]) candlesObj[bk][pl] = { b: 0, a: 0 };
  candlesObj[bk][pl].b += d.bid_volume || 0;
  candlesObj[bk][pl].a += d.ask_volume || 0;
  const t = Math.floor(floored.getTime() / 1000);
  if (!ohlcObj[bk]) ohlcObj[bk] = { time: t, open: d.price, high: d.price, low: d.price, close: d.price };
  else { ohlcObj[bk].high = Math.max(ohlcObj[bk].high, d.price); ohlcObj[bk].low = Math.min(ohlcObj[bk].low, d.price); ohlcObj[bk].close = d.price; }
}

function processHistoryCandle(candlesObj, ohlcObj, candle, tf) {
  const tfMs = tfMinutes(tf) * 60000;
  const ts = new Date(candle.time + ":00Z").getTime();
  const floored = new Date(Math.floor(ts / tfMs) * tfMs);
  const bk = floored.toISOString().slice(0, 16);
  const levels = distVol(candle.o, candle.h, candle.l, candle.c, candle.v, ts / 1000);
  if (!candlesObj[bk]) candlesObj[bk] = {};
  Object.entries(levels).forEach(([price, { b, a }]) => {
    if (!candlesObj[bk][price]) candlesObj[bk][price] = { b: 0, a: 0 };
    candlesObj[bk][price].b += b;
    candlesObj[bk][price].a += a;
  });
  if (!ohlcObj[bk]) {
    ohlcObj[bk] = { time: Math.floor(floored.getTime() / 1000), open: candle.o, high: candle.h, low: candle.l, close: candle.c };
  } else {
    ohlcObj[bk].high = Math.max(ohlcObj[bk].high, candle.h);
    ohlcObj[bk].low = Math.min(ohlcObj[bk].low, candle.l);
    ohlcObj[bk].close = candle.c;
  }
}

// Symbol metadata is fetched dynamically from Binance /exchangeInfo on mount.
// Tick size is auto-derived per symbol from the current price (sensible
// footprint bucket — rendering every $0.01 cent at BTC $95k is meaningless).
function autoTick(price) {
  if (!price || price <= 0) return 1;
  // Roughly 1/1000th of price, snapped to a 1-2-5 step
  const target = price * 0.001;
  const mag = Math.pow(10, Math.floor(Math.log10(target)));
  const norm = target / mag;
  const step = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  return step * mag;
}

const TIMEFRAMES = ["1m","2m","3m","5m","10m","15m","30m","1h","4h","D","W","M"];

const OVERLAY_DEFS = [
  { key: "footprint",        label: "Order Flow Footprint" },
  { key: "depthHeatmap",     label: "DOM Depth Heatmap" },
  { key: "restingOrders",    label: "Resting Orders" },
  { key: "orderTracking",    label: "Order Tracking" },
  { key: "queuePosition",    label: "Queue Position" },
  { key: "icebergDetection", label: "Iceberg Detection" },
  { key: "pullRate",         label: "Pull Rate Analysis" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function DataLayer() {
  const [status,    setStatus]    = useState("disconnected");
  const [ticker,    setTicker]    = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("5m");
  const [symbols,   setSymbols]   = useState([]); // all Binance USDT pairs
  const [tickerQuery, setTickerQuery] = useState("BTCUSDT");
  const [showTickerMenu, setShowTickerMenu] = useState(false);
  // ── Pro-terminal chrome state ────────────────────────────────────────
  const [openMenu, setOpenMenu] = useState(null); // top menu open: "file" | "chart" | etc.
  const [workspaceTabs, setWorkspaceTabs] = useState(["BTCUSDT", "ETHUSDT", "SOLUSDT"]);
  const [statsTick, setStatsTick] = useState(0); // forces stats panel re-render
  const [now, setNow] = useState(new Date());
  const [dataMode,  setDataMode]  = useState("demo");
  const [countdown, setCountdown] = useState("");
  const [showSnap,  setShowSnap]  = useState(false);
  const [hoverBar,  setHoverBar]  = useState(null);
  const [showOverlayMenu, setShowOverlayMenu] = useState(false);
  const [overlays, setOverlays] = useState({
    footprint: true, depthHeatmap: false, restingOrders: false,
    orderTracking: false, queuePosition: false, icebergDetection: false, pullRate: false,
  });

  const hoverBarRef    = useRef(null);
  const canvasRef      = useRef(null);
  const containerRef   = useRef(null);
  const candlesRef     = useRef({});
  const ohlcRef        = useRef({});
  const rafRef         = useRef(null);
  const cssSize        = useRef({ w: 0, h: 0 });
  const timeframeRef   = useRef(timeframe);
  const overlaysRef    = useRef(overlays);

  // MBO data refs
  const historyRef       = useRef([]);
  const rawTradesRef     = useRef([]);
  const bookRef          = useRef({ bids: [], asks: [] });
  const orderEventsRef   = useRef([]);
  const icebergAlertsRef = useRef([]);
  const pullRateRef      = useRef({});

  useEffect(() => { timeframeRef.current = timeframe; }, [timeframe]);
  useEffect(() => { overlaysRef.current = overlays; }, [overlays]);

  // Tick the stats panel + clock once per second (reads from candlesRef)
  useEffect(() => {
    const iv = setInterval(() => {
      setStatsTick((t) => t + 1);
      setNow(new Date());
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // Close any open menu when clicking outside
  useEffect(() => {
    if (!openMenu) return;
    const close = (e) => {
      if (!e.target.closest?.("[data-menu-anchor]") && !e.target.closest?.("[data-menu-popup]")) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [openMenu]);

  // Fetch every active Binance trading pair on mount (cached for the session)
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetch(`${BINANCE_REST_BASE}/exchangeInfo`);
        if (!res.ok) throw new Error(`exchangeInfo ${res.status}`);
        const data = await res.json();
        if (abort) return;
        const list = (data.symbols || [])
          .filter((s) => s.status === "TRADING")
          .map((s) => ({
            symbol: s.symbol,
            base: s.baseAsset,
            quote: s.quoteAsset,
          }))
          // Sort: USDT pairs first, then USDC, BTC, ETH, then alphabetical
          .sort((a, b) => {
            const order = { USDT: 0, USDC: 1, BTC: 2, ETH: 3 };
            const oa = order[a.quote] ?? 9;
            const ob = order[b.quote] ?? 9;
            if (oa !== ob) return oa - ob;
            return a.symbol.localeCompare(b.symbol);
          });
        setSymbols(list);
      } catch (err) {
        console.warn("Binance exchangeInfo fetch failed:", err.message);
      }
    })();
    return () => {
      abort = true;
    };
  }, []);

  const view = useRef({
    cW: DEFAULT_CW, cH: DEFAULT_CH,
    scrollX: 0, scrollY: 0,
    dragging: false, dragZone: null,
    lastX: 0, lastY: 0,
    userScrolled: false, lastInteraction: 0,
    mouseX: -1, mouseY: -1,
  });

  // ── Draw ───────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    rafRef.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w: W, h: H } = cssSize.current;
    if (!W || !H) return;

    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const v   = view.current;
    const cW  = v.cW;
    const cH  = v.cH;
    const can = candlesRef.current;
    const olc = ohlcRef.current;
    const ov  = overlaysRef.current;

    const buckets = Object.keys(can).sort();
    const priceSet = new Set();
    buckets.forEach(b => Object.keys(can[b] || {}).forEach(p => priceSet.add(+p)));
    const allPrices = Array.from(priceSet).sort((a, b) => b - a);

    ctx.fillStyle = "#0a0a10";
    ctx.fillRect(0, 0, W, H);

    if (buckets.length === 0 || allPrices.length === 0) {
      ctx.fillStyle = "#3a3a50";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Waiting for data…", W / 2, H / 2);
      return;
    }

    const nCols = buckets.length;
    const nRows = allPrices.length;
    const vpW = W - VOL_W - PRICE_W;
    const vpH = H - FOOTER_H;
    const totalW = nCols * cW;
    const totalH = nRows * cH;

    // Helper: price to y coordinate
    const topP = allPrices[0];
    const priceToY = (p) => ((topP - p) / TICK) * cH - v.scrollY;

    // Auto-scroll
    if (!v.userScrolled) {
      v.scrollX = Math.max(0, totalW - vpW);
      const lastBar = olc[buckets[buckets.length - 1]];
      if (lastBar) {
        const closeP = parseFloat((Math.round(lastBar.close / TICK) * TICK).toFixed(2));
        const closeIdx = allPrices.indexOf(closeP);
        if (closeIdx >= 0) v.scrollY = Math.max(0, closeIdx * cH - vpH / 2);
        else v.scrollY = Math.max(0, (totalH - vpH) / 2);
      } else {
        v.scrollY = Math.max(0, (totalH - vpH) / 2);
      }
    }

    // Clamp scroll
    v.scrollX = Math.max(-vpW / 2, Math.min(totalW + vpW / 2, v.scrollX));
    v.scrollY = Math.max(-vpH / 4, Math.min(Math.max(0, totalH - vpH / 2), v.scrollY));

    const firstCol = Math.max(0, Math.floor(v.scrollX / cW));
    const lastCol  = Math.min(nCols - 1, Math.ceil((v.scrollX + vpW) / cW));
    const firstRow = Math.max(0, Math.floor(Math.max(0, v.scrollY) / cH));
    const lastRow  = Math.min(nRows - 1, Math.ceil((v.scrollY + vpH) / cH));

    // Volume profile
    const vp = {};
    buckets.forEach(b => Object.entries(can[b] || {}).forEach(([p, c]) => { vp[p] = (vp[p] || 0) + c.b + c.a; }));
    const maxV = Math.max(...Object.values(vp), 1);
    const pocP = allPrices.reduce((best, p) => (vp[p] || 0) > (vp[best] || 0) ? p : best, allPrices[0]);

    // Per-candle summaries
    let cumD = 0;
    const sums = buckets.map(b => {
      const cells = can[b] || {};
      let ask = 0, bid = 0;
      Object.values(cells).forEach(c => { ask += c.a; bid += c.b; });
      const delta = ask - bid;
      cumD += delta;
      return { ask, bid, delta, cumD, vol: ask + bid };
    });

    const showText = cW >= 20 && cH >= 10;
    const fs = Math.min(14, Math.max(8, Math.floor(cH * 0.45)));

    // ════════════════════════════════════════════════════════════════════════
    //  MAIN GRID
    // ════════════════════════════════════════════════════════════════════════
    ctx.save();
    ctx.beginPath();
    ctx.rect(VOL_W, 0, vpW, vpH);
    ctx.clip();

    // ── Depth Heatmap overlay (background) ──
    if (ov.depthHeatmap) {
      const book = bookRef.current;
      if (book.bids.length || book.asks.length) {
        const maxSize = Math.max(...book.bids.map(b => b.size), ...book.asks.map(a => a.size), 1);
        book.bids.forEach(({ price, size }) => {
          const y0 = priceToY(price);
          if (y0 < -cH || y0 > vpH) return;
          const intensity = size / maxSize;
          ctx.fillStyle = `rgba(20,80,200,${0.04 + intensity * 0.18})`;
          ctx.fillRect(VOL_W, y0, vpW, cH);
        });
        book.asks.forEach(({ price, size }) => {
          const y0 = priceToY(price);
          if (y0 < -cH || y0 > vpH) return;
          const intensity = size / maxSize;
          ctx.fillStyle = `rgba(200,40,40,${0.04 + intensity * 0.18})`;
          ctx.fillRect(VOL_W, y0, vpW, cH);
        });
      }
    }

    // ── Main grid cells ──
    for (let bi = firstCol; bi <= lastCol; bi++) {
      const bucket = buckets[bi];
      const x0 = VOL_W + bi * cW - v.scrollX;
      const bar = olc[bucket];
      const green = bar ? bar.close >= bar.open : true;
      const isLive = bi === nCols - 1;

      let hiP = null, loP = null, opP = null, clP = null;
      if (bar) {
        hiP = parseFloat((Math.ceil(bar.high / TICK) * TICK).toFixed(2));
        loP = parseFloat((Math.floor(bar.low / TICK) * TICK).toFixed(2));
        opP = parseFloat((Math.round(bar.open / TICK) * TICK).toFixed(2));
        clP = parseFloat((Math.round(bar.close / TICK) * TICK).toFixed(2));
      }

      // Column separator
      if (bi % 5 === 0) {
        ctx.strokeStyle = "rgba(25,25,40,0.25)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x0 - 0.5, 0);
        ctx.lineTo(x0 - 0.5, vpH);
        ctx.stroke();
      }

      for (let pi = firstRow; pi <= lastRow; pi++) {
        const p  = allPrices[pi];
        const y0 = pi * cH - v.scrollY;
        const cell = (can[bucket] || {})[p];
        const tot  = cell ? cell.b + cell.a : 0;

        const inBody = opP !== null && clP !== null && (
          (green  && p >= opP - 0.001 && p <= clP + 0.001) ||
          (!green && p >= clP - 0.001 && p <= opP + 0.001)
        );
        const inRange = hiP !== null && p <= hiP + 0.001 && p >= loP - 0.001;
        const isPOC   = Math.abs(p - pocP) < 0.001;

        // Cell background
        if (tot > 0) {
          const askDom = cell.a >= cell.b;
          const intensity = Math.min(Math.max(cell.b, cell.a) / 200, 1);
          const alpha = 0.2 + intensity * 0.3;
          if (askDom) ctx.fillStyle = `rgba(25,${Math.round(55 + intensity * 75)},25,${alpha})`;
          else ctx.fillStyle = `rgba(${Math.round(65 + intensity * 75)},20,20,${alpha})`;
          ctx.fillRect(x0, y0, cW, cH);
        } else if (inBody) {
          ctx.fillStyle = green ? "rgba(22,80,34,0.06)" : "rgba(80,22,22,0.06)";
          ctx.fillRect(x0, y0, cW, cH);
        }

        if (isPOC && tot > 0) {
          ctx.fillStyle = "rgba(255,200,0,0.05)";
          ctx.fillRect(x0, y0, cW, cH);
        }

        // Mini candlestick (always draw, even when zoomed out)
        if (inRange) {
          const candleW = Math.max(2, Math.min(6, cW * 0.06));
          const midX = x0 + cW / 2;
          const cx = midX - candleW / 2;
          if (inBody) {
            ctx.fillStyle = green ? "rgba(34,197,94,0.65)" : "rgba(239,68,68,0.65)";
            ctx.fillRect(cx, y0, candleW, cH);
          } else {
            ctx.strokeStyle = green ? "rgba(34,197,94,0.45)" : "rgba(239,68,68,0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(midX, y0);
            ctx.lineTo(midX, y0 + cH);
            ctx.stroke();
          }
        }

        if (!cell || tot === 0) continue;

        const askDom = cell.a >= cell.b;
        const ratio = askDom ? (cell.b > 0 ? cell.a / cell.b : 999) : (cell.a > 0 ? cell.b / cell.a : 999);
        const imb = tot > 5 && ratio >= IMB;

        // Imbalance border
        if (imb) {
          ctx.strokeStyle = askDom ? "rgba(0,170,60,0.85)" : "rgba(210,40,40,0.85)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x0 + 0.5, y0 + 0.5, cW - 2, cH - 2);
        }

        // Bid / Ask text (skip when zoomed out)
        if (showText && ov.footprint) {
          const midY = y0 + cH / 2;
          const midX = x0 + cW / 2;
          ctx.textBaseline = "middle";

          ctx.font = `${!askDom ? "bold" : "normal"} ${fs}px monospace`;
          ctx.fillStyle = !askDom ? "#ef8888" : "#788878";
          ctx.textAlign = "right";
          ctx.fillText(String(cell.b), midX - 5, midY);

          ctx.font = `${askDom ? "bold" : "normal"} ${fs}px monospace`;
          ctx.fillStyle = askDom ? "#5ee07a" : "#788878";
          ctx.textAlign = "left";
          ctx.fillText(String(cell.a), midX + 5, midY);
        }
      }

      // Live candle glow
      if (isLive) {
        ctx.strokeStyle = "rgba(60,130,255,0.35)";
        ctx.lineWidth = 1.5;
        const y1 = firstRow * cH - v.scrollY;
        const y2 = (lastRow + 1) * cH - v.scrollY;
        ctx.strokeRect(x0 + 0.5, y1, cW - 2, y2 - y1);
      }
    }

    // ── Resting Orders overlay ──
    if (ov.restingOrders) {
      const book = bookRef.current;
      const maxSize = Math.max(...book.bids.map(b => b.size), ...book.asks.map(a => a.size), 1);
      const lastX = VOL_W + (nCols - 1) * cW - v.scrollX;

      [...book.bids, ...book.asks].forEach(({ price, size, orderCount }) => {
        const isBid = book.bids.some(b => b.price === price);
        const y0 = priceToY(price);
        if (y0 < -cH || y0 > vpH) return;

        const barW = (size / maxSize) * cW * 0.8;
        ctx.fillStyle = isBid ? "rgba(30,120,255,0.35)" : "rgba(255,60,60,0.35)";
        ctx.fillRect(lastX + cW + 2, y0 + 2, barW, cH - 4);

        if (showText) {
          ctx.font = "bold 8px monospace";
          ctx.fillStyle = isBid ? "#4488ff" : "#ff6666";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(`${size} (${orderCount})`, lastX + cW + 4, y0 + cH / 2);
        }
      });
    }

    // ── Iceberg Detection overlay ──
    if (ov.icebergDetection) {
      const now = Date.now();
      icebergAlertsRef.current.forEach(alert => {
        const age = now - new Date(alert.timestamp).getTime();
        if (age > 30000) return; // fade after 30s
        const y0 = priceToY(alert.price);
        if (y0 < -cH || y0 > vpH) return;
        const alpha = Math.max(0.2, 1 - age / 30000);
        const lastX = VOL_W + (nCols - 1) * cW - v.scrollX;

        // Diamond marker
        ctx.fillStyle = `rgba(255,200,0,${alpha * 0.8})`;
        ctx.beginPath();
        const cx = lastX + cW / 2;
        const cy = y0 + cH / 2;
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx + 5, cy);
        ctx.lineTo(cx, cy + 5);
        ctx.lineTo(cx - 5, cy);
        ctx.closePath();
        ctx.fill();

        if (showText) {
          ctx.font = "bold 8px monospace";
          ctx.fillStyle = `rgba(255,200,0,${alpha})`;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(`ICE ~${alert.estimatedHiddenSize}`, cx + 8, cy);
        }
      });
    }

    // ── Order Tracking overlay ──
    if (ov.orderTracking) {
      const now = Date.now();
      const recent = orderEventsRef.current.filter(e => now - new Date(e.timestamp).getTime() < 5000);
      const lastX = VOL_W + (nCols - 1) * cW - v.scrollX;

      recent.forEach(evt => {
        const y0 = priceToY(evt.price);
        if (y0 < -cH || y0 > vpH) return;
        const age = now - new Date(evt.timestamp).getTime();
        const alpha = Math.max(0.3, 1 - age / 5000);
        const cx = lastX + cW * 0.3;
        const cy = y0 + cH / 2;

        if (evt.action === "add") {
          ctx.fillStyle = `rgba(80,200,120,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 3);
          ctx.lineTo(cx + 3, cy + 2);
          ctx.lineTo(cx - 3, cy + 2);
          ctx.closePath();
          ctx.fill();
        } else if (evt.action === "cancel") {
          ctx.strokeStyle = `rgba(255,100,100,${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - 2, cy - 2);
          ctx.lineTo(cx + 2, cy + 2);
          ctx.moveTo(cx + 2, cy - 2);
          ctx.lineTo(cx - 2, cy + 2);
          ctx.stroke();
        } else if (evt.action === "fill") {
          ctx.fillStyle = `rgba(100,180,255,${alpha})`;
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // ── Last price line ──
    {
      const lastBar = olc[buckets[nCols - 1]];
      if (lastBar) {
        const ly = priceToY(parseFloat((Math.round(lastBar.close / TICK) * TICK).toFixed(2)));
        if (ly >= 0 && ly < vpH) {
          ctx.strokeStyle = lastBar.close >= lastBar.open ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(VOL_W, ly + cH / 2);
          ctx.lineTo(VOL_W + vpW, ly + cH / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // ── POC line across grid ──
    {
      const pocY = priceToY(pocP);
      if (pocY >= -cH && pocY < vpH + cH) {
        ctx.strokeStyle = "rgba(255,180,0,0.2)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(VOL_W, pocY + cH / 2);
        ctx.lineTo(VOL_W + vpW, pocY + cH / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // ── Crosshair ──
    if (v.mouseX >= VOL_W && v.mouseX < VOL_W + vpW && v.mouseY >= 0 && v.mouseY < vpH) {
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(VOL_W, v.mouseY);
      ctx.lineTo(VOL_W + vpW, v.mouseY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(v.mouseX, 0);
      ctx.lineTo(v.mouseX, vpH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore(); // end main clip

    // ════════════════════════════════════════════════════════════════════════
    //  VOLUME PROFILE (left)
    // ════════════════════════════════════════════════════════════════════════
    ctx.fillStyle = "#08080e";
    ctx.fillRect(0, 0, VOL_W, vpH);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, VOL_W, vpH);
    ctx.clip();

    for (let pi = firstRow; pi <= lastRow; pi++) {
      const p  = allPrices[pi];
      const vol = vp[p] || 0;
      const bw = Math.round((vol / maxV) * (VOL_W - 4));
      const isPOC = Math.abs(p - pocP) < 0.001;
      const y0 = pi * cH - v.scrollY;

      ctx.globalAlpha = 0.5;
      ctx.fillStyle = isPOC ? "#9050dd" : "#163870";
      ctx.fillRect(VOL_W - bw - 2, y0 + 1, bw, Math.max(1, cH - 2));
      ctx.globalAlpha = 1;

      if (vol > 0 && cH >= 8) {
        ctx.font = `${isPOC ? "bold" : "normal"} 8px monospace`;
        ctx.fillStyle = isPOC ? "#c090ff" : "#5577aa";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(fmt(vol), VOL_W - 4, y0 + cH / 2);
      }
    }
    ctx.restore();

    ctx.strokeStyle = "#1a1a2c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(VOL_W - 0.5, 0);
    ctx.lineTo(VOL_W - 0.5, vpH);
    ctx.stroke();

    // ════════════════════════════════════════════════════════════════════════
    //  PRICE AXIS (right)
    // ════════════════════════════════════════════════════════════════════════
    const priceX = W - PRICE_W;
    ctx.fillStyle = "#08080e";
    ctx.fillRect(priceX, 0, PRICE_W, vpH);
    ctx.save();
    ctx.beginPath();
    ctx.rect(priceX, 0, PRICE_W, vpH);
    ctx.clip();

    // Pull rate overlay on price axis
    if (ov.pullRate) {
      Object.values(pullRateRef.current).forEach(pr => {
        const y0 = priceToY(pr.price);
        if (y0 < -cH || y0 > vpH) return;
        const barW = pr.pullRate * (PRICE_W - 4);
        const color = pr.pullRate > 0.6 ? "rgba(255,140,0,0.4)" : pr.pullRate > 0.4 ? "rgba(255,200,60,0.25)" : "rgba(100,200,100,0.15)";
        ctx.fillStyle = color;
        ctx.fillRect(priceX + 2, y0 + 1, barW, cH - 2);
      });
    }

    for (let pi = firstRow; pi <= lastRow; pi++) {
      const p = allPrices[pi];
      const isPOC = Math.abs(p - pocP) < 0.001;
      const y0 = pi * cH - v.scrollY;
      if (cH >= 6) {
        ctx.font = `${isPOC ? "bold" : "normal"} 9px monospace`;
        ctx.fillStyle = isPOC ? "#f5a623" : "#353548";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(p.toFixed(2), priceX + 4, y0 + cH / 2);
      }
    }

    // Crosshair price label
    if (v.mouseY >= 0 && v.mouseY < vpH) {
      const priceIdx = Math.floor((v.mouseY + v.scrollY) / cH);
      if (priceIdx >= 0 && priceIdx < nRows) {
        const labelY = priceIdx * cH - v.scrollY + cH / 2;
        ctx.fillStyle = "#1a2a4a";
        ctx.fillRect(priceX, labelY - 8, PRICE_W, 16);
        ctx.font = "bold 9px monospace";
        ctx.fillStyle = "#ddd";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(allPrices[priceIdx].toFixed(2), priceX + 4, labelY);
      }
    }

    // Last price badge
    {
      const lastBar = olc[buckets[nCols - 1]];
      if (lastBar) {
        const lp = parseFloat((Math.round(lastBar.close / TICK) * TICK).toFixed(2));
        const ly = priceToY(lp) + cH / 2;
        if (ly >= 0 && ly < vpH) {
          const color = lastBar.close >= lastBar.open ? "#22c55e" : "#ef4444";
          ctx.fillStyle = color;
          ctx.fillRect(priceX, ly - 8, PRICE_W, 16);
          ctx.font = "bold 9px monospace";
          ctx.fillStyle = "#fff";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(lp.toFixed(2), priceX + 4, ly);
        }
      }
    }

    ctx.restore();

    ctx.strokeStyle = "#1a1a2c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(priceX + 0.5, 0);
    ctx.lineTo(priceX + 0.5, vpH);
    ctx.stroke();

    // ════════════════════════════════════════════════════════════════════════
    //  SUMMARY FOOTER
    // ════════════════════════════════════════════════════════════════════════
    const sumY = vpH;
    ctx.fillStyle = "#08080e";
    ctx.fillRect(0, sumY, W, FOOTER_H);
    ctx.strokeStyle = "#252538";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, sumY + 0.5);
    ctx.lineTo(W, sumY + 0.5);
    ctx.stroke();

    const labels = [["Delta", "#4477ee"], ["Cum.Δ", "#bb66bb"], ["Vol", "#666"]];
    labels.forEach(([lbl, col], si) => {
      const ry = sumY + si * SUM_ROW_H;
      ctx.fillStyle = "#08080e";
      ctx.fillRect(0, ry + 2, VOL_W, SUM_ROW_H - 2);
      ctx.font = "bold 8px sans-serif";
      ctx.fillStyle = col;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(lbl, VOL_W - 4, ry + SUM_ROW_H / 2);
    });

    ctx.save();
    ctx.beginPath();
    ctx.rect(VOL_W, sumY, vpW, FOOTER_H);
    ctx.clip();

    for (let bi = firstCol; bi <= lastCol; bi++) {
      const s = sums[bi];
      const x0 = VOL_W + bi * cW - v.scrollX;
      const rows = [
        { v: s.delta, col: s.delta >= 0 ? "#4477ee" : "#ee5577", bg: s.delta >= 0 ? "rgba(44,77,238,0.08)" : "rgba(238,55,119,0.08)" },
        { v: s.cumD,  col: s.cumD  >= 0 ? "#bb88ee" : "#ee88bb", bg: s.cumD  >= 0 ? "rgba(130,55,200,0.06)" : "rgba(238,55,130,0.06)" },
        { v: s.vol,   col: "#888", bg: "transparent" },
      ];
      rows.forEach(({ v: val, col, bg }, si) => {
        const ry = sumY + si * SUM_ROW_H;
        if (bg !== "transparent") {
          ctx.fillStyle = bg;
          ctx.fillRect(x0, ry + 2, cW - 1, SUM_ROW_H - 2);
        }
        if (cW >= 15) {
          ctx.font = "bold 9px sans-serif";
          ctx.fillStyle = col;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const pfx = si === 0 && val > 0 ? "+" : "";
          ctx.fillText(pfx + fmt(val), x0 + cW / 2, ry + SUM_ROW_H / 2);
        }
        ctx.strokeStyle = "#111120";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x0, ry + SUM_ROW_H - 0.5);
        ctx.lineTo(x0 + cW, ry + SUM_ROW_H - 0.5);
        ctx.stroke();
      });
    }

    // Time axis
    const timeY = sumY + SUM_ROWS * SUM_ROW_H;
    ctx.fillStyle = "#08080e";
    ctx.fillRect(VOL_W, timeY, vpW, TIME_H);
    ctx.strokeStyle = "#151520";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(VOL_W, timeY + 0.5);
    ctx.lineTo(VOL_W + vpW, timeY + 0.5);
    ctx.stroke();

    for (let bi = firstCol; bi <= lastCol; bi++) {
      const x0 = VOL_W + bi * cW - v.scrollX;
      if (cW < 15 && bi % 3 !== 0) continue;
      const isLive = bi === nCols - 1;
      ctx.font = `${isLive ? "bold" : "normal"} 9px sans-serif`;
      ctx.fillStyle = isLive ? "#4488ff" : "#282840";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(buckets[bi].slice(11, 16), x0 + cW / 2, timeY + TIME_H / 2);
    }

    // Crosshair time label
    if (v.mouseX >= VOL_W && v.mouseX < VOL_W + vpW) {
      const colIdx = Math.floor((v.mouseX - VOL_W + v.scrollX) / cW);
      if (colIdx >= 0 && colIdx < nCols) {
        const labelX = VOL_W + colIdx * cW - v.scrollX + cW / 2;
        ctx.fillStyle = "#1a2a4a";
        ctx.fillRect(labelX - 18, timeY + 2, 36, TIME_H - 4);
        ctx.font = "bold 9px sans-serif";
        ctx.fillStyle = "#ddd";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(buckets[colIdx].slice(11, 16), labelX, timeY + TIME_H / 2);
      }
    }

    ctx.restore();

    // Hover bar computation
    if (v.mouseX >= VOL_W && v.mouseX < VOL_W + vpW) {
      const colIdx = Math.floor((v.mouseX - VOL_W + v.scrollX) / cW);
      if (colIdx >= 0 && colIdx < nCols) {
        const bar = olc[buckets[colIdx]];
        if (bar) hoverBarRef.current = { o: bar.open, h: bar.high, l: bar.low, c: bar.close };
      }
    } else {
      const lastBar = olc[buckets[nCols - 1]];
      if (lastBar) hoverBarRef.current = { o: lastBar.open, h: lastBar.high, l: lastBar.low, c: lastBar.close };
    }
  }, []);

  const scheduleDraw = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
  }, [draw]);

  // ── Mouse interaction ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const v = view.current;

    function getDragZone(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= rect.width - PRICE_W && y < rect.height - FOOTER_H) return "price";
      if (y >= rect.height - FOOTER_H) return "time";
      return "grid";
    }

    function onMouseDown(e) {
      v.dragging = true;
      v.dragZone = getDragZone(e);
      v.lastX = e.clientX;
      v.lastY = e.clientY;
      canvas.style.cursor = v.dragZone === "grid" ? "grabbing" : v.dragZone === "time" ? "ew-resize" : "ns-resize";
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      v.mouseX = e.clientX - rect.left;
      v.mouseY = e.clientY - rect.top;

      if (hoverBarRef.current) setHoverBar({ ...hoverBarRef.current });

      if (v.dragging) {
        const dx = e.clientX - v.lastX;
        const dy = e.clientY - v.lastY;

        if (v.dragZone === "price") {
          const zf = 1 - dy * 0.005;
          const oldCH = v.cH;
          v.cH = Math.max(MIN_CH, Math.min(MAX_CH, v.cH * zf));
          v.scrollY = (v.scrollY + v.mouseY) * (v.cH / oldCH) - v.mouseY;
        } else if (v.dragZone === "time") {
          const zf = 1 + dx * 0.005;
          const oldCW = v.cW;
          v.cW = Math.max(MIN_CW, Math.min(MAX_CW, v.cW * zf));
          v.scrollX = (v.scrollX + v.mouseX - VOL_W) * (v.cW / oldCW) - (v.mouseX - VOL_W);
        } else {
          v.scrollX -= dx;
          v.scrollY -= dy;
        }

        v.lastX = e.clientX;
        v.lastY = e.clientY;
        v.userScrolled = true;
        v.lastInteraction = Date.now();
      } else {
        const zone = getDragZone(e);
        canvas.style.cursor = zone === "price" ? "ns-resize" : zone === "time" ? "ew-resize" : "crosshair";
      }
      scheduleDraw();
    }

    function onMouseUp() { v.dragging = false; v.dragZone = null; canvas.style.cursor = "crosshair"; }

    function onMouseLeave() {
      v.dragging = false;
      v.dragZone = null;
      v.mouseX = -1;
      v.mouseY = -1;
      canvas.style.cursor = "crosshair";
      scheduleDraw();
      if (hoverBarRef.current) setHoverBar({ ...hoverBarRef.current });
    }

    function onWheel(e) {
      e.preventDefault();
      const zf = e.deltaY > 0 ? 0.94 : 1.06;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - VOL_W;
      const my = e.clientY - rect.top;

      if (!e.ctrlKey) {
        const oldCH = v.cH;
        v.cH = Math.max(MIN_CH, Math.min(MAX_CH, v.cH * zf));
        v.scrollY = (v.scrollY + my) * (v.cH / oldCH) - my;
      }
      if (!e.shiftKey) {
        const oldCW = v.cW;
        v.cW = Math.max(MIN_CW, Math.min(MAX_CW, v.cW * zf));
        v.scrollX = (v.scrollX + mx) * (v.cW / oldCW) - mx;
      }
      v.userScrolled = true;
      v.lastInteraction = Date.now();
      scheduleDraw();
    }

    function onDblClick() {
      v.cW = DEFAULT_CW;
      v.cH = DEFAULT_CH;
      v.userScrolled = false;
      v.lastInteraction = 0;
      scheduleDraw();
    }

    canvas.style.cursor = "crosshair";
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("dblclick", onDblClick);
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("dblclick", onDblClick);
    };
  }, [scheduleDraw]);

  // ── Resize ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const dpr = window.devicePixelRatio || 1;
      const c = canvasRef.current;
      if (!c) return;
      c.width = Math.floor(width * dpr);
      c.height = Math.floor(height * dpr);
      cssSize.current = { w: width, h: height };
      scheduleDraw();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [scheduleDraw]);

  // ── Load demo data (used as fallback while live history is being fetched) ──
  const loadData = useCallback((_sym, tf) => {
    // Crude default base price — overwritten the moment Binance klines arrive
    const { ohlc, candles } = genDemo(100, 600, tf);
    candlesRef.current = candles;
    ohlcRef.current = ohlc;
    view.current.userScrolled = false;
    setDataMode("demo");
    scheduleDraw();
  }, [scheduleDraw]);

  useEffect(() => { loadData(ticker, timeframe); }, [ticker, loadData]); // eslint-disable-line

  // ── Binance live data feed (WebSocket trades + depth + REST history) ──
  // Reconnects whenever the symbol changes. Timeframe changes are handled by
  // the re-bucket effect below (they don't need a reconnect).
  useEffect(() => {
    let ws, timer, abort = false;
    const sym = ticker.toLowerCase();

    // 1) Backfill OHLC history from REST klines (1m, latest 500 bars)
    (async () => {
      try {
        const res = await fetch(
          `${BINANCE_REST_BASE}/klines?symbol=${ticker}&interval=1m&limit=500`
        );
        if (!res.ok) throw new Error(`klines ${res.status}`);
        const klines = await res.json();
        if (abort) return;

        // Derive tick size from the most recent close (1/1000th of price, snapped to 1-2-5)
        const lastClose = klines.length ? parseFloat(klines[klines.length - 1][4]) : 0;
        TICK = autoTick(lastClose);
        // Binance kline: [openTime, open, high, low, close, volume, closeTime, ...]
        const candles = klines.map((k) => ({
          time: new Date(k[0]).toISOString().slice(0, 16),
          o: parseFloat(k[1]),
          h: parseFloat(k[2]),
          l: parseFloat(k[3]),
          c: parseFloat(k[4]),
          v: parseFloat(k[5]),
        }));
        const tf = timeframeRef.current;
        historyRef.current = candles;
        candlesRef.current = {};
        ohlcRef.current = {};
        candles.forEach((c) =>
          processHistoryCandle(candlesRef.current, ohlcRef.current, c, tf)
        );
        rawTradesRef.current = [];
        view.current.userScrolled = false;
        setDataMode("live");
        scheduleDraw();
      } catch (err) {
        // History fetch failed — leave demo data in place
        console.warn("Binance klines fetch failed:", err.message);
      }
    })();

    function connect() {
      // Combined stream: trades + depth (top 20 levels, 100ms diff cadence)
      const streams = [`${sym}@trade`, `${sym}@depth20@100ms`].join("/");
      ws = new WebSocket(`${BINANCE_WS_BASE}${streams}`);

      ws.onopen = () => {
        setStatus("connected");
        setDataMode("live");
      };
      ws.onerror = () => setStatus("error");
      ws.onclose = () => {
        setStatus("disconnected");
        if (!abort) timer = setTimeout(connect, 5000);
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          const stream = msg.stream;
          const data = msg.data;
          if (!stream || !data) return;
          const tf = timeframeRef.current;

          if (stream.endsWith("@trade")) {
            // Binance trade: m=true means buyer is maker → market sell into bid.
            // m=false means buyer took the offer → market buy lifting ask.
            const price = parseFloat(data.p);
            const qty = parseFloat(data.q);
            const isBuyerMaker = data.m;
            const trade = {
              type: "trade",
              timestamp: new Date(data.T).toISOString(),
              price,
              bid_volume: isBuyerMaker ? qty : 0,
              ask_volume: isBuyerMaker ? 0 : qty,
            };
            rawTradesRef.current.push(trade);
            if (rawTradesRef.current.length > 50000) {
              rawTradesRef.current = rawTradesRef.current.slice(-40000);
            }
            bucketTrade(candlesRef.current, ohlcRef.current, trade, tf);

            const vw = view.current;
            if (
              vw.userScrolled &&
              vw.lastInteraction &&
              Date.now() - vw.lastInteraction > 5000
            ) {
              vw.userScrolled = false;
            }
            scheduleDraw();
            return;
          }

          if (stream.endsWith("@depth20@100ms")) {
            // Binance depth20: { bids: [[price, qty], ...], asks: [[price, qty], ...] }
            bookRef.current = {
              bids: (data.bids || []).map(([p, q]) => ({
                price: parseFloat(p),
                size: parseFloat(q),
                orderCount: 0, // L2 only — Binance doesn't expose order counts
              })),
              asks: (data.asks || []).map(([p, q]) => ({
                price: parseFloat(p),
                size: parseFloat(q),
                orderCount: 0,
              })),
            };
            scheduleDraw();
            return;
          }
        } catch {}
      };
    }

    connect();
    return () => {
      abort = true;
      clearTimeout(timer);
      if (ws) ws.close();
    };
  }, [ticker, scheduleDraw]);

  // ── Timeframe change — re-bucket without WS reconnect ──
  useEffect(() => {
    if (dataMode === "live") {
      candlesRef.current = {};
      ohlcRef.current = {};
      historyRef.current.forEach(c => processHistoryCandle(candlesRef.current, ohlcRef.current, c, timeframe));
      rawTradesRef.current.forEach(d => bucketTrade(candlesRef.current, ohlcRef.current, d, timeframe));
      view.current.userScrolled = false;
      scheduleDraw();
    } else {
      loadData(ticker, timeframe);
    }
  }, [timeframe]); // eslint-disable-line

  // ── Countdown ──
  useEffect(() => {
    const mins = tfMinutes(timeframe);
    const interval = setInterval(() => {
      const now = new Date();
      const totalMsInDay = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
      const candleMs = mins * 60000;
      const msRemaining = candleMs - (totalMsInDay % candleMs);
      const totalSec = Math.ceil(msRemaining / 1000);
      if (totalSec >= 3600) {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        setCountdown(`${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
      } else {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        setCountdown(`${m}:${s.toString().padStart(2, "0")}`);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [timeframe]);

  // ── Snap button + hoverbar sync ──
  useEffect(() => {
    const iv = setInterval(() => {
      setShowSnap(view.current.userScrolled);
      if (hoverBarRef.current && !hoverBar) setHoverBar({ ...hoverBarRef.current });
    }, 300);
    return () => clearInterval(iv);
  }, [hoverBar]);

  const snapToLatest = useCallback(() => {
    view.current.userScrolled = false;
    view.current.lastInteraction = 0;
    setShowSnap(false);
    scheduleDraw();
  }, [scheduleDraw]);

  // ── Stats grid data ──────────────────────────────────────────────────
  // Reads from candlesRef on each statsTick (1s interval) and computes
  // per-bucket order-flow stats for the most recent 12 candles.
  const statsBuckets = (() => {
    const can = candlesRef.current || {};
    const olc = ohlcRef.current || {};
    const keys = Object.keys(can).sort().slice(-12);
    return keys.map((k) => {
      let ask = 0, bid = 0, max = 0, min = Infinity, trades = 0;
      Object.values(can[k] || {}).forEach((c) => {
        ask += c.a || 0;
        bid += c.b || 0;
        const lvl = (c.a || 0) + (c.b || 0);
        if (lvl > max) max = lvl;
        if (lvl < min && lvl > 0) min = lvl;
        if (lvl > 0) trades++;
      });
      const vol = ask + bid;
      const delta = ask - bid;
      return {
        bucket: k,
        time: k.slice(11, 16),
        ask, bid, vol, delta,
        max: max || 0,
        min: min === Infinity ? 0 : min,
        deltaVol: vol > 0 ? (delta / vol) : 0,
        trades,
        avgTrade: trades > 0 ? Math.round(vol / trades) : 0,
        bar: olc[k] || null,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })();
  // Reference statsTick to satisfy the lint and force re-computation
  // eslint-disable-next-line no-unused-expressions
  statsTick;

  // Format display label from the ticker (BTCUSDT → BTC/USDT, ETHBTC → ETH/BTC, etc.)
  const symbolMeta = symbols.find((s) => s.symbol === ticker);
  const label = symbolMeta
    ? `${symbolMeta.base}/${symbolMeta.quote}`
    : ticker;
  const info = symbolMeta
    ? { name: symbolMeta.base, exchange: "Binance" }
    : { name: "", exchange: "Binance" };

  // Filter symbols by the user's search input (debounce-free, list is in-memory)
  const filteredSymbols = (() => {
    const q = tickerQuery.trim().toUpperCase();
    if (!q) return symbols.slice(0, 100);
    return symbols
      .filter((s) => s.symbol.includes(q) || s.base.includes(q))
      .slice(0, 100);
  })();
  const barUp = hoverBar ? hoverBar.c >= hoverBar.o : false;
  const barColor = barUp ? "#22c55e" : "#ef4444";

  // Menu definitions — Datrena pro-terminal top menu (standard generic categories
  // common to professional desktop trading software).
  const MENUS = {
    File: [
      { label: "New Chart", onClick: () => loadData(ticker, timeframe) },
      { label: "Refresh Data", onClick: () => loadData(ticker, timeframe) },
      { divider: true },
      { label: "Save Workspace", onClick: () => alert("Saving workspaces in a future build") },
      { label: "Open Workspace…", onClick: () => alert("Workspace files in a future build") },
      { divider: true },
      { label: "Exit Datrena", onClick: () => { localStorage.removeItem("datrena_admin"); window.location.href = "/"; } },
    ],
    Edit: [
      { label: "Find Symbol…", onClick: () => { const i = document.querySelector("[data-ticker-input]"); i?.focus(); } },
      { label: "Clear Drawings", onClick: () => alert("Drawing tools in a future build") },
    ],
    View: [
      { label: "Reset Zoom", onClick: () => {
        const v = view.current;
        v.cW = DEFAULT_CW; v.cH = DEFAULT_CH; v.userScrolled = false; v.lastInteraction = 0;
        scheduleDraw();
      }},
      { label: "Snap to Latest", onClick: snapToLatest },
    ],
    Chart: [
      { label: "Footprint Settings", onClick: () => setShowOverlayMenu(true) },
      { label: "Toggle DEMO/Live", onClick: () => alert("Live feed switching coming soon") },
    ],
    Analysis: OVERLAY_DEFS.map((d) => ({
      label: d.label,
      checked: !!overlays[d.key],
      onClick: () => setOverlays((prev) => ({ ...prev, [d.key]: !prev[d.key] })),
    })),
    Tools: [
      { label: "Pointer", icon: MousePointer, onClick: () => alert("Drawing tools in a future build") },
      { label: "Trend Line", icon: PenTool, onClick: () => alert("Drawing tools in a future build") },
      { label: "Horizontal Line", icon: Minus, onClick: () => alert("Drawing tools in a future build") },
      { label: "Text Label", icon: Type, onClick: () => alert("Drawing tools in a future build") },
    ],
    Trade: [
      { label: "Trade Panel (soon)", disabled: true },
      { label: "Position Window (soon)", disabled: true },
    ],
    Window: [
      { label: "Reload Page", onClick: () => window.location.reload() },
      { label: "Full Screen", onClick: () => document.documentElement.requestFullscreen?.() },
    ],
    Help: [
      { label: "About Datrena", onClick: () => alert("Datrena · pro order-flow charting · v0.1.0") },
      { label: "Keyboard Shortcuts", onClick: () => alert("Shift+Z to enter · click 'Exit Admin' to leave") },
    ],
  };

  // Compact toolbar buttons grouped by purpose.
  const ToolBtn = ({ label, icon: Icon, onClick, active, disabled }) => (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={label}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
        background: active ? "#1a2540" : "transparent", border: "1px solid",
        borderColor: active ? "#2a3f6a" : "transparent",
        color: disabled ? "#303040" : active ? "#9bbdff" : "#a0a0b0",
        padding: "3px 5px", minWidth: 36, cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 9, fontFamily: "sans-serif", borderRadius: 2,
      }}
      onMouseEnter={(e) => { if (!disabled && !active) e.currentTarget.style.background = "#16161e"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <Icon size={13} />
      <span style={{ letterSpacing: 0 }}>{label}</span>
    </button>
  );
  const ToolDivider = () => (
    <div style={{ width: 1, alignSelf: "stretch", background: "#1c1c28", margin: "0 3px" }} />
  );

  return (
    <div style={{ height: "100vh", background: "#0a0a10", display: "flex", flexDirection: "column", fontFamily: "monospace", paddingLeft: "4rem", color: "#c0c0d0" }}>
      <MainNav />

      {/* ─────────────────── 1. WINDOW TITLE BAR ─────────────────── */}
      <div style={{
        background: "#15151c", borderBottom: "1px solid #252535",
        padding: "3px 10px", display: "flex", alignItems: "center", gap: 12,
        fontFamily: "sans-serif", fontSize: 10, color: "#8888a0", flexShrink: 0,
      }}>
        <span style={{ color: "#d0d0e0", fontWeight: 700 }}>Datrena</span>
        <span style={{ color: "#5a5a70" }}>·</span>
        <span>Workspace: <span style={{ color: "#c0c0d0" }}>default</span></span>
        <span style={{ color: "#5a5a70" }}>·</span>
        <span>Feed: <span style={{ color: "#c0c0d0" }}>Binance Spot</span></span>
        <span style={{ marginLeft: "auto", color: "#888" }}>
          {now.toLocaleString(undefined, { dateStyle: "short", timeStyle: "medium" })}
        </span>
      </div>

      {/* ─────────────────── 2. MENU BAR ─────────────────── */}
      <div style={{
        background: "#10101a", borderBottom: "1px solid #1a1a28",
        display: "flex", alignItems: "stretch", fontFamily: "sans-serif",
        fontSize: 11, flexShrink: 0, position: "relative", zIndex: 50,
      }}>
        {Object.keys(MENUS).map((name) => (
          <div key={name} style={{ position: "relative" }} data-menu-anchor>
            <button
              onClick={() => setOpenMenu(openMenu === name ? null : name)}
              onMouseEnter={() => openMenu && setOpenMenu(name)}
              style={{
                padding: "4px 11px", background: openMenu === name ? "#1c1c2a" : "transparent",
                border: "none", color: "#c0c0d0", cursor: "pointer", fontSize: 11,
              }}
            >
              <span style={{ textDecoration: "underline", textDecorationColor: "transparent" }}>
                <span style={{ textDecorationColor: "#666", textDecoration: "underline" }}>{name[0]}</span>{name.slice(1)}
              </span>
            </button>
            {openMenu === name && (
              <div data-menu-popup style={{
                position: "absolute", top: "100%", left: 0, minWidth: 200,
                background: "#15151f", border: "1px solid #2a2a3a",
                boxShadow: "0 6px 20px rgba(0,0,0,0.7)", padding: "3px 0", zIndex: 100,
              }}>
                {MENUS[name].map((item, i) => item.divider ? (
                  <div key={i} style={{ height: 1, background: "#2a2a3a", margin: "3px 0" }} />
                ) : (
                  <button
                    key={i}
                    disabled={item.disabled}
                    onClick={() => { item.onClick?.(); setOpenMenu(null); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, width: "100%",
                      padding: "5px 14px", background: "transparent", border: "none",
                      color: item.disabled ? "#444" : "#c0c0d0", fontSize: 11,
                      cursor: item.disabled ? "not-allowed" : "pointer", textAlign: "left",
                    }}
                    onMouseEnter={(e) => { if (!item.disabled) e.currentTarget.style.background = "#1f3a6a"; }}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {item.checked !== undefined && (
                      <span style={{ width: 10, color: item.checked ? "#5ee07a" : "transparent" }}>✓</span>
                    )}
                    {item.icon && <item.icon size={11} />}
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─────────────────── 3. ICON TOOLBAR ─────────────────── */}
      <div style={{
        background: "#0e0e16", borderBottom: "1px solid #1a1a28",
        padding: "2px 6px", display: "flex", alignItems: "center", flexShrink: 0,
        overflowX: "auto",
      }}>
        {/* Symbol group */}
        <ToolBtn label="Find" icon={Search} onClick={() => { document.querySelector("[data-ticker-input]")?.focus(); }} />
        <ToolBtn label="Open" icon={FolderOpen} onClick={() => alert("Workspace files in a future build")} />
        <ToolBtn label="Save" icon={Save} onClick={() => alert("Saving workspaces in a future build")} />
        <ToolBtn label="Close" icon={XIcon} onClick={() => { localStorage.removeItem("datrena_admin"); window.location.href = "/"; }} />
        <ToolDivider />

        {/* Connection */}
        <ToolBtn label="Conn" icon={Wifi} active={status === "connected"} />
        <ToolBtn label="Disc" icon={WifiOff} active={status !== "connected"} />
        <ToolDivider />

        {/* Navigation */}
        <ToolBtn label="First" icon={ChevronsLeft} onClick={() => alert("Bar navigation in a future build")} />
        <ToolBtn label="Prev" icon={CLeft} onClick={() => alert("Bar navigation in a future build")} />
        <ToolBtn label="Next" icon={CRight} onClick={() => alert("Bar navigation in a future build")} />
        <ToolBtn label="Last" icon={ChevronsRight} onClick={snapToLatest} />
        <ToolDivider />

        {/* Chart tools */}
        <ToolBtn label="Settings" icon={Settings} onClick={() => setShowOverlayMenu(true)} />
        <ToolBtn label="Studies" icon={Layers} onClick={() => setOpenMenu("Analysis")} />
        <ToolBtn label="Pointer" icon={MousePointer} onClick={() => alert("Drawing tools in a future build")} />
        <ToolDivider />

        {/* Drawing */}
        <ToolBtn label="Line" icon={PenTool} onClick={() => alert("Drawing tools in a future build")} />
        <ToolBtn label="Hline" icon={Minus} onClick={() => alert("Drawing tools in a future build")} />
        <ToolBtn label="Text" icon={Type} onClick={() => alert("Drawing tools in a future build")} />
        <ToolDivider />

        {/* Replay + values */}
        <ToolBtn label="Replay" icon={Activity} onClick={() => alert("Replay engine in a future build")} />
        <ToolBtn label="Values" icon={FileText} onClick={() => alert("Values window in a future build")} />
        <ToolBtn label="Msgs" icon={MessageSquare} onClick={() => alert("Message log in a future build")} />
        <ToolBtn label="Position" icon={Briefcase} onClick={() => alert("Trade panel in a future build")} />
        <ToolDivider />

        {/* Timeframes */}
        {["1m", "5m", "15m", "30m", "1h", "4h", "D"].map((tf) => (
          <ToolBtn key={tf} label={tf} icon={Clock} active={timeframe === tf} onClick={() => setTimeframe(tf)} />
        ))}
        <ToolDivider />

        {/* Page */}
        <ToolBtn label="Full" icon={Maximize2} onClick={() => document.documentElement.requestFullscreen?.()} />
      </div>

      {/* ─────────────────── 4. WORKSPACE / SYMBOL TABS ─────────────────── */}
      <div style={{
        background: "#0c0c14", borderBottom: "1px solid #1a1a28",
        display: "flex", alignItems: "stretch", fontFamily: "sans-serif", fontSize: 11,
        flexShrink: 0,
      }}>
        {workspaceTabs.map((sym) => (
          <button
            key={sym}
            onClick={() => { setTicker(sym); setTickerQuery(sym); }}
            style={{
              padding: "4px 14px", border: "none", borderRight: "1px solid #1a1a28",
              background: sym === ticker ? "#0a0a10" : "#15151f",
              color: sym === ticker ? "#9bbdff" : "#888",
              cursor: "pointer", fontSize: 10, fontWeight: sym === ticker ? 700 : 400,
              borderTop: sym === ticker ? "2px solid #4a8cff" : "2px solid transparent",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {sym.replace("USDT", "/USDT").toLowerCase()}
            {workspaceTabs.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  const next = workspaceTabs.filter((t) => t !== sym);
                  setWorkspaceTabs(next);
                  if (sym === ticker && next.length > 0) { setTicker(next[0]); setTickerQuery(next[0]); }
                }}
                style={{ color: "#555", fontSize: 11, padding: "0 2px" }}
              >×</span>
            )}
          </button>
        ))}
        <button
          onClick={() => {
            if (!workspaceTabs.includes(ticker)) {
              setWorkspaceTabs([...workspaceTabs, ticker]);
            }
          }}
          title="Add current symbol as a workspace tab"
          style={{
            padding: "4px 8px", border: "none", background: "transparent",
            color: "#555", cursor: "pointer", fontSize: 12,
          }}
        ><Plus size={12} /></button>
      </div>

      {/* ─────────────────── 5. CHART HEADER (per-chart info) ─────────────────── */}
      <div style={{
        borderBottom: "1px solid #151520", background: "#0a0a10", padding: "4px 12px",
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "nowrap", overflow: "hidden",
        fontFamily: "sans-serif",
      }}>
        {/* Ticker info */}
        <span style={{ fontWeight: 700, fontSize: 13, fontFamily: "sans-serif", color: "#c0c0d8" }}>{label}</span>
        <span style={{ color: "#404058", fontSize: 10, fontFamily: "sans-serif", whiteSpace: "nowrap" }}>
          {info.name} · {info.exchange}
        </span>

        {/* OHLC (no volume/delta per user request) */}
        {hoverBar && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontFamily: "sans-serif", whiteSpace: "nowrap" }}>
            <span style={{ color: "#505060" }}>O</span>
            <span style={{ color: barColor, fontWeight: 600 }}>{hoverBar.o.toFixed(2)}</span>
            <span style={{ color: "#505060", marginLeft: 3 }}>H</span>
            <span style={{ color: barColor, fontWeight: 600 }}>{hoverBar.h.toFixed(2)}</span>
            <span style={{ color: "#505060", marginLeft: 3 }}>L</span>
            <span style={{ color: barColor, fontWeight: 600 }}>{hoverBar.l.toFixed(2)}</span>
            <span style={{ color: "#505060", marginLeft: 3 }}>C</span>
            <span style={{ color: barColor, fontWeight: 600 }}>{hoverBar.c.toFixed(2)}</span>
          </div>
        )}

        {/* Timeframe dropdown */}
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          style={{
            background: "#0c0c14", border: "1px solid #1a1a2c", color: "#60a5fa",
            borderRadius: 3, padding: "3px 6px", fontSize: 10, fontFamily: "sans-serif",
            cursor: "pointer", fontWeight: 600,
          }}
        >
          {TIMEFRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
        </select>

        {/* Countdown */}
        <span style={{
          color: "#60a5fa", fontSize: 11, fontFamily: "monospace", fontWeight: 700,
          background: "#0c1020", border: "1px solid #152040", borderRadius: 3,
          padding: "2px 8px", minWidth: 42, textAlign: "center", letterSpacing: 1,
        }}>{countdown}</span>

        {/* Ticker combobox — every Binance trading pair, searchable */}
        <div style={{ position: "relative" }}>
          <input
            data-ticker-input
            value={tickerQuery}
            onChange={(e) => { setTickerQuery(e.target.value.toUpperCase()); setShowTickerMenu(true); }}
            onFocus={() => setShowTickerMenu(true)}
            onBlur={() => setTimeout(() => setShowTickerMenu(false), 150)}
            placeholder="Search ticker"
            style={{
              background: "#0c0c14", border: "1px solid #1a1a2c", color: "#c0c0d8",
              borderRadius: 3, padding: "3px 8px", fontSize: 10, fontFamily: "monospace",
              width: 110, outline: "none",
            }}
          />
          {showTickerMenu && filteredSymbols.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 100,
              background: "#10101a", border: "1px solid #252538", borderRadius: 6,
              minWidth: 180, maxHeight: 280, overflowY: "auto",
              boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
            }}>
              {filteredSymbols.map((s) => (
                <button
                  key={s.symbol}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setTicker(s.symbol);
                    setTickerQuery(s.symbol);
                    setShowTickerMenu(false);
                  }}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    width: "100%", padding: "6px 10px", background: s.symbol === ticker ? "#152040" : "none",
                    border: "none", color: "#c0c0d8", fontSize: 11, fontFamily: "monospace",
                    cursor: "pointer", textAlign: "left",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#1a1a2c"}
                  onMouseLeave={(e) => e.currentTarget.style.background = s.symbol === ticker ? "#152040" : "transparent"}
                >
                  <span style={{ fontWeight: 600 }}>{s.base}<span style={{ color: "#5a5a6c" }}>/{s.quote}</span></span>
                  <span style={{ color: "#404058", fontSize: 9 }}>{s.symbol}</span>
                </button>
              ))}
              {symbols.length > 0 && filteredSymbols.length === 100 && (
                <div style={{ padding: "6px 10px", fontSize: 9, color: "#404058", borderTop: "1px solid #252538" }}>
                  Showing first 100 of {symbols.length} matches — refine search
                </div>
              )}
            </div>
          )}
          {symbols.length === 0 && (
            <span style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, fontSize: 9, color: "#404058" }}>
              Loading {symbols.length || "all"} pairs…
            </span>
          )}
        </div>

        {/* MBO Overlay dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowOverlayMenu(!showOverlayMenu)}
            style={{
              background: showOverlayMenu ? "#151520" : "#0c0c14",
              border: "1px solid #1a1a2c", color: "#606078", borderRadius: 3,
              padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "sans-serif",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <Layers size={10} /> MBO <ChevronDown size={8} />
          </button>
          {showOverlayMenu && (
            <div style={{
              position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 100,
              background: "#10101a", border: "1px solid #252538", borderRadius: 6,
              padding: "4px 0", minWidth: 230, boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
            }}>
              {OVERLAY_DEFS.map(d => (
                <button
                  key={d.key}
                  onClick={() => setOverlays(prev => ({ ...prev, [d.key]: !prev[d.key] }))}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, width: "100%",
                    padding: "7px 12px", background: "none", border: "none",
                    color: overlays[d.key] ? "#c0c0d8" : "#606078",
                    fontSize: 11, fontFamily: "sans-serif", cursor: "pointer", textAlign: "left",
                  }}
                >
                  {overlays[d.key]
                    ? <Eye size={12} style={{ color: "#22c55e" }} />
                    : <EyeOff size={12} style={{ color: "#303040" }} />}
                  <span style={{ flex: 1 }}>{d.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => loadData(ticker, timeframe)}
          style={{ background: "none", border: "none", color: "#303048", cursor: "pointer", padding: "2px 4px", display: "flex", alignItems: "center" }}>
          <RefreshCw size={12} />
        </button>

        {/* Right side: status */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, fontFamily: "sans-serif" }}>
          {dataMode === "demo" && (
            <span style={{ color: "#f59e0b", fontSize: 9, padding: "1px 6px", border: "1px solid #453000", borderRadius: 3, background: "#1a1500" }}>
              DEMO
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {status === "connected"
              ? <Wifi size={11} style={{ color: "#22c55e" }} />
              : <WifiOff size={11} style={{ color: "#282838" }} />}
            <span style={{ color: status === "connected" ? "#22c55e" : "#282838", fontSize: 10 }}>
              {status === "connected" ? "MBO Live" : "offline"}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────── 6. CANVAS ─────────────────── */}
      <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 200 }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        {showSnap && (
          <button
            onClick={snapToLatest}
            style={{
              position: "absolute", bottom: 20, right: 70,
              background: "#12203a", border: "1px solid #1a3a6a", borderRadius: 6,
              color: "#60a5fa", padding: "6px 10px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 11, fontFamily: "sans-serif", fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)", zIndex: 10,
            }}
            title="Snap to latest candle"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>

      {/* ─────────────────── 7. STATS GRID (per-candle order flow) ─────────────────── */}
      <div style={{
        background: "#0a0a10", borderTop: "1px solid #1a1a28",
        flexShrink: 0, overflowX: "auto", fontFamily: "monospace", fontSize: 10,
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "max-content" }}>
          <tbody>
            {[
              { label: "delta",         get: (s) => s.delta,    color: (v) => v >= 0 ? "#4488ee" : "#ee5577", fmtSign: true },
              { label: "Ask Vol",       get: (s) => s.ask,      color: () => "#5ee07a" },
              { label: "Bid Vol",       get: (s) => s.bid,      color: () => "#ef8888" },
              { label: "Max",           get: (s) => s.max,      color: () => "#c0c0d0" },
              { label: "Min",           get: (s) => s.min,      color: () => "#888" },
              { label: "delta / vol",   get: (s) => s.deltaVol, color: (v) => v >= 0 ? "#4488ee" : "#ee5577", pct: true },
              { label: "Num Trades",    get: (s) => s.trades,   color: () => "#a0a0c0" },
              { label: "avg trade vol", get: (s) => s.avgTrade, color: () => "#c0c0d0" },
              { label: "vol",           get: (s) => s.vol,      color: () => "#9090a0", bold: true },
            ].map((row) => (
              <tr key={row.label} style={{ borderBottom: "1px solid #14141c" }}>
                <td style={{
                  background: "#0c0c14", color: "#666", padding: "1px 8px",
                  textAlign: "right", fontSize: 9, fontFamily: "sans-serif",
                  borderRight: "1px solid #1a1a28", minWidth: 96, whiteSpace: "nowrap",
                  position: "sticky", left: 0, zIndex: 1,
                }}>
                  {row.label}
                </td>
                {statsBuckets.map((s) => {
                  const val = row.get(s);
                  const colored = row.color(val);
                  const display = row.pct
                    ? `${val >= 0 ? "+" : ""}${(val * 100).toFixed(1)}%`
                    : row.fmtSign
                      ? `${val > 0 ? "+" : ""}${fmt(val)}`
                      : fmt(val);
                  return (
                    <td key={s.bucket} style={{
                      padding: "1px 6px", textAlign: "center", minWidth: 56,
                      color: colored, fontWeight: row.bold ? 700 : 500,
                      borderRight: "1px solid #14141c",
                    }}>
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Time row */}
            <tr style={{ background: "#0c0c14" }}>
              <td style={{
                color: "#555", padding: "2px 8px", textAlign: "right",
                fontSize: 9, fontFamily: "sans-serif",
                borderRight: "1px solid #1a1a28", position: "sticky", left: 0, zIndex: 1,
              }}>
                {now.toISOString().slice(0, 10)}
              </td>
              {statsBuckets.map((s, i) => (
                <td key={s.bucket} style={{
                  padding: "2px 6px", textAlign: "center", color: i === statsBuckets.length - 1 ? "#4488ff" : "#555",
                  fontSize: 9, fontFamily: "sans-serif", borderRight: "1px solid #14141c",
                  fontWeight: i === statsBuckets.length - 1 ? 700 : 400,
                }}>
                  {s.time}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─────────────────── 8. BOTTOM CHART TABS ─────────────────── */}
      <div style={{
        background: "#10101a", borderTop: "1px solid #1a1a28",
        display: "flex", alignItems: "stretch", fontFamily: "sans-serif", fontSize: 10,
        flexShrink: 0,
      }}>
        <div style={{
          padding: "3px 14px", background: "#0a0a10",
          color: "#9bbdff", borderRight: "1px solid #1a1a28",
          fontWeight: 700, borderTop: "2px solid #4a8cff",
        }}>
          {ticker.replace("USDT", "/USDT")} · {timeframe} Footprint
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: "3px 12px", color: "#666", fontSize: 9 }}>
          {symbols.length > 0 ? `${symbols.length} symbols loaded` : "Loading symbols…"}
        </div>
      </div>

      {/* ─────────────────── 9. STATUS BAR ─────────────────── */}
      <div style={{
        background: "#0c0c14", borderTop: "1px solid #1a1a28",
        padding: "2px 10px", display: "flex", alignItems: "center", gap: 14,
        fontFamily: "sans-serif", fontSize: 9, color: "#666", flexShrink: 0,
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {status === "connected"
            ? <Wifi size={9} style={{ color: "#22c55e" }} />
            : <WifiOff size={9} style={{ color: "#666" }} />}
          <span style={{ color: status === "connected" ? "#22c55e" : "#888" }}>
            {status === "connected" ? "Binance WS · live" : "Disconnected"}
          </span>
        </span>
        <span>·</span>
        <span>Buckets: <span style={{ color: "#aaa" }}>{Object.keys(candlesRef.current || {}).length}</span></span>
        <span>·</span>
        <span>Trades: <span style={{ color: "#aaa" }}>{rawTradesRef.current?.length || 0}</span></span>
        <span>·</span>
        <span>Tick: <span style={{ color: "#aaa" }}>{TICK}</span></span>
        <span style={{ marginLeft: "auto" }}>
          Next candle: <span style={{ color: "#60a5fa", fontWeight: 600 }}>{countdown}</span>
        </span>
        <span>·</span>
        <span style={{ color: "#888" }}>{now.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
