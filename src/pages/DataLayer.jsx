import React, { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import MainNav from "../components/navigation/MainNav";
import { base44 } from "@/api/base44Client";

// ── Config ────────────────────────────────────────────────────────────────────
const WS_URL      = "wss://elsa-censureless-joyce.ngrok-free.dev";
const TICK        = 0.25;
const MAX_CANDLES = 20;
const MAX_LEVELS  = 72;   // cap visible price levels to prevent overflow
const IMB_RATIO   = 3;    // imbalance threshold

// Fixed layout (CSS px)
const VOL_W     = 56;     // volume profile column
const PRICE_W   = 62;     // price axis column
const SUM_ROWS  = 5;      // Ask, Bid, Δ, CΔ, Vol
const SUM_ROW_H = 20;
const TIME_H    = 22;
const FOOTER_H  = SUM_ROWS * SUM_ROW_H + TIME_H;

// Cell size bounds
const MIN_CH = 13;
const MAX_CH = 22;
const MIN_CW = 52;
const MAX_CW = 90;

// ── Helpers ───────────────────────────────────────────────────────────────────
function seededRand(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function distributeVol(open, high, low, close, volume, ts) {
  const lvls = {};
  if (!volume) return lvls;
  const minP = parseFloat((Math.floor(low / TICK) * TICK).toFixed(2));
  const maxP = parseFloat((Math.ceil(high / TICK) * TICK).toFixed(2));
  const isGreen = close >= open;

  if (Math.abs(maxP - minP) < TICK * 0.5) {
    lvls[minP] = { b: Math.round(volume * (isGreen ? 0.4 : 0.6)), a: Math.round(volume * (isGreen ? 0.6 : 0.4)) };
    return lvls;
  }

  const prices = [];
  for (let p = minP; p <= maxP + TICK * 0.01; p = parseFloat((p + TICK).toFixed(2))) prices.push(p);

  const mid   = (high + low) / 2;
  const sigma = (maxP - minP) / 2.5;
  let wts = prices.map(p => Math.exp(-0.5 * ((p - mid) / sigma) ** 2));
  const wSum = wts.reduce((a, b) => a + b, 0) || 1;
  wts = wts.map(w => w / wSum);

  const openP  = parseFloat((Math.round(open / TICK)  * TICK).toFixed(2));
  const closeP = parseFloat((Math.round(close / TICK) * TICK).toFixed(2));

  prices.forEach((p, i) => {
    const vol = Math.max(1, Math.round(volume * wts[i]));
    const r   = seededRand(ts + p * 137 + i * 31);
    let ar;
    if (isGreen) ar = p > closeP ? 0.55 + r * 0.25 : p < openP ? 0.2 + r * 0.2 : 0.4 + r * 0.25;
    else         ar = p > openP  ? 0.2 + r * 0.2   : p < closeP ? 0.55 + r * 0.25 : 0.35 + r * 0.25;
    lvls[p] = { b: Math.round(vol * (1 - ar)), a: Math.round(vol * ar) };
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function DataLayer() {
  // UI state only — data lives in refs so WS updates skip React re-render
  const [status,         setStatus]         = useState("disconnected");
  const [ticker,         setTicker]         = useState("ES=F");
  const [timeframe,      setTimeframe]      = useState("5m");
  const [loadingHistory, setLoadingHistory] = useState(true);

  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const candlesRef   = useRef({});  // { bucket: { price: {b,a} } }
  const ohlcRef      = useRef({});  // { bucket: { open,high,low,close } }
  const rafRef       = useRef(null);
  const cssSize      = useRef({ w: 0, h: 0 });

  // ── Draw (pure canvas — no React state reads) ──────────────────────────────
  const draw = useCallback(() => {
    rafRef.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w: W, h: H } = cssSize.current;
    if (!W || !H) return;

    const dpr = window.devicePixelRatio || 1;
    const ctx  = canvas.getContext("2d");
    // HiDPI: canvas pixels = CSS px × dpr; draw in CSS px space
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const candles = candlesRef.current;
    const ohlc    = ohlcRef.current;
    const buckets = Object.keys(candles).sort().slice(-MAX_CANDLES);

    // Clear
    ctx.fillStyle = "#13131a";
    ctx.fillRect(0, 0, W, H);

    if (buckets.length === 0) {
      ctx.fillStyle = "#3a3a50";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Loading order flow data…", W / 2, H / 2);
      return;
    }

    // ── Compute price range ────────────────────────────────────────────────
    const priceSet = new Set();
    buckets.forEach(b => Object.keys(candles[b] || {}).forEach(p => priceSet.add(+p)));
    let prices = Array.from(priceSet).sort((a, b) => b - a);

    // Cap to MAX_LEVELS centered on last candle's midpoint
    if (prices.length > MAX_LEVELS) {
      const lb  = buckets[buckets.length - 1];
      const bar = ohlc[lb];
      const ctr = bar ? (bar.high + bar.low) / 2 : prices[Math.floor(prices.length / 2)];
      const half = (MAX_LEVELS / 2) * TICK;
      prices = prices.filter(p => Math.abs(p - ctr) <= half);
    }

    const nRows = prices.length;
    const nCols = buckets.length;
    if (!nRows) return;

    // ── Cell sizing (auto-fit, no scroll) ─────────────────────────────────
    const cH = Math.min(MAX_CH, Math.max(MIN_CH, Math.floor((H - FOOTER_H) / nRows)));
    const cW = Math.min(MAX_CW, Math.max(MIN_CW, Math.floor((W - VOL_W - PRICE_W) / nCols)));
    const fs  = cH <= 14 ? 7 : 9; // font size inside cells

    // ── Volume profile (across all visible candles) ────────────────────────
    const vp = {};
    buckets.forEach(b => Object.entries(candles[b] || {}).forEach(([p, v]) => {
      vp[p] = (vp[p] || 0) + v.b + v.a;
    }));
    const maxV = Math.max(...Object.values(vp), 1);
    const pocP = prices.reduce((best, p) => (vp[p] || 0) > (vp[best] || 0) ? p : best, prices[0]);

    // ── Per-candle summaries ───────────────────────────────────────────────
    let cumΔ = 0;
    const sums = buckets.map(b => {
      const cells = candles[b] || {};
      let ask = 0, bid = 0;
      Object.values(cells).forEach(c => { ask += c.a; bid += c.b; });
      const delta = ask - bid;
      cumΔ += delta;
      return { ask, bid, delta, cumΔ, vol: ask + bid };
    });

    // ── CANDLE COLUMNS ─────────────────────────────────────────────────────
    for (let bi = 0; bi < nCols; bi++) {
      const bucket = buckets[bi];
      const x0     = VOL_W + bi * cW;
      const isLive = bi === nCols - 1;
      const bar    = ohlc[bucket];
      const green  = bar ? bar.close >= bar.open : true;

      let hiP = null, loP = null, opP = null, clP = null;
      if (bar) {
        hiP = parseFloat((Math.ceil(bar.high   / TICK) * TICK).toFixed(2));
        loP = parseFloat((Math.floor(bar.low   / TICK) * TICK).toFixed(2));
        opP = parseFloat((Math.round(bar.open  / TICK) * TICK).toFixed(2));
        clP = parseFloat((Math.round(bar.close / TICK) * TICK).toFixed(2));
      }

      // Live column tint
      if (isLive) {
        ctx.fillStyle = "rgba(42,90,159,0.05)";
        ctx.fillRect(x0, 0, cW - 1, nRows * cH);
      }

      for (let pi = 0; pi < nRows; pi++) {
        const p    = prices[pi];
        const y0   = pi * cH;
        const cell = (candles[bucket] || {})[p];
        const tot  = cell ? cell.b + cell.a : 0;

        const inBody = opP !== null && clP !== null && (
          (green  && p >= opP - 0.001 && p <= clP + 0.001) ||
          (!green && p >= clP - 0.001 && p <= opP + 0.001)
        );
        const isPOC = Math.abs(p - pocP) < 0.001;

        // Cell background
        if (tot > 0) {
          const askDom    = cell.a >= cell.b;
          const intensity = Math.min(Math.max(cell.b, cell.a) / 350, 1);
          ctx.fillStyle   = askDom
            ? `rgba(22,163,74,${(0.06 + intensity * 0.52).toFixed(2)})`
            : `rgba(220,38,38,${(0.06 + intensity * 0.52).toFixed(2)})`;
          ctx.fillRect(x0, y0, cW - 1, cH - 1);
        } else if (inBody) {
          ctx.fillStyle = green ? "rgba(22,163,74,0.04)" : "rgba(220,38,38,0.04)";
          ctx.fillRect(x0, y0, cW - 1, cH - 1);
        }

        // POC row highlight
        if (isPOC) {
          ctx.fillStyle = "rgba(245,158,11,0.10)";
          ctx.fillRect(x0, y0, cW - 1, cH - 1);
        }

        // Horizontal grid line
        ctx.strokeStyle = "#191926";
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(x0,          y0 + cH - 0.5);
        ctx.lineTo(x0 + cW - 1, y0 + cH - 0.5);
        ctx.stroke();

        // Imbalance border
        if (tot > 5) {
          const askDom = cell.a >= cell.b;
          const ratio  = askDom
            ? (cell.b > 0 ? cell.a / cell.b : 999)
            : (cell.a > 0 ? cell.b / cell.a : 999);
          if (ratio >= IMB_RATIO) {
            ctx.strokeStyle = askDom ? "rgba(34,197,94,0.85)" : "rgba(239,68,68,0.85)";
            ctx.lineWidth   = 1;
            ctx.strokeRect(x0 + 0.5, y0 + 0.5, cW - 2, cH - 2);
          }
        }

        // Bid × Ask text
        if (tot > 0) {
          const askDom = cell.a >= cell.b;
          const ratio  = askDom
            ? (cell.b > 0 ? cell.a / cell.b : 999)
            : (cell.a > 0 ? cell.b / cell.a : 999);
          const imb  = tot > 5 && ratio >= IMB_RATIO;
          const midY = y0 + cH / 2;
          const midX = x0 + cW / 2;
          ctx.textBaseline = "middle";

          // Bid (dominant = bright red, else dim)
          ctx.font      = `${!askDom && imb ? "800" : "500"} ${fs}px monospace`;
          ctx.fillStyle = !askDom ? "#fca5a5" : "#2c3c2c";
          ctx.textAlign = "right";
          ctx.fillText(fmt(cell.b), midX - 5, midY);

          // separator
          ctx.font      = `400 ${fs - 1}px monospace`;
          ctx.fillStyle = "#242434";
          ctx.textAlign = "center";
          ctx.fillText("×", midX, midY);

          // Ask (dominant = bright green, else dim)
          ctx.font      = `${askDom && imb ? "800" : "500"} ${fs}px monospace`;
          ctx.fillStyle = askDom ? "#86efac" : "#2c3c2c";
          ctx.textAlign = "left";
          ctx.fillText(fmt(cell.a), midX + 5, midY);
        }
      }

      // OHLC wick line (thin, overlaid)
      if (bar && hiP !== null && loP !== null) {
        const hiIdx = prices.findIndex(p => Math.abs(p - hiP) < TICK * 0.6);
        const loIdx = prices.findIndex(p => Math.abs(p - loP) < TICK * 0.6);
        if (hiIdx >= 0 && loIdx >= 0) {
          ctx.strokeStyle = green ? "rgba(74,222,128,0.45)" : "rgba(248,113,113,0.45)";
          ctx.lineWidth   = 1;
          const wx = x0 + cW / 2;
          ctx.beginPath();
          ctx.moveTo(wx, hiIdx * cH + 1);
          ctx.lineTo(wx, loIdx * cH + cH - 2);
          ctx.stroke();
        }
      }

      // Live candle outer glow border
      if (isLive) {
        ctx.strokeStyle = "rgba(60,120,220,0.35)";
        ctx.lineWidth   = 1;
        ctx.strokeRect(x0 + 0.5, 0.5, cW - 2, nRows * cH - 1);
      }
    }

    // ── VOLUME PROFILE (left) ──────────────────────────────────────────────
    for (let pi = 0; pi < nRows; pi++) {
      const p     = prices[pi];
      const v     = vp[p] || 0;
      const bw    = Math.round((v / maxV) * (VOL_W - 6));
      const isPOC = Math.abs(p - pocP) < 0.001;
      ctx.globalAlpha = 0.78;
      ctx.fillStyle   = isPOC ? "#7c3aed" : "#1d4e89";
      ctx.fillRect(VOL_W - bw - 2, pi * cH + 1, bw, Math.max(1, cH - 2));
      ctx.globalAlpha = 1;
    }
    // vol/grid separator
    ctx.strokeStyle = "#1e1e2c";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(VOL_W - 0.5, 0);
    ctx.lineTo(VOL_W - 0.5, nRows * cH);
    ctx.stroke();

    // ── PRICE AXIS (right) ─────────────────────────────────────────────────
    const priceX = VOL_W + nCols * cW;
    ctx.fillStyle = "#0d0d16";
    ctx.fillRect(priceX, 0, PRICE_W, nRows * cH);
    ctx.strokeStyle = "#1e1e2c";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(priceX + 0.5, 0);
    ctx.lineTo(priceX + 0.5, nRows * cH);
    ctx.stroke();

    for (let pi = 0; pi < nRows; pi++) {
      const p     = prices[pi];
      const isPOC = Math.abs(p - pocP) < 0.001;
      ctx.font         = `${isPOC ? "700" : "400"} 9px monospace`;
      ctx.fillStyle    = isPOC ? "#f59e0b" : "#353548";
      ctx.textAlign    = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(p.toFixed(2), priceX + 5, pi * cH + cH / 2);
    }

    // ── SUMMARY FOOTER ─────────────────────────────────────────────────────
    const sumY = nRows * cH;

    // thick separator
    ctx.strokeStyle = "#2a2a3c";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(0, sumY + 1);
    ctx.lineTo(W, sumY + 1);
    ctx.stroke();

    // Row labels
    const labelDefs = [
      ["Ask", "#4ade80"],
      ["Bid", "#f87171"],
      ["Δ",   "#60a5fa"],
      ["CΔ",  "#93c5fd"],
      ["Vol", "#444444"],
    ];
    labelDefs.forEach(([lbl, col], si) => {
      const ry = sumY + si * SUM_ROW_H;
      ctx.fillStyle = "#0a0a12";
      ctx.fillRect(0, ry + 1, VOL_W, SUM_ROW_H - 1);
      ctx.font         = "700 9px sans-serif";
      ctx.fillStyle    = col;
      ctx.textAlign    = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(lbl, VOL_W - 5, ry + SUM_ROW_H / 2);
    });

    // Per-candle summary cells
    buckets.forEach((bucket, bi) => {
      const s  = sums[bi];
      const x0 = VOL_W + bi * cW;

      const rows = [
        { v: s.ask,   bg: "rgba(22,163,74,0.07)",                                    col: "#4ade80",  pfx: ""  },
        { v: s.bid,   bg: "rgba(220,38,38,0.07)",                                    col: "#f87171",  pfx: ""  },
        { v: s.delta, bg: s.delta >= 0 ? "rgba(96,165,250,0.07)" : "rgba(244,114,182,0.07)",
                                                                                      col: s.delta >= 0 ? "#60a5fa" : "#f472b6", pfx: s.delta > 0 ? "+" : "" },
        { v: s.cumΔ,  bg: s.cumΔ  >= 0 ? "rgba(96,165,250,0.04)" : "rgba(244,114,182,0.04)",
                                                                                      col: s.cumΔ  >= 0 ? "#93c5fd" : "#f9a8d4", pfx: ""  },
        { v: s.vol,   bg: "transparent",                                              col: "#444444",  pfx: ""  },
      ];

      rows.forEach(({ v, bg, col, pfx }, si) => {
        const ry = sumY + si * SUM_ROW_H;
        if (bg !== "transparent") {
          ctx.fillStyle = bg;
          ctx.fillRect(x0, ry + 1, cW - 1, SUM_ROW_H - 1);
        }
        ctx.font         = "600 9px sans-serif";
        ctx.fillStyle    = col;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pfx + fmt(v), x0 + cW / 2, ry + SUM_ROW_H / 2);

        // thin row divider
        ctx.strokeStyle = "#181824";
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(x0, ry + SUM_ROW_H - 0.5);
        ctx.lineTo(x0 + cW, ry + SUM_ROW_H - 0.5);
        ctx.stroke();
      });
    });

    // ── TIME AXIS ──────────────────────────────────────────────────────────
    const timeY = sumY + SUM_ROWS * SUM_ROW_H;
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, timeY, W, TIME_H);
    ctx.strokeStyle = "#1e1e2c";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(0, timeY + 0.5);
    ctx.lineTo(W, timeY + 0.5);
    ctx.stroke();

    buckets.forEach((bucket, bi) => {
      const x0     = VOL_W + bi * cW;
      const isLive = bi === nCols - 1;
      ctx.font         = `${isLive ? "700" : "400"} 9px sans-serif`;
      ctx.fillStyle    = isLive ? "#3a70ef" : "#252535";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(bucket.slice(11, 16), x0 + cW / 2, timeY + TIME_H / 2);
    });
  }, []); // stable — only touches refs

  const scheduleDraw = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
  }, [draw]);

  // ── Resize observer: size canvas to container ──────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const dpr    = window.devicePixelRatio || 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = Math.floor(width  * dpr);
      canvas.height = Math.floor(height * dpr);
      cssSize.current = { w: width, h: height };
      scheduleDraw();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [scheduleDraw]);

  // ── Historical data fetch ─────────────────────────────────────────────────
  const fetchHistory = useCallback(async (sym, tf) => {
    setLoadingHistory(true);
    try {
      const range = tf === "1m" ? "1d" : tf === "5m" ? "5d" : tf === "15m" ? "10d" : "30d";
      const res   = await base44.functions.invoke("fetchYahooHistory", { symbol: sym, interval: tf, range });
      const result = res.data?.chart?.result?.[0];
      if (!result) return;

      const tss = result.timestamp;
      const q   = result.indicators.quote[0];
      const newOhlc = {}, newCandles = {};

      tss.forEach((t, i) => {
        if (!q.open[i] || !q.close[i]) return;
        const bucket = new Date(t * 1000).toISOString().slice(0, 16);
        const bar = {
          time:  t,
          open:  +q.open[i].toFixed(2),
          high:  +q.high[i].toFixed(2),
          low:   +q.low[i].toFixed(2),
          close: +q.close[i].toFixed(2),
        };
        newOhlc[bucket]    = bar;
        newCandles[bucket] = distributeVol(bar.open, bar.high, bar.low, bar.close, q.volume[i] || 0, t);
      });

      candlesRef.current = newCandles;
      ohlcRef.current    = newOhlc;
      scheduleDraw();
    } catch (e) {
      console.error("Yahoo fetch error", e);
    } finally {
      setLoadingHistory(false);
      scheduleDraw();
    }
  }, [scheduleDraw]);

  useEffect(() => {
    const t = setTimeout(() => fetchHistory(ticker, timeframe), 300);
    return () => clearTimeout(t);
  }, [ticker, timeframe, fetchHistory]);

  // ── WebSocket live feed ───────────────────────────────────────────────────
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen  = () => setStatus("connected");
    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("disconnected");
    ws.onmessage = e => {
      try {
        const d = JSON.parse(e.data);
        if (d.type !== "trade") return;

        const ts     = new Date(d.timestamp);
        const bucket = ts.toISOString().slice(0, 16);
        const pl     = parseFloat((Math.round(d.price / TICK) * TICK).toFixed(2));

        // Mutate refs directly — zero React overhead
        const c = candlesRef.current;
        if (!c[bucket])    c[bucket]    = {};
        if (!c[bucket][pl]) c[bucket][pl] = { b: 0, a: 0 };
        c[bucket][pl].b += d.bid_volume || 0;
        c[bucket][pl].a += d.ask_volume || 0;

        const o = ohlcRef.current;
        const t = Math.floor(ts.getTime() / 60000) * 60;
        if (!o[bucket]) {
          o[bucket] = { time: t, open: d.price, high: d.price, low: d.price, close: d.price };
        } else {
          o[bucket].high  = Math.max(o[bucket].high, d.price);
          o[bucket].low   = Math.min(o[bucket].low,  d.price);
          o[bucket].close = d.price;
        }
        scheduleDraw();
      } catch { /* ignore parse errors */ }
    };
    return () => ws.close();
  }, [scheduleDraw]);

  // ── Render ────────────────────────────────────────────────────────────────
  const label = ticker.replace("=F", "");

  return (
    <div style={{
      height: "100vh",
      background: "#13131a",
      display: "flex",
      flexDirection: "column",
      fontFamily: "monospace",
      paddingLeft: "4rem",  // leave room for fixed sidebar nav
    }}>
      <MainNav />

      {/* ── Header bar ── */}
      <div style={{
        borderBottom: "1px solid #1e1e2c",
        background: "#0f0f18",
        padding: "7px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 13, fontFamily: "sans-serif", color: "#c0c0d8", letterSpacing: "0.4px" }}>
          {label} · Footprint
        </span>

        {/* Timeframe buttons */}
        <div style={{ display: "flex", gap: 3, marginLeft: 4 }}>
          {["1m", "5m", "15m", "30m"].map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} style={{
              background:   timeframe === tf ? "#1a3660" : "transparent",
              border:       "1px solid " + (timeframe === tf ? "#274e9e" : "#1e1e2c"),
              color:        timeframe === tf ? "#60a5fa" : "#3a3a54",
              borderRadius: 3,
              padding:      "2px 9px",
              fontSize:     10,
              cursor:       "pointer",
              fontFamily:   "sans-serif",
              transition:   "all 0.1s",
            }}>{tf}</button>
          ))}
        </div>

        {/* Ticker selector */}
        <select value={ticker} onChange={e => setTicker(e.target.value)} style={{
          background:   "#0a0a12",
          border:       "1px solid #1e1e2c",
          color:        "#606078",
          borderRadius: 3,
          padding:      "2px 6px",
          fontSize:     10,
          fontFamily:   "sans-serif",
          cursor:       "pointer",
        }}>
          <option value="ES=F">ES</option>
          <option value="NQ=F">NQ</option>
          <option value="CL=F">CL</option>
          <option value="GC=F">GC</option>
        </select>

        {/* Refresh */}
        <button
          onClick={() => fetchHistory(ticker, timeframe)}
          style={{ background: "none", border: "none", color: "#3a3a54", cursor: "pointer", padding: "2px 4px", display: "flex", alignItems: "center" }}
        >
          <RefreshCw size={12} />
        </button>

        {/* Status */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontFamily: "sans-serif" }}>
          {loadingHistory && <span style={{ color: "#f59e0b", fontSize: 10 }}>Loading…</span>}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: status === "connected" ? "#22c55e" : status === "error" ? "#ef4444" : "#252535",
            }} />
            <span style={{ color: "#333", fontSize: 10 }}>{status}</span>
          </div>
        </div>
      </div>

      {/* ── Canvas container (fills remaining space) ── */}
      <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
