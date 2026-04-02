import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import MainNav from "../components/navigation/MainNav";
import AIChat from "../components/terminal/AIChat";
import {
  ChevronDown, Play, Loader2, Activity,
  Waves, ArrowUpDown, BarChart2, Target,
} from "lucide-react";

/* ── Models ───────────────────────────────────────────────────────────── */
const MODELS = [
  {
    key: "hmm",
    label: "Volatility Regime Classifier",
    icon: Waves,
    color: "#8b5cf6",
    description: "Hidden Markov Model classifying the market into 3 volatility regimes: Low Vol (Bullish), High Vol (Bearish), and Chop (Sideways).",
    method: "HMM (hmmlearn)",
  },
  {
    key: "ofi",
    label: "Order Flow Imbalance",
    icon: ArrowUpDown,
    color: "#3b82f6",
    description: "Calculates Order Flow Imbalance from Level 2 order book data over a rolling 5-minute window. Outputs a pressure score between -1 and 1.",
    method: "OFI Microstructure",
  },
  {
    key: "garch",
    label: "GARCH Volatility Forecaster",
    icon: BarChart2,
    color: "#f59e0b",
    description: "GARCH(1,1) model forecasting expected volatility for the next 4 hours with a 95% confidence interval for price movement.",
    method: "GARCH(1,1) via arch",
  },
  {
    key: "zscore",
    label: "Mean-Reversion Z-Score",
    icon: Target,
    color: "#10b981",
    description: "Rolling Z-score of price relative to 20-period VWAP. Alerts when Z-score exceeds ±2.5 standard deviations, signaling potential snap-back.",
    method: "Z-Score / VWAP",
  },
];

/* ── Demo chart generators ────────────────────────────────────────────── */
function genRegimeData() {
  const d = []; let p = 19450;
  const regimes = ["Low Vol","Chop","High Vol","Low Vol","Chop","High Vol","Low Vol"];
  for (let i = 0; i < 120; i++) {
    const r = regimes[Math.min(Math.floor(i / (120 / regimes.length)), regimes.length - 1)];
    const v = r === "High Vol" ? 18 : r === "Chop" ? 8 : 5;
    p += (Math.random() - (r === "High Vol" ? 0.55 : 0.45)) * v;
    d.push({ i, price: Math.round(p * 100) / 100, regime: r });
  } return d;
}
function genOFIData() {
  const d = [];
  for (let i = 0; i < 60; i++) {
    const pr = Math.sin(i * 0.15) * 0.6 + (Math.random() - 0.5) * 0.4;
    d.push({ i, pressure: Math.round(Math.max(-1, Math.min(1, pr)) * 100) / 100 });
  } return d;
}
function genGARCHData() {
  const h = []; let v = 12;
  for (let i = 0; i < 8; i++) {
    v = Math.max(4, Math.min(30, v + (Math.random() - 0.45) * 3));
    h.push({ hour: i, vol: Math.round(v * 10) / 10, lo: Math.round(v * 0.6 * 10) / 10, hi: Math.round(v * 1.5 * 10) / 10 });
  } return h;
}
function genZScoreData() {
  const d = []; let p = 19450, vw = 19450;
  for (let i = 0; i < 80; i++) {
    p += (Math.random() - 0.48) * 12; vw += (p - vw) * 0.05;
    const z = (p - vw) / (15 + Math.random() * 5);
    d.push({ i, price: Math.round(p * 100) / 100, vwap: Math.round(vw * 100) / 100, z: Math.round(z * 100) / 100 });
  } return d;
}

