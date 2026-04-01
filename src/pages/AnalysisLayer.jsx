import React, { useState, useEffect } from "react";
import MainNav from "../components/navigation/MainNav";
import {
  ChevronDown, Play, Activity, BarChart2, TrendingUp, Zap,
  Target, Waves, ArrowUpDown, Clock, Loader2,
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
    output: "regime",
  },
  {
    key: "ofi",
    label: "Order Flow Imbalance",
    icon: ArrowUpDown,
    color: "#3b82f6",
    description: "Calculates Order Flow Imbalance from Level 2 order book data over a rolling 5-minute window. Outputs a pressure score between -1 and 1.",
    method: "OFI Microstructure",
    output: "pressure",
  },
  {
    key: "garch",
    label: "GARCH Volatility Forecaster",
    icon: BarChart2,
    color: "#f59e0b",
    description: "GARCH(1,1) model forecasting expected volatility for the next 4 hours with a 95% confidence interval for price movement.",
    method: "GARCH(1,1) via arch",
    output: "forecast",
  },
  {
    key: "zscore",
    label: "Mean-Reversion Z-Score",
    icon: Target,
    color: "#10b981",
    description: "Rolling Z-score of price relative to 20-period VWAP. Alerts when Z-score exceeds ±2.5 standard deviations, signaling potential snap-back.",
    method: "Z-Score / VWAP",
    output: "zscore",
  },
];

/* ── Demo data generators ─────────────────────────────────────────────── */
function genRegimeData() {
  const data = [];
  let price = 19450;
  const regimes = ["Low Vol", "Chop", "High Vol", "Low Vol", "Chop", "High Vol", "Low Vol"];
  for (let i = 0; i < 120; i++) {
    const rIdx = Math.floor(i / (120 / regimes.length));
    const regime = regimes[Math.min(rIdx, regimes.length - 1)];
    const vol = regime === "High Vol" ? 18 : regime === "Chop" ? 8 : 5;
    price += (Math.random() - (regime === "High Vol" ? 0.55 : 0.45)) * vol;
    data.push({ i, price: Math.round(price * 100) / 100, regime });
  }
  return data;
}

function genOFIData() {
  const data = [];
  for (let i = 0; i < 60; i++) {
    const pressure = Math.sin(i * 0.15) * 0.6 + (Math.random() - 0.5) * 0.4;
    data.push({ i, pressure: Math.round(Math.max(-1, Math.min(1, pressure)) * 100) / 100 });
  }
  return data;
}

function genGARCHData() {
  const hours = [];
  let vol = 12;
  for (let h = 0; h < 8; h++) {
    vol += (Math.random() - 0.45) * 3;
    vol = Math.max(4, Math.min(30, vol));
    const lo = vol * 0.6;
    const hi = vol * 1.5;
    hours.push({ hour: h, vol: Math.round(vol * 10) / 10, lo: Math.round(lo * 10) / 10, hi: Math.round(hi * 10) / 10 });
  }
  return hours;
}

function genZScoreData() {
  const data = [];
  let price = 19450, vwap = 19450;
  for (let i = 0; i < 80; i++) {
    price += (Math.random() - 0.48) * 12;
    vwap += (price - vwap) * 0.05;
    const std = 15 + Math.random() * 5;
    const z = (price - vwap) / std;
    data.push({ i, price: Math.round(price * 100) / 100, vwap: Math.round(vwap * 100) / 100, z: Math.round(z * 100) / 100 });
  }
  return data;
}

