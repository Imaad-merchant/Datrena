import React, { useState } from "react";
import MainNav from "../components/navigation/MainNav";
import {
  Play, Pause, RotateCcw, Plus, ChevronDown, TrendingUp, TrendingDown,
  BarChart2, Clock, Target, DollarSign, Activity, Zap, LineChart,
} from "lucide-react";

/* ── Demo data ────────────────────────────────────────────────────────── */
const DEMO_EQUITY = (() => {
  const pts = [];
  let eq = 50000;
  for (let i = 0; i < 60; i++) {
    eq += (Math.random() - 0.42) * 400;
    pts.push({ day: i + 1, equity: Math.round(eq) });
  }
  return pts;
})();

const DEMO_TRADES = [
  { id: 1, time: "09:32:14", symbol: "ES", side: "Long", entry: 5581.25, exit: 5586.50, pnl: 262.50, rr: "2.1:1" },
  { id: 2, time: "10:15:42", symbol: "NQ", side: "Short", entry: 19482.00, exit: 19455.00, pnl: 540.00, rr: "2.7:1" },
  { id: 3, time: "11:03:08", symbol: "ES", side: "Long", entry: 5588.00, exit: 5584.75, pnl: -162.50, rr: "-0.7:1" },
  { id: 4, time: "11:47:33", symbol: "CL", side: "Short", entry: 69.85, exit: 69.42, pnl: 430.00, rr: "1.9:1" },
  { id: 5, time: "13:21:55", symbol: "ES", side: "Long", entry: 5590.50, exit: 5597.25, pnl: 337.50, rr: "2.5:1" },
  { id: 6, time: "14:08:19", symbol: "NQ", side: "Short", entry: 19510.00, exit: 19525.00, pnl: -300.00, rr: "-0.8:1" },
  { id: 7, time: "14:52:07", symbol: "GC", side: "Long", entry: 3088.40, exit: 3095.10, pnl: 670.00, rr: "3.1:1" },
  { id: 8, time: "15:14:30", symbol: "ES", side: "Long", entry: 5593.00, exit: 5598.75, pnl: 287.50, rr: "1.8:1" },
];

const METRICS = [
  { label: "Net P&L", value: "+$2,065.00", color: "#22c55e", icon: DollarSign },
  { label: "Win Rate", value: "75%", color: "#22c55e", icon: Target },
  { label: "Profit Factor", value: "2.34", color: "#3b82f6", icon: BarChart2 },
  { label: "Avg RR", value: "1.7:1", color: "#3b82f6", icon: Zap },
  { label: "Max Drawdown", value: "-$462.50", color: "#ef4444", icon: TrendingDown },
  { label: "Sharpe Ratio", value: "1.82", color: "#a78bfa", icon: Activity },
  { label: "Trades", value: "8", color: "#9ca3af", icon: Clock },
  { label: "Expectancy", value: "+$258.13", color: "#22c55e", icon: TrendingUp },
];

