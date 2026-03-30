import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Database, TrendingUp, Lightbulb, CheckCircle, ArrowRight, Zap,
  BarChart3, Activity, Layers, Eye, Crosshair, Clock, Wifi,
  Monitor, ChevronRight,
} from "lucide-react";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";
import TradersSection from "../components/landing/TradersSection";
import chartHeroImg from "../assets/chart-hero.png";

/* ── Data Layer highlight features (what's actually built) ─────────────── */
const HIGHLIGHT_FEATURES = [
  {
    icon: BarChart3, title: "Order Flow Footprint",
    desc: "Bid/ask volume at every price level with imbalance detection, POC line, and session volume profile.",
  },
  {
    icon: Layers, title: "DOM Depth Heatmap",
    desc: "Real-time depth of market visualization overlaid on the chart. See resting liquidity at a glance.",
  },
  {
    icon: Eye, title: "Iceberg Detection",
    desc: "Automatic detection of hidden iceberg orders replenishing at the same price level.",
  },
  {
    icon: Activity, title: "Delta & Volume",
    desc: "Per-candle delta, cumulative delta, and total volume. Know who's driving every move.",
  },
  {
    icon: Crosshair, title: "Order Tracking",
    desc: "Visualize every order event — adds, cancels, modifies, and fills — directly on the chart.",
  },
  {
    icon: Clock, title: "Pull Rate Analysis",
    desc: "Track how often resting orders are pulled vs. filled at each price level.",
  },
];

/* ── Four platform layers ──────────────────────────────────────────────── */
const LAYERS = [
  {
    title: "Data Layer", icon: Database, color: "#3b82f6",
    status: "Live",
    description: "Real-time order flow visualization powered by Rithmic MBO Level 3 data. Footprint charts, DOM heatmaps, iceberg detection, and more.",
    tags: ["Footprint Chart", "DOM Heatmap", "Iceberg Detection", "Order Tracking", "Pull Rate", "Delta/Volume"],
  },
  {
    title: "Analysis Layer", icon: TrendingUp, color: "#8b5cf6",
    status: "Coming Soon",
    description: "AI-driven statistical research on OHLCVD market data. Volatility surfaces, combinatorial analysis, and pattern discovery.",
    tags: ["Volatility Charting", "Combinatorics", "AI Analysis"],
  },
  {
    title: "Insight Layer", icon: Lightbulb, color: "#f59e0b",
    status: "Coming Soon",
    description: "Prop firm performance tracking — P&L, drawdown monitoring, win rate analytics, and trade calendar heatmaps.",
    tags: ["P&L Tracking", "Win Rate", "Drawdown", "Calendar"],
  },
  {
    title: "Validation Layer", icon: CheckCircle, color: "#10b981",
    status: "Coming Soon",
    description: "Backtest and validate strategies with walk-forward analysis, Monte Carlo simulation, and risk-adjusted metrics.",
    tags: ["Backtesting", "Walk-Forward", "Monte Carlo", "Risk Metrics"],
  },
];

/* ── Stats bar ─────────────────────────────────────────────────────────── */
const STATS = [
  { value: "Level 3",  label: "MBO Market Data" },
  { value: "0.25",     label: "Tick Resolution" },
  { value: "7+",       label: "MBO Overlays" },
  { value: "<10ms",    label: "Relay Latency" },
  { value: "12",       label: "Timeframes" },
  { value: "4",        label: "CME Exchanges" },
];

export default function Landing() {
  const handleSignIn = () => {
    base44.auth.redirectToLogin("/QuantHome");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <LandingNav activePage="/" />

      {/* ═══ Hero ═══ */}
      <section className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5 mb-6">
              <Wifi className="w-3 h-3" />
              Live &mdash; Rithmic MBO Level 3 Order Flow
            </div>
            <h1 className="text-4xl lg:text-[3.25rem] font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Professional Order Flow<br />Analysis Platform
            </h1>
            <p className="text-gray-400 text-[15px] mb-8 max-w-lg leading-relaxed">
              Institutional-grade footprint charts with real-time MBO data from Rithmic. See every order event in the exchange's matching engine — icebergs, pulls, resting liquidity, and aggressive flow.
            </p>

            {/* Key bullet points */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-10">
              {[
                "Order Flow Footprint",
                "DOM Depth Heatmap",
                "Iceberg Detection",
                "Order Tracking",
                "Pull Rate Analysis",
                "Resting Orders",
                "Delta & Volume",
                "12 Timeframes (1m-Monthly)",
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-[13px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSignIn}
                className="bg-white text-black font-semibold px-7 py-3.5 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
              >
                Start for Free <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/Features"
                className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1 border border-gray-700 hover:border-gray-500 px-6 py-3.5 rounded-lg"
              >
                View All Features <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right — monitor mockup with chart screenshot */}
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl shadow-blue-500/5 bg-[#0a0a10]">
              {/* Monitor top bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111118] border-b border-gray-800/60">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[10px] text-gray-500 font-mono">Datrena &mdash; ES S&P 500 E-mini</span>
                </div>
              </div>
              <img
                src={chartHeroImg}
                alt="Datrena Order Flow Footprint Chart"
                className="w-full block"
              />
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-blue-500/5 blur-3xl rounded-full -z-10" />
          </div>
        </div>
      </section>

      {/* ═══ Stats bar ═══ */}
      <section className="border-y border-gray-800/60 bg-gray-950/60">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-8 grid grid-cols-3 md:grid-cols-6 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Data Layer Features (what's built) ═══ */}
      <section className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-4">
            <Database className="w-3 h-3" /> Data Layer
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            Full Suite of Order Flow Tools
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Every tool a professional futures trader needs to read the tape. Built on Rithmic MBO Level 3 data — the same feed powering institutional trading desks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HIGHLIGHT_FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-6 hover:border-blue-500/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/15 transition-colors">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-white text-[15px] font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ Four Layers ═══ */}
      <section className="border-t border-gray-800/60 bg-gray-950/30">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-24">
          <div className="text-center mb-14">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Four Integrated Layers
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              From raw market data to validated strategies. Each layer builds on the last to give you a complete analytical edge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {LAYERS.map(layer => {
              const Icon = layer.icon;
              const isLive = layer.status === "Live";
              return (
                <div
                  key={layer.title}
                  className="relative bg-gray-900/40 rounded-xl p-6 border border-gray-800/40 hover:border-gray-700/60 transition-all group"
                >
                  {/* Status badge */}
                  <div className={`absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isLive ? "bg-blue-500/15 text-blue-400" : "bg-gray-800 text-gray-500"
                  }`}>
                    {layer.status}
                  </div>

                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: layer.color + "12" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: layer.color }} />
                  </div>
                  <h3 className="text-white text-[15px] font-semibold mb-2">{layer.title}</h3>
                  <p className="text-gray-500 text-xs mb-4 leading-relaxed">{layer.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {layer.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-gray-800/60 border border-gray-700/40"
                        style={{ color: layer.color + "bb" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Traders Section ═══ */}
      <TradersSection onSignIn={handleSignIn} />

      {/* ═══ CTA ═══ */}
      <section className="border-t border-gray-800/60 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-24 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">Ready to see what's behind the price?</h2>
          <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto">
            Stop guessing. Start reading the order flow. Get access to the full footprint chart suite with real-time MBO data today.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSignIn}
              className="bg-white text-black font-semibold px-8 py-3.5 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/Pricing"
              className="text-gray-400 hover:text-white text-sm border border-gray-700 hover:border-gray-500 px-7 py-3.5 rounded-lg transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
