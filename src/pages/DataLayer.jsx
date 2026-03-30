import React, { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, Wifi, WifiOff, ChevronsRight } from "lucide-react";
import MainNav from "../components/navigation/MainNav";

// ── Config ────────────────────────────────────────────────────────────────────
const WS_URL = "ws://localhost:8080";
const TICK   = 0.25;
const IMB    = 3;

// Fixed layout (px)
const VOL_W   = 52;
const PRICE_W = 58;
const SUM_ROWS  = 3;   // Delta, CumΔ, Vol
const SUM_ROW_H = 20;
const TIME_H    = 22;
const FOOTER_H  = SUM_ROWS * SUM_ROW_H + TIME_H;

// Zoom limits
const MIN_CW = 30;
const MAX_CW = 150;
const MIN_CH = 10;
const MAX_CH = 40;
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

const BASES = { "ES=F": 5812, "NQ=F": 20150, "CL=F": 72.5, "GC=F": 2340 };

const TICKER_INFO = {
  "ES=F": { name: "S&P 500 E-mini Futures", exchange: "CME", tick: "0.25" },
  "NQ=F": { name: "Nasdaq 100 E-mini Futures", exchange: "CME", tick: "0.25" },
  "CL=F": { name: "Crude Oil Futures", exchange: "NYMEX", tick: "0.01" },
  "GC=F": { name: "Gold Futures", exchange: "COMEX", tick: "0.10" },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function DataLayer() {
  const [status,    setStatus]    = useState("disconnected");
  const [ticker,    setTicker]    = useState("ES=F");
  const [timeframe, setTimeframe] = useState("5m");
  const [dataMode,  setDataMode]  = useState("demo");

  const [countdown,  setCountdown]  = useState("");
  const [showSnap,   setShowSnap]   = useState(false);
  const [hoverBar,   setHoverBar]   = useState(null); // { o, h, l, c, vol, delta }
  const snapTimerRef = useRef(null);
  const hoverBarRef  = useRef(null);

  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const candlesRef   = useRef({});
  const ohlcRef      = useRef({});
  const rafRef       = useRef(null);
  const cssSize      = useRef({ w: 0, h: 0 });

  // ── View state (pan/zoom) ──
  const view = useRef({
    cW: DEFAULT_CW,  // cell width
    cH: DEFAULT_CH,  // cell height
    scrollX: 0,      // px scrolled into grid (0 = right edge shows latest)
    scrollY: 0,      // px scrolled down (0 = top of price range)
    dragging: false,
    dragZone: null,  // "grid" | "price" | "time"
    lastX: 0,
    lastY: 0,
    userScrolled: false, // once true, don't auto-scroll on new data
    lastInteraction: 0,  // timestamp of last user pan/zoom
    mouseX: -1,      // crosshair position
    mouseY: -1,
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

    const buckets = Object.keys(can).sort();
    const priceSet = new Set();
    buckets.forEach(b => Object.keys(can[b] || {}).forEach(p => priceSet.add(+p)));
    const allPrices = Array.from(priceSet).sort((a, b) => b - a);

    ctx.fillStyle = "#0e0e14";
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

    // Viewport dimensions (the scrollable area between axes)
    const vpW = W - VOL_W - PRICE_W;
    const vpH = H - FOOTER_H;

    // Total grid size
    const totalW = nCols * cW;
    const totalH = nRows * cH;

    // Auto-scroll: show latest candles right-aligned, track current price vertically
    if (!v.userScrolled) {
      v.scrollX = Math.max(0, totalW - vpW);
      // Center on the latest candle's close price
      const lastBucket = buckets[buckets.length - 1];
      const lastBar = olc[lastBucket];
      if (lastBar) {
        const closeP = parseFloat((Math.round(lastBar.close / TICK) * TICK).toFixed(2));
        const closeIdx = allPrices.indexOf(closeP);
        if (closeIdx >= 0) {
          v.scrollY = Math.max(0, closeIdx * cH - vpH / 2);
        } else {
          v.scrollY = Math.max(0, (totalH - vpH) / 2);
        }
      } else {
        v.scrollY = Math.max(0, (totalH - vpH) / 2);
      }
    }

    // Clamp scroll — allow dragging past latest candle (extra half-viewport of empty space)
    const maxScrollX = totalW + vpW / 2;
    const minScrollX = -vpW / 2;
    v.scrollX = Math.max(minScrollX, Math.min(maxScrollX, v.scrollX));
    v.scrollY = Math.max(0, Math.min(Math.max(0, totalH - vpH), v.scrollY));

    // Visible range
    const firstCol = Math.max(0, Math.floor(v.scrollX / cW));
    const lastCol  = Math.min(nCols - 1, Math.ceil((v.scrollX + vpW) / cW));
    const firstRow = Math.max(0, Math.floor(v.scrollY / cH));
    const lastRow  = Math.min(nRows - 1, Math.ceil((v.scrollY + vpH) / cH));

    // Volume profile (across ALL candles, not just visible)
    const vp = {};
    buckets.forEach(b => Object.entries(can[b] || {}).forEach(([p, c]) => {
      vp[p] = (vp[p] || 0) + c.b + c.a;
    }));
    const maxV = Math.max(...Object.values(vp), 1);
    const pocP = allPrices.reduce((best, p) => (vp[p] || 0) > (vp[best] || 0) ? p : best, allPrices[0]);

    // Per-candle summaries (all candles for footer)
    let cumD = 0;
    const sums = buckets.map(b => {
      const cells = can[b] || {};
      let ask = 0, bid = 0;
      Object.values(cells).forEach(c => { ask += c.a; bid += c.b; });
      const delta = ask - bid;
      cumD += delta;
      return { ask, bid, delta, cumD, vol: ask + bid };
    });

    const fs = cH <= 16 ? 9 : 10;

    // ══════════════════════════════════════════════════════════════════════════
    //  MAIN GRID — clipped to viewport
    // ══════════════════════════════════════════════════════════════════════════
    ctx.save();
    ctx.beginPath();
    ctx.rect(VOL_W, 0, vpW, vpH);
    ctx.clip();

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

      // Subtle column separator (only every 5th candle for reference)
      if (bi % 5 === 0) {
        ctx.strokeStyle = "rgba(30,30,45,0.3)";
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

        // Cell background (semi-transparent)
        if (tot > 0) {
          const askDom = cell.a >= cell.b;
          const intensity = Math.min(Math.max(cell.b, cell.a) / 200, 1);
          const alpha = 0.25 + intensity * 0.3;
          if (askDom) {
            ctx.fillStyle = `rgba(30,${Math.round(60 + intensity * 80)},30,${alpha})`;
          } else {
            ctx.fillStyle = `rgba(${Math.round(70 + intensity * 80)},25,25,${alpha})`;
          }
          ctx.fillRect(x0, y0, cW, cH);
        } else if (inBody) {
          ctx.fillStyle = green ? "rgba(22,80,34,0.08)" : "rgba(80,22,22,0.08)";
          ctx.fillRect(x0, y0, cW, cH);
        }

        if (isPOC && tot > 0) {
          ctx.fillStyle = "rgba(255,200,0,0.06)";
          ctx.fillRect(x0, y0, cW, cH);
        }

        if (!cell || tot === 0) continue;

        const askDom = cell.a >= cell.b;
        const ratio = askDom ? (cell.b > 0 ? cell.a / cell.b : 999) : (cell.a > 0 ? cell.b / cell.a : 999);
        const imb = tot > 5 && ratio >= IMB;

        // Imbalance border
        if (imb) {
          ctx.strokeStyle = askDom ? "rgba(0,180,60,0.9)" : "rgba(220,40,40,0.9)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x0 + 0.5, y0 + 0.5, cW - 2, cH - 2);
        }

        // Bid [candle] Ask
        const midY = y0 + cH / 2;
        const midX = x0 + cW / 2;
        ctx.textBaseline = "middle";

        // Bid
        ctx.font = `${!askDom ? "bold" : "normal"} ${fs}px monospace`;
        ctx.fillStyle = !askDom ? "#ff8888" : "#889988";
        ctx.textAlign = "right";
        ctx.fillText(String(cell.b), midX - 5, midY);

        // Mini candlestick (full height, no gaps)
        if (inRange) {
          const candleW = 5;
          const cx = midX - candleW / 2;
          if (inBody) {
            ctx.fillStyle = green ? "rgba(34,221,102,0.7)" : "rgba(238,68,68,0.7)";
            ctx.fillRect(cx, y0, candleW, cH);
          } else {
            ctx.strokeStyle = green ? "rgba(34,221,102,0.5)" : "rgba(238,68,68,0.5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(midX, y0);
            ctx.lineTo(midX, y0 + cH);
            ctx.stroke();
          }
        }

        // Ask
        ctx.font = `${askDom ? "bold" : "normal"} ${fs}px monospace`;
        ctx.fillStyle = askDom ? "#66ee88" : "#889988";
        ctx.textAlign = "left";
        ctx.fillText(String(cell.a), midX + 5, midY);
      }

      // Live glow
      if (isLive) {
        ctx.strokeStyle = "rgba(60,140,255,0.4)";
        ctx.lineWidth = 1.5;
        const y1 = firstRow * cH - v.scrollY;
        const y2 = (lastRow + 1) * cH - v.scrollY;
        ctx.strokeRect(x0 + 0.5, y1, cW - 2, y2 - y1);
      }
    }

    // ── Crosshair ──
    if (v.mouseX >= VOL_W && v.mouseX < VOL_W + vpW && v.mouseY >= 0 && v.mouseY < vpH) {
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(VOL_W, v.mouseY);
      ctx.lineTo(VOL_W + vpW, v.mouseY);
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo(v.mouseX, 0);
      ctx.lineTo(v.mouseX, vpH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore(); // end clip

    // ══════════════════════════════════════════════════════════════════════════
    //  VOLUME PROFILE (left, scrolls vertically)
    // ══════════════════════════════════════════════════════════════════════════
    ctx.fillStyle = "#0a0a10";
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

      ctx.globalAlpha = 0.55;
      ctx.fillStyle = isPOC ? "#b060ff" : "#1a5090";
      ctx.fillRect(VOL_W - bw - 2, y0 + 1, bw, Math.max(1, cH - 2));
      ctx.globalAlpha = 1;

      if (vol > 0) {
        ctx.font = `${isPOC ? "bold" : "normal"} 8px monospace`;
        ctx.fillStyle = isPOC ? "#d4a0ff" : "#6688aa";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(fmt(vol), VOL_W - 4, y0 + cH / 2);
      }

    }
    ctx.restore();

    // Vol/grid border
    ctx.strokeStyle = "#252538";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(VOL_W - 0.5, 0);
    ctx.lineTo(VOL_W - 0.5, vpH);
    ctx.stroke();

    // ══════════════════════════════════════════════════════════════════════════
    //  PRICE AXIS (right, scrolls vertically)
    // ══════════════════════════════════════════════════════════════════════════
    const priceX = W - PRICE_W;
    ctx.fillStyle = "#0a0a10";
    ctx.fillRect(priceX, 0, PRICE_W, vpH);

    ctx.save();
    ctx.beginPath();
    ctx.rect(priceX, 0, PRICE_W, vpH);
    ctx.clip();

    for (let pi = firstRow; pi <= lastRow; pi++) {
      const p = allPrices[pi];
      const isPOC = Math.abs(p - pocP) < 0.001;
      const y0 = pi * cH - v.scrollY;
      ctx.font = `${isPOC ? "bold" : "normal"} 9px monospace`;
      ctx.fillStyle = isPOC ? "#f5a623" : "#404058";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(p.toFixed(2), priceX + 4, y0 + cH / 2);
    }

    // Crosshair price label
    if (v.mouseY >= 0 && v.mouseY < vpH) {
      const priceIdx = Math.floor((v.mouseY + v.scrollY) / cH);
      if (priceIdx >= 0 && priceIdx < nRows) {
        const labelY = priceIdx * cH - v.scrollY + cH / 2;
        ctx.fillStyle = "#2a3a5a";
        ctx.fillRect(priceX, labelY - 8, PRICE_W, 16);
        ctx.font = "bold 9px monospace";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(allPrices[priceIdx].toFixed(2), priceX + 4, labelY);
      }
    }

    ctx.restore();

    ctx.strokeStyle = "#252538";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(priceX + 0.5, 0);
    ctx.lineTo(priceX + 0.5, vpH);
    ctx.stroke();

    // ══════════════════════════════════════════════════════════════════════════
    //  SUMMARY FOOTER (bottom, scrolls horizontally)
    // ══════════════════════════════════════════════════════════════════════════
    const sumY = vpH;

    // Background
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, sumY, W, FOOTER_H);

    // Separator
    ctx.strokeStyle = "#333348";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, sumY + 1);
    ctx.lineTo(W, sumY + 1);
    ctx.stroke();

    // Labels
    const labels = [["Delta", "#5588ff"], ["Cum.Δ", "#cc66cc"], ["Vol", "#888888"]];
    labels.forEach(([lbl, col], si) => {
      const ry = sumY + si * SUM_ROW_H;
      ctx.fillStyle = "#0a0a12";
      ctx.fillRect(0, ry + 2, VOL_W, SUM_ROW_H - 2);
      ctx.font = "bold 8px sans-serif";
      ctx.fillStyle = col;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(lbl, VOL_W - 4, ry + SUM_ROW_H / 2);
    });

    // Per-candle values (clipped to viewport width)
    ctx.save();
    ctx.beginPath();
    ctx.rect(VOL_W, sumY, vpW, FOOTER_H);
    ctx.clip();

    for (let bi = firstCol; bi <= lastCol; bi++) {
      const s = sums[bi];
      const x0 = VOL_W + bi * cW - v.scrollX;

      const rows = [
        { v: s.delta, col: s.delta >= 0 ? "#5588ff" : "#ff6688", bg: s.delta >= 0 ? "rgba(55,88,255,0.1)" : "rgba(255,66,136,0.1)" },
        { v: s.cumD,  col: s.cumD  >= 0 ? "#cc88ff" : "#ff88cc", bg: s.cumD  >= 0 ? "rgba(140,60,200,0.08)" : "rgba(255,60,140,0.08)" },
        { v: s.vol,   col: "#aaaaaa", bg: "transparent" },
      ];

      rows.forEach(({ v: val, col, bg }, si) => {
        const ry = sumY + si * SUM_ROW_H;
        if (bg !== "transparent") {
          ctx.fillStyle = bg;
          ctx.fillRect(x0, ry + 2, cW - 1, SUM_ROW_H - 2);
        }
        ctx.font = "bold 9px sans-serif";
        ctx.fillStyle = col;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const pfx = si === 0 && val > 0 ? "+" : "";
        ctx.fillText(pfx + fmt(val), x0 + cW / 2, ry + SUM_ROW_H / 2);

        ctx.strokeStyle = "#1a1a28";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x0, ry + SUM_ROW_H - 0.5);
        ctx.lineTo(x0 + cW, ry + SUM_ROW_H - 0.5);
        ctx.stroke();
      });
    }

    // Time axis
    const timeY = sumY + SUM_ROWS * SUM_ROW_H;
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(VOL_W, timeY, vpW, TIME_H);
    ctx.strokeStyle = "#1e1e2c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(VOL_W, timeY + 0.5);
    ctx.lineTo(VOL_W + vpW, timeY + 0.5);
    ctx.stroke();

    for (let bi = firstCol; bi <= lastCol; bi++) {
      const x0 = VOL_W + bi * cW - v.scrollX;
      const isLive = bi === nCols - 1;
      ctx.font = `${isLive ? "bold" : "normal"} 9px sans-serif`;
      ctx.fillStyle = isLive ? "#4488ff" : "#303048";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(buckets[bi].slice(11, 16), x0 + cW / 2, timeY + TIME_H / 2);
    }

    // Crosshair time label
    if (v.mouseX >= VOL_W && v.mouseX < VOL_W + vpW) {
      const colIdx = Math.floor((v.mouseX - VOL_W + v.scrollX) / cW);
      if (colIdx >= 0 && colIdx < nCols) {
        const labelX = VOL_W + colIdx * cW - v.scrollX + cW / 2;
        const tw = 36;
        ctx.fillStyle = "#2a3a5a";
        ctx.fillRect(labelX - tw / 2, timeY + 2, tw, TIME_H - 4);
        ctx.font = "bold 9px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(buckets[colIdx].slice(11, 16), labelX, timeY + TIME_H / 2);
      }
    }

    // Compute hovered bar OHLCV for the info bar
    if (v.mouseX >= VOL_W && v.mouseX < VOL_W + vpW) {
      const colIdx = Math.floor((v.mouseX - VOL_W + v.scrollX) / cW);
      if (colIdx >= 0 && colIdx < nCols) {
        const bar = olc[buckets[colIdx]];
        const s = sums[colIdx];
        if (bar) {
          hoverBarRef.current = { o: bar.open, h: bar.high, l: bar.low, c: bar.close, vol: s.vol, delta: s.delta };
        }
      }
    } else {
      // Show latest bar when not hovering
      const lastBar = olc[buckets[nCols - 1]];
      const lastSum = sums[nCols - 1];
      if (lastBar) {
        hoverBarRef.current = { o: lastBar.open, h: lastBar.high, l: lastBar.low, c: lastBar.close, vol: lastSum.vol, delta: lastSum.delta };
      }
    }

    ctx.restore();
  }, []);

  const scheduleDraw = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
  }, [draw]);

  // ── Mouse interaction (TradingView-style) ──────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const v = view.current;

    // dragZone: "grid" = pan, "price" = vertical zoom, "time" = horizontal zoom
    function getDragZone(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const W = rect.width;
      const vpH = rect.height - FOOTER_H;
      if (x >= W - PRICE_W && y < vpH) return "price";
      if (y >= vpH) return "time";
      return "grid";
    }

    function onMouseDown(e) {
      v.dragging = true;
      v.dragZone = getDragZone(e);
      v.lastX = e.clientX;
      v.lastY = e.clientY;
      canvas.style.cursor = v.dragZone === "grid" ? "grabbing" : "ns-resize";
      if (v.dragZone === "time") canvas.style.cursor = "ew-resize";
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      v.mouseX = e.clientX - rect.left;
      v.mouseY = e.clientY - rect.top;

      // Sync hoverBar ref to state for the info bar
      if (hoverBarRef.current) {
        setHoverBar({ ...hoverBarRef.current });
      }

      if (v.dragging) {
        const dx = e.clientX - v.lastX;
        const dy = e.clientY - v.lastY;

        if (v.dragZone === "price") {
          // Drag on price axis: vertical zoom (drag up = zoom in, drag down = zoom out)
          const zf = 1 - dy * 0.005;
          const oldCH = v.cH;
          v.cH = Math.max(MIN_CH, Math.min(MAX_CH, v.cH * zf));
          v.scrollY = (v.scrollY + v.mouseY) * (v.cH / oldCH) - v.mouseY;
        } else if (v.dragZone === "time") {
          // Drag on time axis: horizontal zoom (drag right = zoom in, drag left = zoom out)
          const zf = 1 + dx * 0.005;
          const oldCW = v.cW;
          v.cW = Math.max(MIN_CW, Math.min(MAX_CW, v.cW * zf));
          v.scrollX = (v.scrollX + v.mouseX - VOL_W) * (v.cW / oldCW) - (v.mouseX - VOL_W);
        } else {
          // Grid: pan
          v.scrollX -= dx;
          v.scrollY -= dy;
        }

        v.lastX = e.clientX;
        v.lastY = e.clientY;
        v.userScrolled = true;
        v.lastInteraction = Date.now();
      } else {
        // Update cursor based on hover zone
        const zone = getDragZone(e);
        if (zone === "price") canvas.style.cursor = "ns-resize";
        else if (zone === "time") canvas.style.cursor = "ew-resize";
        else canvas.style.cursor = "crosshair";
      }
      scheduleDraw();
    }

    function onMouseUp() {
      v.dragging = false;
      v.dragZone = null;
      canvas.style.cursor = "crosshair";
    }

    function onMouseLeave() {
      v.dragging = false;
      v.dragZone = null;
      v.mouseX = -1;
      v.mouseY = -1;
      canvas.style.cursor = "crosshair";
      scheduleDraw();
      // Show latest bar info when not hovering
      if (hoverBarRef.current) {
        setHoverBar({ ...hoverBarRef.current });
      }
    }

    function onWheel(e) {
      e.preventDefault();
      const zf = e.deltaY > 0 ? 0.94 : 1.06;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - VOL_W;
      const my = e.clientY - rect.top;

      // Shift-scroll: zoom Y only. Ctrl-scroll: zoom X only. Otherwise both.
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
      // Reset to auto-fit
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

  // ── Load data ──
  const loadData = useCallback((sym, tf) => {
    const { ohlc, candles } = genDemo(BASES[sym] || 5800, 200, tf);
    candlesRef.current = candles;
    ohlcRef.current = ohlc;
    view.current.userScrolled = false;
    setDataMode("demo");
    scheduleDraw();
  }, [scheduleDraw]);

  useEffect(() => { loadData(ticker, timeframe); }, [ticker, timeframe, loadData]);

  // ── WebSocket ──
  useEffect(() => {
    let ws, timer;
    function connect() {
      ws = new WebSocket(WS_URL);
      ws.onopen = () => {
        setStatus("connected");
        setDataMode("live");
        // Clear demo data so live data doesn't overlap with different price range
        candlesRef.current = {};
        ohlcRef.current = {};
      };
      ws.onerror = () => setStatus("error");
      ws.onclose = () => { setStatus("disconnected"); timer = setTimeout(connect, 10000); };
      ws.onmessage = e => {
        try {
          const d = JSON.parse(e.data);
          if (d.type !== "trade") return;
          const ts = new Date(d.timestamp);
          // Floor timestamp to current timeframe interval
          const tfMs = tfMinutes(timeframe) * 60000;
          const floored = new Date(Math.floor(ts.getTime() / tfMs) * tfMs);
          const bk = floored.toISOString().slice(0, 16);
          const pl = parseFloat((Math.round(d.price / TICK) * TICK).toFixed(2));
          const c = candlesRef.current;
          if (!c[bk]) c[bk] = {};
          if (!c[bk][pl]) c[bk][pl] = { b: 0, a: 0 };
          c[bk][pl].b += d.bid_volume || 0;
          c[bk][pl].a += d.ask_volume || 0;
          // Re-engage auto-follow after 5s of no user interaction
          const vw = view.current;
          if (vw.userScrolled && vw.lastInteraction && Date.now() - vw.lastInteraction > 5000) {
            vw.userScrolled = false;
          }
          const o = ohlcRef.current;
          const t = Math.floor(floored.getTime() / 1000);
          if (!o[bk]) o[bk] = { time: t, open: d.price, high: d.price, low: d.price, close: d.price };
          else { o[bk].high = Math.max(o[bk].high, d.price); o[bk].low = Math.min(o[bk].low, d.price); o[bk].close = d.price; }
          scheduleDraw();
        } catch {}
      };
    }
    connect();
    return () => { clearTimeout(timer); if (ws) ws.close(); };
  }, [scheduleDraw, timeframe]);

  // ── Candle countdown timer ──
  useEffect(() => {
    const mins = tfMinutes(timeframe);
    const interval = setInterval(() => {
      const now = new Date();
      const totalMsInDay = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
      const candleMs = mins * 60000;
      const msIntoCandle = totalMsInDay % candleMs;
      const msRemaining = candleMs - msIntoCandle;
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

  // ── Show/hide snap-to-latest button + sync hover bar ──
  useEffect(() => {
    const iv = setInterval(() => {
      const v = view.current;
      setShowSnap(v.userScrolled);
      // Keep hover bar in sync (shows latest bar when not hovering)
      if (hoverBarRef.current && !hoverBar) {
        setHoverBar({ ...hoverBarRef.current });
      }
    }, 300);
    return () => clearInterval(iv);
  }, [hoverBar]);

  const snapToLatest = useCallback(() => {
    const v = view.current;
    v.userScrolled = false;
    v.lastInteraction = 0;
    setShowSnap(false);
    scheduleDraw();
  }, [scheduleDraw]);

  const label = ticker.replace("=F", "");
  const info = TICKER_INFO[ticker] || {};
  const barUp = hoverBar ? hoverBar.c >= hoverBar.o : false;
  const barColor = barUp ? "#22dc6e" : "#ef4444";

  return (
    <div style={{ height: "100vh", background: "#0e0e14", display: "flex", flexDirection: "column", fontFamily: "monospace", paddingLeft: "4rem" }}>
      <MainNav />
      <div style={{
        borderBottom: "1px solid #1e1e2c", background: "#0c0c14", padding: "7px 16px",
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "nowrap", overflow: "hidden",
      }}>
        <span style={{ fontWeight: 700, fontSize: 13, fontFamily: "sans-serif", color: "#c0c0d8" }}>
          {label}
        </span>
        <span style={{ color: "#505068", fontSize: 10, fontFamily: "sans-serif", whiteSpace: "nowrap" }}>
          {info.name} · {info.exchange}
        </span>
        {hoverBar && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontFamily: "sans-serif", whiteSpace: "nowrap" }}>
            <span style={{ color: "#606078" }}>O</span>
            <span style={{ color: barColor, fontWeight: 600 }}>{hoverBar.o.toFixed(2)}</span>
            <span style={{ color: "#606078", marginLeft: 4 }}>H</span>
            <span style={{ color: barColor, fontWeight: 600 }}>{hoverBar.h.toFixed(2)}</span>
            <span style={{ color: "#606078", marginLeft: 4 }}>L</span>
            <span style={{ color: barColor, fontWeight: 600 }}>{hoverBar.l.toFixed(2)}</span>
            <span style={{ color: "#606078", marginLeft: 4 }}>C</span>
            <span style={{ color: barColor, fontWeight: 600 }}>{hoverBar.c.toFixed(2)}</span>
            <span style={{ color: "#606078", marginLeft: 4 }}>V</span>
            <span style={{ color: "#aaa", fontWeight: 600 }}>{fmt(hoverBar.vol)}</span>
            <span style={{ color: "#606078", marginLeft: 4 }}>Δ</span>
            <span style={{ color: hoverBar.delta >= 0 ? "#5588ff" : "#ff6688", fontWeight: 600 }}>
              {hoverBar.delta >= 0 ? "+" : ""}{fmt(hoverBar.delta)}
            </span>
          </div>
        )}
        <div style={{ display: "flex", gap: 3, marginLeft: 4 }}>
          {["1m", "2m", "3m", "5m", "10m", "15m", "30m", "1h", "4h", "D", "W", "M"].map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} style={{
              background: timeframe === tf ? "#1a3660" : "transparent",
              border: "1px solid " + (timeframe === tf ? "#274e9e" : "#1e1e2c"),
              color: timeframe === tf ? "#60a5fa" : "#3a3a54",
              borderRadius: 3, padding: "2px 9px", fontSize: 10, cursor: "pointer", fontFamily: "sans-serif",
            }}>{tf}</button>
          ))}
        </div>
        <span style={{
          color: "#60a5fa", fontSize: 11, fontFamily: "monospace", fontWeight: 700,
          background: "#0d1a2e", border: "1px solid #1a3060", borderRadius: 3,
          padding: "2px 8px", minWidth: 42, textAlign: "center", letterSpacing: 1,
        }}>{countdown}</span>
        <select value={ticker} onChange={e => setTicker(e.target.value)} style={{
          background: "#0a0a12", border: "1px solid #1e1e2c", color: "#606078",
          borderRadius: 3, padding: "2px 6px", fontSize: 10, fontFamily: "sans-serif", cursor: "pointer",
        }}>
          <option value="ES=F">ES</option>
          <option value="NQ=F">NQ</option>
          <option value="CL=F">CL</option>
          <option value="GC=F">GC</option>
        </select>
        <button onClick={() => loadData(ticker, timeframe)}
          style={{ background: "none", border: "none", color: "#3a3a54", cursor: "pointer", padding: "2px 4px", display: "flex", alignItems: "center" }}>
          <RefreshCw size={12} />
        </button>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, fontFamily: "sans-serif" }}>
          {dataMode === "demo" && (
            <span style={{ color: "#f59e0b", fontSize: 9, padding: "1px 6px", border: "1px solid #553300", borderRadius: 3 }}>
              DEMO
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {status === "connected"
              ? <Wifi size={11} style={{ color: "#22c55e" }} />
              : <WifiOff size={11} style={{ color: "#333" }} />}
            <span style={{ color: status === "connected" ? "#22c55e" : "#333", fontSize: 10 }}>
              {status === "connected" ? "MBO Live" : "offline"}
            </span>
          </div>
        </div>
      </div>
      <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        {showSnap && (
          <button
            onClick={snapToLatest}
            style={{
              position: "absolute", bottom: 90, right: 70,
              background: "#1a2a4a", border: "1px solid #2a4a7a", borderRadius: 6,
              color: "#60a5fa", padding: "6px 10px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 11, fontFamily: "sans-serif", fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
              transition: "opacity 0.2s",
              zIndex: 10,
            }}
            title="Snap to latest candle"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