export default function ValidationLayer() {
  const [strategy, setStrategy] = useState("ES Opening Drive Fade");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleRun = () => {
    setRunning(true);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); setRunning(false); return 100; }
        return p + 2;
      });
    }, 40);
  };

  const eqMin = Math.min(...DEMO_EQUITY.map(p => p.equity));
  const eqMax = Math.max(...DEMO_EQUITY.map(p => p.equity));
  const eqRange = eqMax - eqMin || 1;

  return (
    <div className="h-screen bg-[#0a0a10] pl-16 flex flex-col text-white overflow-hidden">
      <MainNav />

      {/* Toolbar */}
      <div className="border-b border-gray-800/60 bg-[#0a0a10] px-5 py-2.5 flex items-center gap-3 shrink-0" style={{ fontFamily: "sans-serif" }}>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Backtest</span>

        <div className="relative">
          <select
            value={strategy}
            onChange={e => setStrategy(e.target.value)}
            className="bg-gray-900/60 border border-gray-800/50 text-white text-xs font-medium rounded-lg px-3 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none"
          >
            <option>ES Opening Drive Fade</option>
            <option>NQ Delta Divergence Short</option>
            <option>CL Supply Zone Reversal</option>
            <option>MNQ Imbalance Hunter</option>
            <option>ES Gap Fill Scalp</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Play className="w-3 h-3" /> {running ? "Running..." : "Run"}
          </button>
          <button className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {running && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{progress}%</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-600">
          <span>Period: 60 days</span>
          <span>·</span>
          <span>Initial: $50,000</span>
          <span>·</span>
          <span>Commission: $4.50/rt</span>
        </div>
      </div>

      {/* Main content — no scroll */}
      <div className="flex-1 grid grid-rows-[auto_1fr] overflow-hidden">

        {/* Top: Metrics row */}
        <div className="grid grid-cols-8 gap-2.5 px-5 py-3 border-b border-gray-800/40">
          {METRICS.map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="bg-gray-900/40 border border-gray-800/30 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3" style={{ color: m.color }} />
                  <span className="text-[10px] text-gray-500">{m.label}</span>
                </div>
                <div className="text-sm font-bold" style={{ color: m.color }}>{m.value}</div>
              </div>
            );
          })}
        </div>

        {/* Bottom: Equity curve + Trade log */}
        <div className="grid grid-cols-5 gap-0 overflow-hidden">

          {/* Equity curve — 3 cols */}
          <div className="col-span-3 border-r border-gray-800/40 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Equity Curve</span>
              </div>
              <span className="text-[10px] text-gray-600">
                ${DEMO_EQUITY[DEMO_EQUITY.length - 1].equity.toLocaleString()}
              </span>
            </div>
            <div className="flex-1 relative min-h-0">
              <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none" className="block">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                  <line key={pct} x1="0" x2="600" y1={pct * 200} y2={pct * 200} stroke="#1a1a2c" strokeWidth="0.5" />
                ))}
                {/* Equity line */}
                <polyline
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  points={DEMO_EQUITY.map((p, i) => {
                    const x = (i / (DEMO_EQUITY.length - 1)) * 600;
                    const y = 200 - ((p.equity - eqMin) / eqRange) * 180 - 10;
                    return `${x},${y}`;
                  }).join(" ")}
                />
                {/* Fill */}
                <polygon
                  fill="url(#eqGrad)"
                  points={
                    DEMO_EQUITY.map((p, i) => {
                      const x = (i / (DEMO_EQUITY.length - 1)) * 600;
                      const y = 200 - ((p.equity - eqMin) / eqRange) * 180 - 10;
                      return `${x},${y}`;
                    }).join(" ") + ` 600,200 0,200`
                  }
                />
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Baseline */}
                <line x1="0" x2="600" y1={200 - ((50000 - eqMin) / eqRange) * 180 - 10} y2={200 - ((50000 - eqMin) / eqRange) * 180 - 10} stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="4" />
              </svg>
            </div>
          </div>

          {/* Trade log — 2 cols */}
          <div className="col-span-2 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800/40">
              <span className="text-xs font-semibold text-white">Trade Log</span>
              <span className="text-[10px] text-gray-600">{DEMO_TRADES.length} trades</span>
            </div>
            <div className="grid grid-cols-7 text-[10px] text-gray-600 uppercase tracking-wider px-4 py-2 border-b border-gray-800/30 shrink-0">
              <span>Time</span>
              <span>Symbol</span>
              <span>Side</span>
              <span>Entry</span>
              <span>Exit</span>
              <span className="text-right">P&L</span>
              <span className="text-right">R:R</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {DEMO_TRADES.map(t => (
                <div key={t.id} className="grid grid-cols-7 px-4 py-2 border-b border-gray-800/20 text-xs hover:bg-gray-900/30">
                  <span className="text-gray-500 font-mono">{t.time}</span>
                  <span className="text-white font-semibold">{t.symbol}</span>
                  <span className={t.side === "Long" ? "text-emerald-400" : "text-red-400"}>{t.side}</span>
                  <span className="text-gray-400 font-mono">{t.entry}</span>
                  <span className="text-gray-400 font-mono">{t.exit}</span>
                  <span className={`text-right font-semibold ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                  </span>
                  <span className={`text-right ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{t.rr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
