import React, { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainNav from "../components/navigation/MainNav";

const WS_URL = "wss://elsa-censureless-joyce.ngrok-free.dev";
const TICK_SIZE = 0.25;
const MAX_CANDLES = 20;
const CELL_H = 22;
const CELL_W = 66;

export default function FootprintChart() {
  const [candles, setCandles] = useState({});
  const [ohlc, setOhlc] = useState({});
  const [status, setStatus] = useState("disconnected");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [ticker, setTicker] = useState("ES=F");
  const [timeframe, setTimeframe] = useState("1m");
  const chartRef = useRef(null);
  const tvChartRef = useRef(null);
  const seriesRef = useRef(null);
  const ohlcRef = useRef({});
  const wsRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  const initChart = useCallback(() => {
    if (!chartRef.current || tvChartRef.current || !window.LightweightCharts) return;
    const chart = window.LightweightCharts.createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
      layout: { background: { color: "#0a0a0f" }, textColor: "#888" },
      grid: { vertLines: { color: "#111827" }, horzLines: { color: "#111827" } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#1e1e2e", scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderColor: "#1e1e2e", timeVisible: true, secondsVisible: false },
      handleScroll: true,
      handleScale: true
    });

    let series;
    try {
      series = chart.addSeries(window.LightweightCharts.CandlestickSeries, {
        upColor: "#16a34a", downColor: "#dc2626",
        borderUpColor: "#22c55e", borderDownColor: "#ef4444",
        wickUpColor: "#22c55e", wickDownColor: "#ef4444"
      });
    } catch (e) {
      try {
        series = chart.addCandlestickSeries({
          upColor: "#16a34a", downColor: "#dc2626",
          borderUpColor: "#22c55e", borderDownColor: "#ef4444",
          wickUpColor: "#22c55e", wickDownColor: "#ef4444"
        });
      } catch (e2) {
        console.error("Could not create candlestick series", e2);
        return;
      }
    }

    tvChartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartRef.current && tvChartRef.current) {
        tvChartRef.current.applyOptions({ width: chartRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load TradingView script
  useEffect(() => {
    if (scriptLoadedRef.current) {initChart();return;}
    const script = document.createElement("script");
    script.src = "https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js";
    script.onload = () => {scriptLoadedRef.current = true;initChart();};
    script.onerror = () => console.error("Failed to load LightweightCharts");
    document.head.appendChild(script);
    return () => {try {document.head.removeChild(script);} catch (e) {}};
  }, [initChart]);

  // Fetch Yahoo Finance history
  const fetchHistory = useCallback(async (sym, tf) => {
    setLoadingHistory(true);
    try {
      const interval = tf === "1m" ? "1m" : tf === "5m" ? "5m" : "15m";
      const range = tf === "1m" ? "5d" : "30d";

      // TODO: Replace with your own API endpoint
      const json = null;
      const result = json?.chart?.result?.[0];
      if (!result) return;

      const timestamps = result.timestamp;
      const q = result.indicators.quote[0];
      const bars = [];
      const newOhlc = {};
      const newCandles = {};

      timestamps.forEach((ts, i) => {
        if (!q.open[i] || !q.close[i]) return;
        const time = ts;
        const bar = {
          time,
          open: parseFloat(q.open[i].toFixed(2)),
          high: parseFloat(q.high[i].toFixed(2)),
          low: parseFloat(q.low[i].toFixed(2)),
          close: parseFloat(q.close[i].toFixed(2))
        };
        bars.push(bar);

        const bucket = new Date(ts * 1000).toISOString().slice(0, 16);
        newOhlc[bucket] = bar;

        // Simulate footprint from OHLCV
        const vol = q.volume[i] || 0;
        const midPrice = parseFloat(((bar.high + bar.low) / 2).toFixed(2));
        const pl = Math.round(midPrice / TICK_SIZE) * TICK_SIZE;
        const isGreen = bar.close >= bar.open;
        newCandles[bucket] = {
          [pl]: {
            b: isGreen ? Math.round(vol * 0.4) : Math.round(vol * 0.6),
            a: isGreen ? Math.round(vol * 0.6) : Math.round(vol * 0.4)
          }
        };
      });

      if (seriesRef.current && bars.length > 0) {
        seriesRef.current.setData(bars);
        tvChartRef.current?.timeScale().fitContent();
      }

      ohlcRef.current = newOhlc;
      setOhlc(newOhlc);
      setCandles(newCandles);
    } catch (err) {
      console.error("Yahoo Finance fetch failed", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    // Wait for chart to init
    const timer = setTimeout(() => fetchHistory(ticker, timeframe), 800);
    return () => clearTimeout(timer);
  }, [ticker, timeframe, fetchHistory]);

  // WebSocket live feed
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => setStatus("connected");
    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("disconnected");
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type !== "trade") return;
      const ts = new Date(d.timestamp);
      const bucket = ts.toISOString().slice(0, 16);
      const pl = Math.round(d.price / TICK_SIZE) * TICK_SIZE;
      const t = Math.floor(ts.getTime() / 60000) * 60;

      setCandles((prev) => {
        const c = { ...prev };
        if (!c[bucket]) c[bucket] = {};
        if (!c[bucket][pl]) c[bucket][pl] = { b: 0, a: 0 };
        c[bucket][pl].b += d.bid_volume || 0;
        c[bucket][pl].a += d.ask_volume || 0;
        return c;
      });

      setOhlc((prev) => {
        const o = { ...prev };
        if (!o[bucket]) o[bucket] = { time: t, open: d.price, high: d.price, low: d.price, close: d.price };
        o[bucket].high = Math.max(o[bucket].high, d.price);
        o[bucket].low = Math.min(o[bucket].low, d.price);
        o[bucket].close = d.price;
        if (seriesRef.current) {
          seriesRef.current.update({ time: t, open: o[bucket].open, high: o[bucket].high, low: o[bucket].low, close: o[bucket].close });
        }
        return o;
      });
    };
    return () => ws.close();
  }, []);

  // Footprint display — show last MAX_CANDLES
  const buckets = Object.keys(candles).sort().slice(-MAX_CANDLES);
  const allPrices = new Set();
  buckets.forEach((b) => Object.keys(candles[b]).forEach((p) => allPrices.add(parseFloat(p))));
  const prices = Array.from(allPrices).sort((a, b) => b - a);

  const volProfile = {};
  buckets.forEach((b) => {
    Object.entries(candles[b]).forEach(([p, v]) => {
      volProfile[p] = (volProfile[p] || 0) + v.b + v.a;
    });
  });
  const maxVol = Math.max(...Object.values(volProfile), 1);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e0e0e0", fontFamily: "monospace", paddingLeft: "4rem" }}>
      <MainNav />

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e1e2e", background: "#0f0f1a", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 15, fontFamily: "sans-serif", color: "#fff" }}>{ticker.replace("=F", "")} · Footprint</span>

        {/* Timeframe buttons */}
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {["1m", "5m", "15m"].map((tf) =>
          <button key={tf} onClick={() => setTimeframe(tf)} style={{
            background: timeframe === tf ? "#1e3a5f" : "transparent",
            border: "1px solid #1e1e2e",
            color: timeframe === tf ? "#60a5fa" : "#555",
            borderRadius: 4, padding: "2px 10px", fontSize: 11, cursor: "pointer",
            fontFamily: "sans-serif"
          }}>{tf}</button>
          )}
        </div>

        {/* Ticker selector */}
        <select value={ticker} onChange={(e) => setTicker(e.target.value)} style={{
          background: "#111827", border: "1px solid #1e1e2e", color: "#aaa",
          borderRadius: 4, padding: "2px 8px", fontSize: 11, fontFamily: "sans-serif", cursor: "pointer"
        }}>
          <option value="ES=F">ES Futures</option>
          <option value="NQ=F">NQ Futures</option>
          <option value="CL=F">CL Futures</option>
          <option value="GC=F">GC Futures</option>
        </select>

        <Button variant="ghost" size="icon" onClick={() => fetchHistory(ticker, timeframe)} style={{ color: "#555" }}>
          <RefreshCw size={14} />
        </Button>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontFamily: "sans-serif" }}>
          {loadingHistory && <span style={{ color: "#f59e0b", fontSize: 11 }}>Loading history...</span>}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: status === "connected" ? "#22c55e" : status === "error" ? "#ef4444" : "#555" }} />
            <span style={{ color: "#666" }}>{status}</span>
          </div>
        </div>
      </div>

      {/* TradingView Candlestick Chart */}
      <div ref={chartRef} style={{ width: "100%", height: "calc(75vh - 50px)", borderBottom: "1px solid #1e1e2e" }} className="rounded" />

      {/* Footprint Grid */}
      {buckets.length === 0 ?
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, color: "#555", fontSize: 13, fontFamily: "sans-serif" }}>
          {loadingHistory ? "Loading historical data..." : "Waiting for data..."}
        </div> :

      <div style={{ overflowX: "auto", overflowY: "auto", height: "calc(25vh - 50px)", padding: "10px 8px" }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>

            {/* Volume Profile */}
            <div style={{ display: "flex", flexDirection: "column", marginRight: 2, position: "sticky", left: 0, background: "#0a0a0f", zIndex: 2 }}>
              {prices.map((p) => {
              const v = volProfile[p] || 0;
              const w = Math.round(v / maxVol * 44);
              const isPOC = v === maxVol;
              return (
                <div key={p} style={{ height: CELL_H, display: "flex", alignItems: "center", justifyContent: "flex-end", width: 48 }}>
                    <div style={{ height: 14, width: w, background: isPOC ? "#7c3aed" : "#1d4e89", borderRadius: 1 }} />
                  </div>);

            })}
            </div>

            {/* Price Axis */}
            <div style={{ display: "flex", flexDirection: "column", marginRight: 4, minWidth: 58, position: "sticky", left: 50, background: "#0a0a0f", zIndex: 2 }}>
              {prices.map((p) => {
              const isPOC = volProfile[p] === maxVol;
              return (
                <div key={p} style={{
                  height: CELL_H, display: "flex", alignItems: "center", justifyContent: "flex-end",
                  fontSize: 10, color: isPOC ? "#f59e0b" : "#444",
                  paddingRight: 4, borderRight: "1px solid #1e1e2e",
                  fontWeight: isPOC ? 700 : 400
                }}>
                    {p.toFixed(2)}
                  </div>);

            })}
            </div>

            {/* Candle Columns */}
            {buckets.map((bucket, bi) => {
            const delta = Object.values(candles[bucket] || {}).reduce((s, v) => s + (v.a - v.b), 0);
            const totalVol = Object.values(candles[bucket] || {}).reduce((s, v) => s + v.a + v.b, 0);
            const isLive = bi === buckets.length - 1;

            return (
              <div key={bucket} style={{
                display: "flex", flexDirection: "column", marginRight: 1,
                outline: isLive ? "1px solid #2a3a5e" : "none",
                borderRadius: isLive ? 2 : 0
              }}>
                  {prices.map((p) => {
                  const cell = (candles[bucket] || {})[p] || { b: 0, a: 0 };
                  const total = cell.b + cell.a;
                  const askDom = cell.a >= cell.b;
                  const imbalance = total > 0 && (
                  cell.b > 0 && cell.a / cell.b >= 3 ||
                  cell.a > 0 && cell.b / cell.a >= 3);

                  const isPOC = volProfile[p] === maxVol;
                  const intensity = total > 0 ? Math.min(Math.max(cell.b, cell.a) / 500, 1) : 0;
                  const bg = total === 0 ? "#0d0d14" :
                  askDom ? `rgba(22,163,74,${0.08 + intensity * 0.55})` :
                  `rgba(220,38,38,${0.08 + intensity * 0.55})`;

                  return (
                    <div key={p} style={{
                      height: CELL_H, width: CELL_W, background: bg,
                      border: imbalance ? "1px solid rgba(255,255,255,0.5)" :
                      isPOC ? "1px solid rgba(245,158,11,0.4)" :
                      "1px solid #0f172a",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.2px",
                      color: total === 0 ? "transparent" :
                      askDom ? "#86efac" :
                      "#fca5a5"
                    }}>
                        {total > 0 ? `${cell.b} × ${cell.a}` : ""}
                      </div>);

                })}

                  {/* Delta */}
                  <div style={{
                  height: 22, width: CELL_W,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, fontFamily: "sans-serif",
                  borderTop: "1px solid #1e1e2e",
                  background: delta >= 0 ? "rgba(96,165,250,0.07)" : "rgba(244,114,182,0.07)",
                  color: delta >= 0 ? "#60a5fa" : "#f472b6"
                }}>
                    {delta > 0 ? "+" : ""}{delta}
                  </div>

                  {/* Total Volume */}
                  <div style={{
                  height: 18, width: CELL_W,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "#3a3a4a", borderTop: "1px solid #0f172a",
                  fontFamily: "sans-serif"
                }}>
                    {totalVol > 1000 ? `${(totalVol / 1000).toFixed(1)}k` : totalVol}
                  </div>

                  {/* Time */}
                  <div style={{
                  height: 16, width: CELL_W,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "#2a2a3a", borderTop: "1px solid #0f172a",
                  fontFamily: "sans-serif"
                }}>
                    {bucket.slice(11, 16)}
                  </div>
                </div>);

          })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 14, marginTop: 10, paddingLeft: 114, fontSize: 10, color: "#444", fontFamily: "sans-serif", flexWrap: "wrap" }}>
            <span><span style={{ color: "#86efac" }}>■</span> Ask dominant</span>
            <span><span style={{ color: "#fca5a5" }}>■</span> Bid dominant</span>
            <span><span style={{ color: "rgba(255,255,255,0.5)" }}>□</span> Imbalance 3:1</span>
            <span><span style={{ color: "#7c3aed" }}>■</span> POC</span>
            <span><span style={{ color: "#60a5fa" }}>■</span> Δ+</span>
            <span><span style={{ color: "#f472b6" }}>■</span> Δ−</span>
            <span style={{ color: "#2a3a5e", border: "1px solid #2a3a5e", padding: "0 4px" }}>Live candle</span>
          </div>
        </div>
      }
    </div>);

}