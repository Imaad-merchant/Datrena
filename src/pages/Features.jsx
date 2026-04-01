import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Database, TrendingUp, Lightbulb, CheckCircle, ArrowRight,
  BarChart3, Activity, LineChart, PieChart, Calendar, Target,
  Shuffle, FlaskConical, Shield, Layers, Eye, Crosshair, Clock,
  Wifi, GitBranch, SlidersHorizontal, Timer, Maximize2,
} from "lucide-react";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";
import chartHeroImg from "../assets/chart-hero.png";

/* ── Data Layer: all built features ──────────────────────────────────── */
const DATA_FEATURES = [
  {
    icon: BarChart3,
    title: "Order Flow Footprint Chart",
    description: "Canvas-based footprint chart rendering bid/ask volume at every price level. Visualize order flow imbalances (3:1 ratio detection), Point of Control (POC), and session volume profile. Numbers remain visible at all zoom levels with adaptive font scaling.",
  },
  {
    icon: Layers,
    title: "DOM Depth Heatmap",
    description: "Real-time depth of market visualization overlaid directly on the chart background. Color-coded intensity shows where resting liquidity is concentrated across bid and ask levels.",
  },
  {
    icon: Eye,
    title: "Iceberg Detection",
    description: "Automatic detection of hidden iceberg orders that repeatedly replenish at the same price level. Diamond markers appear on the chart showing estimated hidden size, visible size, and fill count.",
  },
  {
    icon: Crosshair,
    title: "Order Tracking",
    description: "Visualize every order event directly on the chart — adds (green), cancels (red), modifies (yellow), and fills (white). See exactly how the order book is changing in real time at each price level.",
  },
  {
    icon: Clock,
    title: "Pull Rate Analysis",
    description: "Track how often resting orders are pulled vs. filled at each price level. Color-coded bars on the price axis show pull rate intensity — high pull rates indicate spoofing or fake liquidity.",
  },
  {
    icon: GitBranch,
    title: "Resting Orders",
    description: "See aggregate resting order size at each price level as horizontal bars within the chart viewport. Instantly identify large resting bids/asks that may act as support or resistance.",
  },
  {
    icon: Activity,
    title: "Delta & Volume Analysis",
    description: "Per-candle delta (aggressive buy vs. sell volume), cumulative delta across the session, and total volume summaries in the footer. Reveals whether buyers or sellers are driving each move.",
  },
  {
    icon: SlidersHorizontal,
    title: "OHLCV Info Bar",
    description: "TradingView-style ticker info bar showing Open, High, Low, Close values that update on hover. Displays instrument name, exchange, and real-time price data at a glance.",
  },
  {
    icon: Timer,
    title: "12 Timeframes",
    description: "From 1-minute to Monthly — 12 timeframes with live countdown timer. Switch timeframes without losing history — all candle data is re-bucketed from stored 1-minute resolution data.",
  },
  {
    icon: Maximize2,
    title: "Infinite Zoom",
    description: "No limits on compressing or stretching the price and time axes. Zoom in to see individual tick-level detail, or zoom out to see the full session. Double-click to reset to default view.",
  },
  {
    icon: Wifi,
    title: "Real-Time Latency Monitor",
    description: "Live latency indicator on the toolbar showing milliseconds between trade timestamp and receipt. Color-coded green (<50ms), yellow (<150ms), or red for instant connection quality awareness.",
  },
  {
    icon: LineChart,
    title: "Volume Profile & POC",
    description: "Session volume profile on the left axis showing total volume traded at each price level. Point of Control line marks the price with the highest volume, a key level for support/resistance.",
  },
];

/* ── Other layers (coming soon) ──────────────────────────────────────── */
const FUTURE_SECTIONS = [
  {
    id: "analysis-layer",
    title: "Analysis Layer",
    icon: TrendingUp,
    color: "#8b5cf6",
    description: "AI-driven statistical analysis on OHLCVD market data. Surface patterns, correlations, and behavioral signatures across instruments and timeframes.",
    features: [
      { icon: LineChart, title: "Volatility Charting", description: "Visualize volatility across time and price to identify regime shifts, mean-reversion setups, and trend continuation signals." },
      { icon: Shuffle, title: "Combinatorial Analysis", description: "Discover statistically significant sequences of market events. Uncover non-obvious edge patterns invisible to traditional indicator-based analysis." },
      { icon: PieChart, title: "AI Data Analysis", description: "Deep quantitative analysis powered by AI on OHLCVD data. Surface correlations, distributions, and behavioral patterns across instruments and timeframes." },
    ],
  },
  {
    id: "insight-layer",
    title: "Insight Layer",
    icon: Lightbulb,
    color: "#f59e0b",
    description: "Connect to your prop firm accounts and surface performance metrics, trade history, and risk analytics in one unified dashboard.",
    features: [
      { icon: BarChart3, title: "P&L Tracking", description: "Monitor realized and unrealized P&L across all connected accounts in real time. Drill down by session, symbol, or date range." },
      { icon: Target, title: "Win Rate Analytics", description: "Track win rate, average winner vs. loser, and expectancy. See how metrics evolve over time and under different market conditions." },
      { icon: Activity, title: "Drawdown Monitoring", description: "Maximum peak-to-trough decline tracked in real time. Identify underperformance before it escalates beyond prop firm risk limits." },
      { icon: Calendar, title: "Trade Calendar Heatmap", description: "Color-coded calendar showing daily P&L. Spot patterns in performance across days of the week, months, and trading sessions." },
    ],
  },
  {
    id: "validation-layer",
    title: "Validation Layer",
    icon: CheckCircle,
    color: "#10b981",
    description: "Rigorously test and validate trading strategies before risking real capital. Ensure your edge is statistically robust, not the product of curve-fitting.",
    features: [
      { icon: FlaskConical, title: "Strategy Backtesting", description: "Test strategies against historical data with tick-level accuracy. Evaluate across different market regimes, sessions, and instruments." },
      { icon: TrendingUp, title: "Walk-Forward Analysis", description: "Re-optimize on rolling windows and validate on unseen data. Ensures parameters hold up across changing conditions." },
      { icon: Shuffle, title: "Monte Carlo Simulation", description: "Run thousands of simulated trade sequences to understand probability distributions and worst-case drawdown scenarios." },
      { icon: Shield, title: "Risk-Adjusted Metrics", description: "Sharpe, Sortino, Calmar, and other industry-standard measures. Evaluate strategies beyond simple win rate or P&L." },
    ],
  },
];

