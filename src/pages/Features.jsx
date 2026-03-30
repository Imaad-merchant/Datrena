import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Database, TrendingUp, Lightbulb, CheckCircle, ArrowRight,
  BarChart3, Activity, LineChart, PieChart, Calendar, Target,
  Shuffle, FlaskConical, Shield
} from "lucide-react";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";

const HERO_IMG = "https://media.base44.com/images/public/69a877fa3c3927b616239696/ea49b83e1_Screenshot2026-03-19at55922PM.png";

const SECTIONS = [
  {
    title: "Data Layer",
    icon: Database,
    color: "#3b82f6",
    ready: true,
    description: "Real-time order flow visualization powered by Rithmic MBO Level 3 data. The Data Layer provides a direct window into the exchange's matching engine, showing every individual order event as it happens.",
    features: [
      { icon: BarChart3, title: "DOM Footprint Chart", description: "Canvas-based footprint chart rendering bid/ask volume at every price level. Visualize order flow imbalances (3:1 ratio detection), Point of Control, and session volume profile — all updated tick-by-tick." },
      { icon: Activity, title: "Delta & Volume Analysis", description: "Per-candle delta (aggressive buy vs. sell volume), cumulative delta across the session, and total volume summaries. Reveals whether buyers or sellers are driving each price move." },
      { icon: LineChart, title: "Candlestick Chart", description: "OHLC candlesticks with mini-candle rendering inside footprint cells. Multiple timeframes (1m, 5m, 15m, 30m) with live countdown timer. TradingView-style drag-to-pan and scroll-to-zoom." },
    ],
  },
  {
    title: "Analysis Layer",
    icon: TrendingUp,
    color: "#8b5cf6",
    ready: false,
    description: "AI-driven statistical analysis on OHLCVD market data. The Analysis Layer uses machine learning to surface patterns, correlations, and behavioral signatures across instruments and timeframes.",
    features: [
      { icon: LineChart, title: "Volatility Charting", description: "Visualize volatility across time and price to identify regime shifts, mean-reversion setups, and trend continuation signals. Request custom volatility surfaces for any date range through the AI assistant." },
      { icon: Shuffle, title: "Combinatorial Analysis", description: "Apply combinatorial methods to discover statistically significant sequences of market events. Uncover non-obvious edge patterns that traditional indicator-based analysis cannot detect." },
      { icon: PieChart, title: "AI Data Analysis", description: "Deep quantitative analysis powered by AI on OHLCVD data. Surface correlations, distributions, and behavioral patterns across multiple instruments and timeframes simultaneously." },
    ],
  },
  {
    title: "Insight Layer",
    icon: Lightbulb,
    color: "#f59e0b",
    ready: false,
    description: "Connect to your prop firm accounts and surface performance metrics, trade history, and risk analytics in one unified dashboard. Know exactly where your edge is performing — and where it isn't.",
    features: [
      { icon: BarChart3, title: "P&L Tracking", description: "Monitor realized and unrealized P&L across all connected accounts in real time. Drill down by session, symbol, or date range to understand performance at a granular level." },
      { icon: Target, title: "Win Rate Analytics", description: "Track win rate, average winner vs. loser, and expectancy across all trades. See how these metrics evolve over time and under different market conditions." },
      { icon: Activity, title: "Drawdown Monitoring", description: "Maximum peak-to-trough decline tracked in real time. Drawdown curves help identify underperformance before it escalates beyond prop firm risk limits." },
      { icon: Calendar, title: "Trade Calendar Heatmap", description: "Color-coded calendar showing daily P&L. Instantly spot patterns in performance across days of the week, months, and trading sessions." },
    ],
  },
  {
    title: "Validation Layer",
    icon: CheckCircle,
    color: "#10b981",
    ready: false,
    description: "Rigorously test and validate trading strategies before risking real capital. The Validation Layer ensures your edge is statistically robust, not the product of curve-fitting.",
    features: [
      { icon: FlaskConical, title: "Strategy Backtesting", description: "Test strategies against historical data with tick-level accuracy. Evaluate performance across different market regimes, sessions, and instrument types." },
      { icon: TrendingUp, title: "Walk-Forward Analysis", description: "Re-optimize on rolling windows and validate on unseen data. Ensures your strategy parameters hold up across changing market conditions." },
      { icon: Shuffle, title: "Monte Carlo Simulation", description: "Run thousands of simulated trade sequences to understand probability distributions of outcomes. Quantify worst-case drawdown scenarios before going live." },
      { icon: Shield, title: "Risk-Adjusted Metrics", description: "Sharpe, Sortino, Calmar, and other industry-standard risk-adjusted measures. Evaluate strategies beyond simple win rate or P&L." },
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
          Four integrated layers for futures trading analytics — from raw Level 3 market data to validated strategies.
        </p>
      </section>

      {/* Layer Sections */}
      {SECTIONS.map((section, si) => {
        const Icon = section.icon;
        const isEven = si % 2 === 0;
        return (
          <section
            key={section.title}
            className={`border-t border-gray-800/40 ${isEven ? "bg-black" : "bg-gray-950/30"}`}
          >
            <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16">
              {/* Section header */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: section.color + "15" }}
                >
                  <Icon className="w-4 h-4" style={{ color: section.color }} />
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>
              <p className="text-gray-400 text-sm mb-8 max-w-2xl leading-relaxed">{section.description}</p>

              {/* Screenshot for Data Layer */}
              {section.ready && (
                <div className="mb-8 rounded-xl overflow-hidden border border-gray-800/50">
                  <img src={HERO_IMG} alt="Datrena Footprint Chart" className="w-full" />
                </div>
              )}

              {/* Feature cards */}
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

      {/* Exchange Data */}
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

      {/* CTA */}
      <section className="border-t border-gray-800/40 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Start trading with better data</h2>
          <p className="text-gray-400 text-sm mb-6">Free tier available. No credit card required.</p>
          <button
            onClick={() => base44.auth.redirectToLogin("/QuantHome")}
            className="bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors text-sm inline-flex items-center gap-2"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
