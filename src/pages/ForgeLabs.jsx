import React from "react";
import { Link } from "react-router-dom";
import { FlaskConical, Code2, Cpu, Database, ArrowRight, Clock, CheckCircle2, Circle } from "lucide-react";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";

const ROADMAP = [
  {
    phase: "Phase 1",
    title: "Data Foundation",
    status: "live",
    items: [
      "Canvas-based Footprint Chart",
      "Rithmic MBO Level 3 WebSocket Relay",
      "Delta / Volume / Cumulative Delta",
      "Multi-timeframe Candlestick Charts",
      "TradingView-style Pan & Zoom",
    ],
  },
  {
    phase: "Phase 2",
    title: "AI & Analysis",
    status: "building",
    items: [
      "AI Quant Chat with MBO data access",
      "Volatility surface modeling",
      "Combinatorial pattern detection",
      "Statistical distribution analysis",
    ],
  },
  {
    phase: "Phase 3",
    title: "Performance & Insight",
    status: "planned",
    items: [
      "Prop firm account connection",
      "P&L tracking & drawdown monitoring",
      "Trade calendar heatmap",
      "Win rate & expectancy analytics",
    ],
  },
  {
    phase: "Phase 4",
    title: "Validation Engine",
    status: "planned",
    items: [
      "Event-driven backtesting engine",
      "Walk-forward analysis framework",
      "Monte Carlo simulation",
      "Risk-adjusted performance metrics",
    ],
  },
];

const VISION_ITEMS = [
  {
    icon: Code2,
    title: "Browser-Based IDE",
    description: "Write and test quantitative strategies directly in the browser with a standardized API. Initialize(), OnData(), and event-driven execution on tick-level data.",
  },
  {
    icon: Cpu,
    title: "Institutional-Grade Engine",
    description: "An event-driven backtesting engine that processes tick-level data, not just aggregated candles. Walk-forward optimization and out-of-sample validation built in.",
  },
  {
    icon: Database,
    title: "Full Data Pipeline",
    description: "From raw MBO Level 3 feed to normalized OHLCVD, accessible to both the AI assistant and custom strategies. Every order event, every tick, every fill.",
  },
];

function StatusIcon({ status }) {
  if (status === "live") return <CheckCircle2 className="w-4 h-4 text-green-400" />;
  if (status === "building") return <Clock className="w-4 h-4 text-blue-400 animate-pulse" />;
  return <Circle className="w-4 h-4 text-gray-600" />;
}

function StatusLabel({ status }) {
  if (status === "live") return <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 rounded px-2 py-0.5">Live</span>;
  if (status === "building") return <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-0.5">Building</span>;
  return <span className="text-[10px] text-gray-500 bg-gray-800 border border-gray-700 rounded px-2 py-0.5">Planned</span>;
}

export default function ForgeLabs() {
  return (
    <div className="bg-black min-h-screen text-white">
      <LandingNav activePage="/ForgeLabs" />

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 pt-12 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Forge Labs</h1>
            <p className="text-gray-500 text-xs">Research, development, and what's next for Datrena</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Forge Labs is where Datrena's next features are designed and tested. Our goal is to build an institutional-grade quant environment — a browser-based platform for strategy research, backtesting, and deployment on real market data.
        </p>
      </section>

      {/* Roadmap */}
      <section className="border-t border-gray-800/40">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16">
          <h2 className="text-xl font-bold text-white mb-2">Roadmap</h2>
          <p className="text-gray-500 text-sm mb-8">Transparent progress on what we're building and when.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROADMAP.map(phase => (
              <div
                key={phase.phase}
                className={`rounded-xl border p-5 ${
                  phase.status === "live"
                    ? "bg-green-500/5 border-green-500/20"
                    : phase.status === "building"
                    ? "bg-blue-500/5 border-blue-500/20"
                    : "bg-gray-900/30 border-gray-800/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={phase.status} />
                    <span className="text-xs text-gray-400 font-medium">{phase.phase}</span>
                  </div>
                  <StatusLabel status={phase.status} />
                </div>
                <h3 className="text-white text-sm font-semibold mb-3">{phase.title}</h3>
                <ul className="space-y-1.5">
                  {phase.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                        phase.status === "live" ? "bg-green-400" : phase.status === "building" ? "bg-blue-400" : "bg-gray-600"
                      }`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="border-t border-gray-800/40 bg-gray-950/30">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16">
          <h2 className="text-xl font-bold text-white mb-2">The Vision</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-2xl">
            We're building toward a QuantConnect-style environment for futures traders — event-driven backtesting, browser-based strategy development, and cloud deployment, all powered by Rithmic Level 3 data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VISION_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-gray-900/40 border border-gray-800/40 rounded-lg p-5">
                  <Icon className="w-5 h-5 text-purple-400 mb-3" />
                  <h3 className="text-white text-sm font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800/40 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Want early access?</h2>
          <p className="text-gray-400 text-sm mb-6">Download Datrena and be the first to test new features as they ship.</p>
          <button
            onClick={() => window.location.href = "/Download"}
            className="bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors text-sm inline-flex items-center gap-2"
          >
            Download Datrena <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