export default function Features() {
  return (
    <div className="bg-black min-h-screen text-white">
      <LandingNav activePage="/Features" />

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 pt-12 pb-16 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">Platform Features</h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Professional-grade order flow analysis tools built on Rithmic MBO Level 3 data. From raw market data to validated strategies.
        </p>
      </section>

      {/* ═══ Data Layer (live — expanded) ═══ */}
      <section id="data-layer" className="border-t border-gray-800/40 bg-black">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10">
              <Database className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Data Layer</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">Live</span>
          </div>
          <p className="text-gray-400 text-sm mb-8 max-w-3xl leading-relaxed">
            Real-time order flow visualization powered by Rithmic MBO Level 3 data. The Data Layer provides a direct window into the exchange's matching engine, showing every individual order event as it happens. 7+ toggleable MBO overlays, 12 timeframes, infinite zoom, and sub-10ms relay latency.
          </p>

          {/* Chart screenshot */}
          <div className="mb-10 rounded-xl overflow-hidden border border-gray-800/50 bg-[#0a0a10]">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#111118] border-b border-gray-800/40">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[10px] text-gray-500 font-mono mx-auto">ES S&P 500 E-mini &mdash; 5m Footprint Chart</span>
            </div>
            <img src={chartHeroImg} alt="Datrena Order Flow Footprint Chart" className="w-full block" />
          </div>

          {/* Feature grid — 3 cols, 4 rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DATA_FEATURES.map(f => {
              const FIcon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-gray-900/40 border border-gray-800/40 rounded-lg p-5 hover:border-blue-500/30 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/15 transition-colors">
                    <FIcon className="w-4.5 h-4.5 text-blue-400" />
                  </div>
                  <h3 className="text-white text-sm font-semibold mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Future layers ═══ */}
      {FUTURE_SECTIONS.map((section, si) => {
        const Icon = section.icon;
        return (
          <section
            key={section.title}
            id={section.id}
            className={`border-t border-gray-800/40 ${si % 2 === 0 ? "bg-gray-950/30" : "bg-black"}`}
          >
            <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: section.color + "15" }}
                >
                  <Icon className="w-4 h-4" style={{ color: section.color }} />
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">Coming Soon</span>
              </div>
              <p className="text-gray-400 text-sm mb-8 max-w-2xl leading-relaxed">{section.description}</p>

              <div className={`grid grid-cols-1 md:grid-cols-${section.features.length >= 4 ? "2 lg:grid-cols-4" : "3"} gap-4`}>
                {section.features.map(f => {
                  const FIcon = f.icon;
                  return (
                    <div
                      key={f.title}
                      className="bg-gray-900/40 border border-gray-800/40 rounded-lg p-5 hover:border-gray-700/60 transition-colors"
                    >
                      <FIcon className="w-5 h-5 mb-3" style={{ color: section.color }} />
                      <h3 className="text-white text-sm font-semibold mb-2">{f.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">{f.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* ═══ Exchange Data ═══ */}
      <section className="border-t border-gray-800/40">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16">
          <h2 className="text-xl font-bold text-white mb-2">Exchange Data</h2>
          <p className="text-gray-500 text-sm mb-6">All data delivered via Rithmic MBO Level 3 feed. Exchange fees may apply separately.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: "CME", instruments: "ES (S&P 500), NQ (Nasdaq 100), 6E, 6B" },
              { name: "CBOT", instruments: "YM (Dow), ZB (Bonds), ZN (Notes)" },
              { name: "NYMEX", instruments: "CL (Crude Oil), NG (Natural Gas)" },
              { name: "COMEX", instruments: "GC (Gold), SI (Silver)" },
            ].map(ex => (
              <div key={ex.name} className="bg-gray-900/60 border border-gray-800/50 rounded-lg px-4 py-3">
                <span className="text-white text-sm font-semibold">{ex.name}</span>
                <p className="text-gray-500 text-xs mt-1">{ex.instruments}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="border-t border-gray-800/40 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Start trading with better data</h2>
          <p className="text-gray-400 text-sm mb-6">Free tier available. No credit card required.</p>
          <button
            onClick={() => base44.auth.redirectToLogin("/QuantHome")}
            className="bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors text-sm inline-flex items-center gap-2"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
