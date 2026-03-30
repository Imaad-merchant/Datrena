import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Database, TrendingUp, Lightbulb, CheckCircle, ArrowRight, Zap, BarChart3, Activity } from "lucide-react";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";
import TradersSection from "../components/landing/TradersSection";

const HERO_IMG = "https://media.base44.com/images/public/69a877fa3c3927b616239696/ea49b83e1_Screenshot2026-03-19at55922PM.png";

const LAYERS = [
  {
    title: "Data Layer",
    icon: Database,
    color: "#3b82f6",
    bg: "from-blue-500/10 to-transparent",
    border: "border-blue-500/20 hover:border-blue-500/40",
    description: "Real-time order flow visualization powered by Rithmic MBO Level 3 data.",
    tags: ["DOM Footprint", "Delta / Volume", "Candlestick Chart"],
    ready: true,
  },
  {
    title: "Analysis Layer",
    icon: TrendingUp,
    color: "#8b5cf6",
    bg: "from-purple-500/10 to-transparent",
    border: "border-purple-500/20 hover:border-purple-500/40",
    description: "AI-driven statistical research on OHLCVD market data.",
    tags: ["Volatility Charting", "Combinatorics", "Data Analysis"],
    ready: false,
  },
  {
    title: "Insight Layer",
    icon: Lightbulb,
    color: "#f59e0b",
    bg: "from-yellow-500/10 to-transparent",
    border: "border-yellow-500/20 hover:border-yellow-500/40",
    description: "Prop firm performance tracking and trade history analytics.",
    tags: ["P&L Tracking", "Win Rate", "Drawdown", "Calendar"],
    ready: false,
  },
  {
    title: "Validation Layer",
    icon: CheckCircle,
    color: "#10b981",
    bg: "from-emerald-500/10 to-transparent",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    description: "Backtest and validate strategies with statistical rigor.",
    tags: ["Backtesting", "Walk-Forward", "Monte Carlo", "Risk Metrics"],
    ready: false,
  },
];

const STATS = [
  { value: "0.25", label: "Tick Resolution", suffix: "" },
  { value: "Level 3", label: "Market Data", suffix: "" },
  { value: "4", label: "CME Exchanges", suffix: "" },
  { value: "<80", label: "ms Latency", suffix: "" },
];

export default function Landing() {
  const handleSignIn = () => {
    base44.auth.redirectToLogin("/QuantHome");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <LandingNav activePage="/" />

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6">
              <Zap className="w-3 h-3" />
              Now live &mdash; Canvas Footprint Chart with MBO Data
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
              Quantitative Research<br />Meets Analytics
            </h1>
            <p className="text-gray-400 text-base mb-6 max-w-lg leading-relaxed">
              Futures trading analytics with real-time order flow, footprint charts, and statistical analysis tools. Built for traders who need institutional-grade data.
            </p>
            <ul className="space-y-2.5 mb-8">
              {[
                ["Canvas-based Footprint Chart", true],
                ["Rithmic MBO Level 3 Real-Time Data", true],
                ["AI-Driven Statistical Analysis", false],
                ["Prop Firm Performance Tracking", false],
              ].map(([label, built]) => (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <span className={`w-1.5 h-1.5 rounded-full ${built ? "bg-green-400" : "bg-gray-600"}`} />
                  <span className={built ? "text-gray-300" : "text-gray-500"}>
                    {label}
                    {!built && <span className="text-gray-600 text-xs ml-2">coming soon</span>}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSignIn}
                className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
              >
                Start for Free <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/Features"
                className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1"
              >
                View Features <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src={HERO_IMG}
              alt="Datrena Footprint Chart Terminal"
              className="relative w-full"
              style={{ mixBlendMode: 'lighten' }}
            />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-800/60 bg-gray-950/50">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Layers section */}
      <section className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            Four Integrated Layers
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            From raw market data to validated strategies. Each layer builds on the last to give you a complete analytical edge.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LAYERS.map(layer => {
            const Icon = layer.icon;
            return (
              <div
                key={layer.title}
                onClick={handleSignIn}
                className={`relative bg-gradient-to-b ${layer.bg} bg-gray-900/50 rounded-xl p-5 border ${layer.border} transition-all cursor-pointer group`}
              >
                {!layer.ready && (
                  <span className="absolute top-3 right-3 text-[10px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded px-1.5 py-0.5">
                    Soon
                  </span>
                )}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: layer.color + "15" }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: layer.color }} />
                </div>
                <h3 className="text-white text-sm font-semibold mb-1.5">{layer.title}</h3>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed">{layer.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {layer.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded bg-gray-800/80 border border-gray-700/50"
                      style={{ color: layer.color + "cc" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Traders section */}
      <TradersSection onSignIn={handleSignIn} />

      {/* CTA */}
      <section className="border-t border-gray-800/60 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-20 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">Ready to trade with better data?</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            Get access to the footprint chart and real-time MBO order flow today. Free tier available.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSignIn}
              className="bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/Pricing"
              className="text-gray-400 hover:text-white text-sm border border-gray-700 hover:border-gray-500 px-6 py-3 rounded-full transition-colors"
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