/* ── Mini chart components ────────────────────────────────────────────── */
function RegimeChart({ data }) {
  const minP = Math.min(...data.map(d => d.price)), maxP = Math.max(...data.map(d => d.price));
  const range = maxP - minP || 1; const W = 500, H = 180;
  const rc = { "Low Vol": "#22c55e", "Chop": "#f59e0b", "High Vol": "#ef4444" };
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {data.map((d, i) => i > 0 && <rect key={i} x={((i-1)/(data.length-1))*W} y={0} width={(1/(data.length-1))*W+0.5} height={H} fill={rc[d.regime]} opacity={0.08} />)}
        <polyline fill="none" stroke="#e0e0f0" strokeWidth="1.5" points={data.map((d, i) => `${(i/(data.length-1))*W},${H-15-((d.price-minP)/range)*(H-30)}`).join(" ")} />
      </svg>
      <div className="flex gap-4 mt-2 justify-center">{Object.entries(rc).map(([l,c]) => <div key={l} className="flex items-center gap-1.5 text-[10px]"><div className="w-2.5 h-2.5 rounded" style={{backgroundColor:c,opacity:0.5}}/><span className="text-gray-500">{l}</span></div>)}</div>
    </div>
  );
}
function OFIChart({ data }) {
  const W = 500, H = 180, mid = H / 2;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <line x1={0} x2={W} y1={mid} y2={mid} stroke="#1a1a2c" strokeWidth="1" />
      {data.map((d, i) => { const x = (i/(data.length-1))*W, bH = Math.abs(d.pressure)*(H/2-10), y = d.pressure >= 0 ? mid-bH : mid;
        return <rect key={i} x={x-3} y={y} width={6} height={bH} rx={1.5} fill={d.pressure>=0?"#22c55e":"#ef4444"} opacity={0.6} />;
      })}
    </svg>
  );
}
function GARCHChart({ data }) {
  const W = 500, H = 180, mx = Math.max(...data.map(d => d.hi));
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <polygon fill="#f59e0b" opacity={0.1} points={data.map((d,i) => `${(i/(data.length-1))*W},${H-15-(d.hi/mx)*(H-30)}`).join(" ")+" "+[...data].reverse().map((d,i) => `${((data.length-1-i)/(data.length-1))*W},${H-15-(d.lo/mx)*(H-30)}`).join(" ")} />
      <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points={data.map((d,i) => `${(i/(data.length-1))*W},${H-15-(d.vol/mx)*(H-30)}`).join(" ")} />
      {data.map((d,i) => <circle key={i} cx={(i/(data.length-1))*W} cy={H-15-(d.vol/mx)*(H-30)} r={3} fill="#f59e0b" />)}
    </svg>
  );
}
function ZScoreChart({ data }) {
  const W = 500, H = 180, mid = H/2;
  const zR = Math.max(...data.map(d => Math.abs(d.z)), 3);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <line x1={0} x2={W} y1={mid} y2={mid} stroke="#1a1a2c" strokeWidth="1" />
      <line x1={0} x2={W} y1={mid-(2.5/zR)*(H/2-10)} y2={mid-(2.5/zR)*(H/2-10)} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="4" />
      <line x1={0} x2={W} y1={mid+(2.5/zR)*(H/2-10)} y2={mid+(2.5/zR)*(H/2-10)} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="4" />
      <polyline fill="none" stroke="#10b981" strokeWidth="1.5" points={data.map((d,i) => `${(i/(data.length-1))*W},${mid-(d.z/zR)*(H/2-10)}`).join(" ")} />
      {data.filter(d => Math.abs(d.z)>=2.5).map(d => <circle key={d.i} cx={(d.i/(data.length-1))*W} cy={mid-(d.z/zR)*(H/2-10)} r={4} fill="#ef4444" opacity={0.8} />)}
    </svg>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function AnalysisLayer() {
  const [activeModel, setActiveModel] = useState("hmm");
  const [symbol, setSymbol] = useState("NQ=F");
  const [running, setRunning] = useState(false);
  const [chartData, setChartData] = useState(() => ({
    hmm: genRegimeData(), ofi: genOFIData(), garch: genGARCHData(), zscore: genZScoreData(),
  }));

  const model = MODELS.find(m => m.key === activeModel);
  const Icon = model.icon;

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      setChartData(prev => ({
        ...prev,
        [activeModel]: activeModel === "hmm" ? genRegimeData() : activeModel === "ofi" ? genOFIData() : activeModel === "garch" ? genGARCHData() : genZScoreData(),
      }));
      setRunning(false);
    }, 1200);
  };

  const renderChart = () => {
    const d = chartData[activeModel];
    if (!d) return null;
    if (activeModel === "hmm") return <RegimeChart data={d} />;
    if (activeModel === "ofi") return <OFIChart data={d} />;
    if (activeModel === "garch") return <GARCHChart data={d} />;
    if (activeModel === "zscore") return <ZScoreChart data={d} />;
  };

  const aiContext = `Model: ${model.label} (${model.method})\nTicker: ${symbol}\nDescription: ${model.description}`;

  return (
    <div className="h-screen bg-[#0a0a10] pl-16 flex flex-col text-white overflow-hidden">
      <MainNav />

      {/* Main: left = model widget, right = AI chat */}
      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">

        {/* Left: Model widget */}
        <div className="border-r border-gray-800/40 flex flex-col overflow-hidden">
          {/* Model toolbar */}
          <div className="border-b border-gray-800/60 px-4 py-2.5 flex items-center gap-3 shrink-0" style={{ fontFamily: "sans-serif" }}>
            <div className="relative">
              <select
                value={activeModel}
                onChange={e => setActiveModel(e.target.value)}
                className="bg-gray-900/60 border border-gray-800/50 text-white text-xs font-medium rounded-lg px-3 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none"
              >
                {MODELS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                className="bg-gray-900/60 border border-gray-800/50 text-white text-xs font-medium rounded-lg px-3 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="NQ=F">NQ</option>
                <option value="ES=F">ES</option>
                <option value="CL=F">CL</option>
                <option value="GC=F">GC</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              {running ? "Running..." : "Run"}
            </button>

            <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-gray-900/60 border border-gray-800/30" style={{ color: model.color, fontFamily: "sans-serif" }}>
              {model.method}
            </span>
          </div>

          {/* Model info */}
          <div className="px-4 py-3 border-b border-gray-800/40" style={{ fontFamily: "sans-serif" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: model.color + "15" }}>
                <Icon className="w-3.5 h-3.5" style={{ color: model.color }} />
              </div>
              <span className="text-sm font-semibold text-white">{model.label}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{model.description}</p>
          </div>

          {/* Chart area */}
          <div className="flex-1 p-4 flex items-center justify-center min-h-0 overflow-hidden">
            {running ? (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: model.color }} />
                <span className="text-xs">Running {model.label}...</span>
              </div>
            ) : chartData[activeModel] ? (
              <div className="w-full">{renderChart()}</div>
            ) : (
              <div className="text-center text-gray-600 text-xs">
                <Activity className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                Click Run to analyze
              </div>
            )}
          </div>

          {/* Model list at bottom */}
          <div className="border-t border-gray-800/40 px-3 py-2 shrink-0" style={{ fontFamily: "sans-serif" }}>
            <div className="grid grid-cols-2 gap-1.5">
              {MODELS.map(m => {
                const MIcon = m.icon;
                const isActive = m.key === activeModel;
                return (
                  <button
                    key={m.key}
                    onClick={() => setActiveModel(m.key)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
                      isActive ? "bg-gray-800/60 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-gray-900/50"
                    }`}
                  >
                    <MIcon className="w-3.5 h-3.5 shrink-0" style={isActive ? { color: m.color } : {}} />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: AI Chat */}
        <div className="flex flex-col overflow-hidden">
          <AIChat context={aiContext} />
        </div>
      </div>
    </div>
  );
}
