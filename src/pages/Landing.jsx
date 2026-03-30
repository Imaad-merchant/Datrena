import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Database, TrendingUp, Lightbulb, CheckCircle, ArrowRight,
  Wifi, ChevronRight,
} from "lucide-react";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";
import TradersSection from "../components/landing/TradersSection";

/* ── Four platform layers ──────────────────────────────────────────────── */
const LAYERS = [
  {
    title: "Data Layer", icon: Database, color: "#3b82f6",
    status: "Live", anchor: "/Features#data-layer",
    description: "Real-time order flow visualization powered by Rithmic MBO Level 3 data. Footprint charts, DOM heatmaps, iceberg detection, and more.",
    tags: ["Footprint Chart", "DOM Heatmap", "Iceberg Detection", "Order Tracking", "Pull Rate", "Delta/Volume"],
  },
  {
    title: "Analysis Layer", icon: TrendingUp, color: "#8b5cf6",
    status: "Coming Soon", anchor: "/Features#analysis-layer",
    description: "AI-driven statistical research on OHLCVD market data. Volatility surfaces, combinatorial analysis, and pattern discovery.",
    tags: ["Volatility Charting", "Combinatorics", "AI Analysis"],
  },
  {
    title: "Insight Layer", icon: Lightbulb, color: "#f59e0b",
    status: "Coming Soon", anchor: "/Features#insight-layer",
    description: "Prop firm performance tracking — P&L, drawdown monitoring, win rate analytics, and trade calendar heatmaps.",
    tags: ["P&L Tracking", "Win Rate", "Drawdown", "Calendar"],
  },
  {
    title: "Validation Layer", icon: CheckCircle, color: "#10b981",
    status: "Coming Soon", anchor: "/Features#validation-layer",
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
        <div className="max-w-2xl">
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

            {/* One bullet per layer */}
            <ul className="space-y-2.5 mb-10">
              {[
                { label: "Real-Time Order Flow & Footprint Charts", color: "#3b82f6" },
                { label: "AI-Driven Statistical Analysis", color: "#8b5cf6" },
                { label: "Prop Firm Performance Tracking", color: "#f59e0b" },
                { label: "Strategy Backtesting & Validation", color: "#10b981" },
              ].map(item => (
                <li key={item.label} className="flex items-center gap-3 text-[13px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-300">{item.label}</span>
                </li>
              ))}
            </ul>

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
                <Link
                  to={layer.anchor}
                  key={layer.title}
                  className="relative bg-gray-900/40 rounded-xl p-6 border border-gray-800/40 hover:border-gray-700/60 transition-all group cursor-pointer no-underline"
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
                </Link>
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