/* ── Chart renderers ──────────────────────────────────────────────────── */
function RegimeChart({ data }) {
  const minP = Math.min(...data.map(d => d.price));
  const maxP = Math.max(...data.map(d => d.price));
  const range = maxP - minP || 1;
  const W = 700, H = 260;

  const regimeColor = { "Low Vol": "#22c55e", "Chop": "#f59e0b", "High Vol": "#ef4444" };

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
        {/* Regime background bands */}
        {data.map((d, i) => {
          if (i === 0) return null;
          const x1 = ((i - 1) / (data.length - 1)) * W;
          const x2 = (i / (data.length - 1)) * W;
          return <rect key={i} x={x1} y={0} width={x2 - x1 + 0.5} height={H} fill={regimeColor[d.regime]} opacity={0.08} />;
        })}
        {/* Price line */}
        <polyline fill="none" stroke="#e0e0f0" strokeWidth="1.5"
          points={data.map((d, i) => `${(i / (data.length - 1)) * W},${H - 20 - ((d.price - minP) / range) * (H - 40)}`).join(" ")} />
      </svg>
      <div className="flex items-center gap-5 mt-3 justify-center">
        {Object.entries(regimeColor).map(([label, color]) => (
          <div key={label} className="flex items-center gap-2 text-[11px]">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color, opacity: 0.5 }} />
            <span className="text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OFIChart({ data }) {
  const W = 700, H = 260, mid = H / 2;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
      <line x1={0} x2={W} y1={mid} y2={mid} stroke="#1a1a2c" strokeWidth="1" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * W;
        const barH = Math.abs(d.pressure) * (H / 2 - 10);
        const y = d.pressure >= 0 ? mid - barH : mid;
        const color = d.pressure >= 0 ? "#22c55e" : "#ef4444";
        return <rect key={i} x={x - 4} y={y} width={8} height={barH} rx={2} fill={color} opacity={0.6} />;
      })}
      <text x={8} y={20} fill="#22c55e" fontSize="10" fontFamily="sans-serif">Buy Pressure (+1)</text>
      <text x={8} y={H - 8} fill="#ef4444" fontSize="10" fontFamily="sans-serif">Sell Pressure (-1)</text>
    </svg>
  );
}

function GARCHChart({ data }) {
  const W = 700, H = 260;
  const maxVol = Math.max(...data.map(d => d.hi));
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
        {/* Confidence interval bands */}
        <polygon fill="#f59e0b" opacity={0.1}
          points={
            data.map((d, i) => `${(i / (data.length - 1)) * W},${H - 20 - (d.hi / maxVol) * (H - 40)}`).join(" ") + " " +
            [...data].reverse().map((d, i) => `${((data.length - 1 - i) / (data.length - 1)) * W},${H - 20 - (d.lo / maxVol) * (H - 40)}`).join(" ")
          }
        />
        {/* Forecast line */}
        <polyline fill="none" stroke="#f59e0b" strokeWidth="2"
          points={data.map((d, i) => `${(i / (data.length - 1)) * W},${H - 20 - (d.vol / maxVol) * (H - 40)}`).join(" ")} />
        {/* Data points */}
        {data.map((d, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * W} cy={H - 20 - (d.vol / maxVol) * (H - 40)} r={4} fill="#f59e0b" />
        ))}
        {/* Labels */}
        {data.map((d, i) => (
          <text key={i} x={(i / (data.length - 1)) * W} y={H - 4} fill="#505060" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
            +{i + 1}h
          </text>
        ))}
      </svg>
      <div className="flex items-center gap-5 mt-3 justify-center text-[11px]">
        <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-amber-400" /><span className="text-gray-400">Forecast Vol</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-400/20" /><span className="text-gray-400">95% CI</span></div>
      </div>
    </div>
  );
}

function ZScoreChart({ data }) {
  const W = 700, H = 260;
  const minZ = Math.min(...data.map(d => d.z));
  const maxZ = Math.max(...data.map(d => d.z));
  const zRange = Math.max(Math.abs(minZ), Math.abs(maxZ), 3);
  const mid = H / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
      {/* Zero line */}
      <line x1={0} x2={W} y1={mid} y2={mid} stroke="#1a1a2c" strokeWidth="1" />
      {/* ±2.5 threshold lines */}
      <line x1={0} x2={W} y1={mid - (2.5 / zRange) * (H / 2 - 10)} y2={mid - (2.5 / zRange) * (H / 2 - 10)} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="4" />
      <line x1={0} x2={W} y1={mid + (2.5 / zRange) * (H / 2 - 10)} y2={mid + (2.5 / zRange) * (H / 2 - 10)} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="4" />
      <text x={W - 4} y={mid - (2.5 / zRange) * (H / 2 - 10) - 4} fill="#ef4444" fontSize="9" textAnchor="end" fontFamily="sans-serif">+2.5σ</text>
      <text x={W - 4} y={mid + (2.5 / zRange) * (H / 2 - 10) + 12} fill="#ef4444" fontSize="9" textAnchor="end" fontFamily="sans-serif">-2.5σ</text>
      {/* Z-score line */}
      <polyline fill="none" stroke="#10b981" strokeWidth="1.5"
        points={data.map((d, i) => {
          const x = (i / (data.length - 1)) * W;
          const y = mid - (d.z / zRange) * (H / 2 - 10);
          return `${x},${y}`;
        }).join(" ")}
      />
      {/* Alert dots */}
      {data.filter(d => Math.abs(d.z) >= 2.5).map((d, i) => {
        const x = (data.indexOf(d) / (data.length - 1)) * W;
        const y = mid - (d.z / zRange) * (H / 2 - 10);
        return <circle key={i} cx={x} cy={y} r={5} fill="#ef4444" opacity={0.8} />;
      })}
    </svg>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function AnalysisLayer() {
  const [activeModel, setActiveModel] = useState("hmm");
  const [symbol, setSymbol] = useState("NQ=F");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [results, setResults] = useState({});

  const model = MODELS.find(m => m.key === activeModel);
  const Icon = model.icon;

  // Generate initial demo data
  useEffect(() => {
    setResults({
      hmm: genRegimeData(),
      ofi: genOFIData(),
      garch: genGARCHData(),
      zscore: genZScoreData(),
    });
  }, []);

  const handleRun = () => {
    setRunning(true);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(iv);
          setRunning(false);
          setResults(prev => ({
            ...prev,
            [activeModel]:
              activeModel === "hmm" ? genRegimeData() :
              activeModel === "ofi" ? genOFIData() :
              activeModel === "garch" ? genGARCHData() :
              genZScoreData(),
          }));
          return 100;
        }
        return p + 3;
      });
    }, 30);
  };

  // Summary stats per model
  const getSummary = () => {
    const data = results[activeModel];
    if (!data || !data.length) return [];

    if (activeModel === "hmm") {
      const counts = { "Low Vol": 0, "Chop": 0, "High Vol": 0 };
      data.forEach(d => counts[d.regime]++);
      const current = data[data.length - 1].regime;
      return [
        { label: "Current Regime", value: current, color: current === "Low Vol" ? "#22c55e" : current === "Chop" ? "#f59e0b" : "#ef4444" },
        { label: "Low Vol Bars", value: counts["Low Vol"], color: "#22c55e" },
        { label: "Chop Bars", value: counts["Chop"], color: "#f59e0b" },
        { label: "High Vol Bars", value: counts["High Vol"], color: "#ef4444" },
        { label: "Total Bars", value: data.length, color: "#9ca3af" },
      ];
    }
    if (activeModel === "ofi") {
      const current = data[data.length - 1].pressure;
      const avg = data.reduce((s, d) => s + d.pressure, 0) / data.length;
      const buyBars = data.filter(d => d.pressure > 0).length;
      return [
        { label: "Current OFI", value: current.toFixed(2), color: current >= 0 ? "#22c55e" : "#ef4444" },
        { label: "Avg Pressure", value: avg.toFixed(2), color: avg >= 0 ? "#22c55e" : "#ef4444" },
        { label: "Buy Bars", value: buyBars, color: "#22c55e" },
        { label: "Sell Bars", value: data.length - buyBars, color: "#ef4444" },
        { label: "Signal", value: Math.abs(current) > 0.6 ? "Strong" : "Neutral", color: Math.abs(current) > 0.6 ? "#f59e0b" : "#9ca3af" },
      ];
    }
    if (activeModel === "garch") {
      const next = data[0];
      const last = data[data.length - 1];
      return [
        { label: "Next Hour Vol", value: `${next.vol}%`, color: "#f59e0b" },
        { label: "4h Forecast", value: `${last.vol}%`, color: "#f59e0b" },
        { label: "95% CI Low", value: `${next.lo}%`, color: "#3b82f6" },
        { label: "95% CI High", value: `${next.hi}%`, color: "#3b82f6" },
        { label: "Forecast Hours", value: data.length, color: "#9ca3af" },
      ];
    }
    if (activeModel === "zscore") {
      const current = data[data.length - 1];
      const alerts = data.filter(d => Math.abs(d.z) >= 2.5).length;
      return [
        { label: "Current Z", value: current.z.toFixed(2), color: Math.abs(current.z) >= 2.5 ? "#ef4444" : "#10b981" },
        { label: "Price", value: current.price.toFixed(2), color: "#e0e0f0" },
        { label: "VWAP", value: current.vwap.toFixed(2), color: "#3b82f6" },
        { label: "Alerts (±2.5σ)", value: alerts, color: "#ef4444" },
        { label: "Signal", value: current.z > 2 ? "Overbought" : current.z < -2 ? "Oversold" : "Neutral", color: current.z > 2 ? "#ef4444" : current.z < -2 ? "#22c55e" : "#9ca3af" },
      ];
    }
    return [];
  };

  const renderChart = () => {
    const data = results[activeModel];
    if (!data || !data.length) return null;
    if (activeModel === "hmm") return <RegimeChart data={data} />;
    if (activeModel === "ofi") return <OFIChart data={data} />;
    if (activeModel === "garch") return <GARCHChart data={data} />;
    if (activeModel === "zscore") return <ZScoreChart data={data} />;
    return null;
  };

  return (
    <div className="h-screen bg-[#0a0a10] pl-16 flex flex-col text-white overflow-hidden">
      <MainNav />

      {/* Toolbar */}
      <div className="border-b border-gray-800/60 bg-[#0a0a10] px-5 py-2.5 flex items-center gap-3 shrink-0" style={{ fontFamily: "sans-serif" }}>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Analysis</span>

        {/* Model dropdown */}
        <div className="relative">
          <select
            value={activeModel}
            onChange={e => setActiveModel(e.target.value)}
            className="bg-gray-900/60 border border-gray-800/50 text-white text-xs font-medium rounded-lg px-3 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none"
          >
            {MODELS.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Symbol */}
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

        {/* Run */}
        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          {running ? "Running..." : "Run Model"}
        </button>

        {running && (
          <div className="flex items-center gap-2 ml-1">
            <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: model.color }} />
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{progress}%</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2 text-[10px] text-gray-600">
          <span className="px-2 py-0.5 rounded bg-gray-900/60 border border-gray-800/30" style={{ color: model.color }}>{model.method}</span>
          <span>{symbol.replace("=F", "")} · 1m data</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-4 gap-0 overflow-hidden">

        {/* Left: Model info + stats */}
        <div className="col-span-1 border-r border-gray-800/40 flex flex-col overflow-hidden">
          {/* Model card */}
          <div className="p-5 border-b border-gray-800/40">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: model.color + "15" }}>
                <Icon className="w-4 h-4" style={{ color: model.color }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{model.label}</div>
                <div className="text-[10px] text-gray-600">{model.method}</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{model.description}</p>
          </div>

          {/* Summary stats */}
          <div className="p-5 flex-1">
            <div className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-3">Results</div>
            <div className="space-y-3">
              {getSummary().map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{s.label}</span>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Model list */}
          <div className="border-t border-gray-800/40 p-3">
            <div className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-2 px-2">Models</div>
            {MODELS.map(m => {
              const MIcon = m.icon;
              const isActive = m.key === activeModel;
              return (
                <button
                  key={m.key}
                  onClick={() => setActiveModel(m.key)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-all ${
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

        {/* Right: Chart */}
        <div className="col-span-3 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color: model.color }} />
              <span className="text-sm font-semibold text-white">{model.label}</span>
              <span className="text-[10px] text-gray-600 ml-2">{symbol.replace("=F", "")} · 1-minute bars</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <Clock className="w-3 h-3" />
              Last run: just now
            </div>
          </div>

          <div className="flex-1 bg-gray-900/30 border border-gray-800/30 rounded-xl p-5 flex items-center justify-center min-h-0">
            {running ? (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: model.color }} />
                <span className="text-sm">Running {model.label}...</span>
              </div>
            ) : results[activeModel] ? (
              <div className="w-full">{renderChart()}</div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-600">
                <Activity className="w-8 h-8 text-gray-700" />
                <span className="text-sm">Click <span className="font-semibold" style={{ color: model.color }}>Run Model</span> to analyze</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
