import React, { useState } from "react";
import {
  Database, TrendingUp, Lightbulb, CheckCircle,
  BarChart3, Activity, LineChart, PieChart, Calendar, Target,
  Shuffle, FlaskConical, Shield, Layers, Eye, Crosshair, Clock,
  GitBranch, SlidersHorizontal, Timer,
} from "lucide-react";

const TABS = [
  { key: "data", label: "Data Layer", icon: Database, color: "#3b82f6" },
  { key: "analysis", label: "Analysis Layer", icon: TrendingUp, color: "#8b5cf6" },
  { key: "insight", label: "Insight Layer", icon: Lightbulb, color: "#f59e0b" },
  { key: "validation", label: "Validation Layer", icon: CheckCircle, color: "#10b981" },
];

const TAB_CONTENT = {
  data: {
    description: "Stream real-time MBO Level 3 data from Rithmic and visualize every order event in the exchange's matching engine. 7+ toggleable overlays built for professional futures traders.",
    ready: true,
    features: [
      {
        label: "Order Flow Footprint",
        icon: BarChart3,
        title: "Order Flow Footprint Chart",
        description: "Canvas-based footprint chart rendering bid/ask volume at every price level. Imbalance detection (3:1 ratio), Point of Control, session volume profile, and adaptive text that scales with zoom level.",
      },
      {
        label: "DOM Depth Heatmap",
        icon: Layers,
        title: "DOM Depth Heatmap Overlay",
        description: "Real-time depth of market visualization overlaid on the chart background. Color-coded intensity shows where resting liquidity is concentrated across bid and ask levels. Toggle on/off from the MBO dropdown.",
      },
      {
        label: "Iceberg Detection",
        icon: Eye,
        title: "Iceberg Order Detection",
        description: "Automatic detection of hidden iceberg orders that repeatedly replenish at the same price level. Diamond markers on the chart show estimated hidden size, visible size, and fill count.",
      },
      {
        label: "Order Tracking",
        icon: Crosshair,
        title: "Live Order Tracking",
        description: "Visualize every order event directly on the chart — adds (green), cancels (red), modifies (yellow), and fills (white). See exactly how the order book is evolving at each price level in real time.",
      },
      {
        label: "Pull Rate",
        icon: Clock,
        title: "Pull Rate Analysis",
        description: "Track how often resting orders are pulled vs. filled at each price level. Color-coded bars on the price axis show pull rate intensity — high pull rates indicate potential spoofing or fake liquidity.",
      },
      {
        label: "Delta & Volume",
        icon: Activity,
        title: "Delta & Volume Analysis",
        description: "Per-candle delta (aggressive buy vs. sell volume), cumulative delta across the session, and total volume summaries. Reveals whether buyers or sellers are driving each price move.",
      },
    ],
  },
  analysis: {
    description: "AI-powered statistical analysis on OHLCVD market data. Surface patterns, correlations, and edge across instruments and timeframes.",
    ready: false,
    features: [
      { label: "Volatility Charting", icon: LineChart, title: "Volatility Charting", description: "Visualize volatility across time and price to identify regime shifts, mean-reversion opportunities, and trend continuation setups." },
      { label: "Combinatorics", icon: Shuffle, title: "Combinatorial Analysis", description: "Discover statistically significant sequences of market events. Uncover non-obvious edge patterns invisible to traditional indicator-based analysis." },
      { label: "Data Analysis", icon: PieChart, title: "AI Data Analysis", description: "Deep quantitative analysis powered by AI on OHLCVD market data. Surface correlations, distributions, and behavioral patterns." },
    ],
  },
  insight: {
    description: "Connect to your prop firm accounts and surface performance metrics, trade history, and risk analytics in one unified dashboard.",
    ready: false,
    features: [
      { label: "P&L Tracking", icon: BarChart3, title: "P&L Tracking", description: "Monitor realized and unrealized profit and loss across all connected accounts in real time." },
      { label: "Win Rate", icon: Target, title: "Win Rate Analytics", description: "Track your win rate, average winner vs. average loser, and expectancy across all trades." },
      { label: "Drawdown", icon: Activity, title: "Drawdown Monitoring", description: "Monitor maximum peak-to-trough decline to stay within prop firm risk limits." },
      { label: "Calendar", icon: Calendar, title: "Trade Calendar Heatmap", description: "Daily P&L displayed as a color-coded calendar heatmap. Spot patterns across days, months, and sessions." },
    ],
  },
  validation: {
    description: "Rigorously test and validate trading strategies with historical data, walk-forward analysis, and statistical robustness checks.",
    ready: false,
    features: [
      { label: "Backtesting", icon: FlaskConical, title: "Strategy Backtesting", description: "Test strategies against historical data with tick-level accuracy across different market regimes." },
      { label: "Walk-Forward", icon: TrendingUp, title: "Walk-Forward Analysis", description: "Re-optimize on rolling windows and validate on unseen data, ensuring your edge holds up." },
      { label: "Monte Carlo", icon: Shuffle, title: "Monte Carlo Simulation", description: "Run thousands of simulated trade sequences to understand probability distributions of outcomes." },
      { label: "Risk Metrics", icon: Shield, title: "Risk-Adjusted Metrics", description: "Sharpe, Sortino, Calmar, and other risk-adjusted performance measures beyond simple P&L." },
    ],
  },
};

const EXCHANGES = [
  { name: "CME", instruments: "ES (S&P 500), NQ (Nasdaq 100), 6E, 6B" },
  { name: "CBOT", instruments: "YM (Dow), ZB (Bonds), ZN (Notes)" },
  { name: "NYMEX", instruments: "CL (Crude Oil), NG (Natural Gas)" },
  { name: "COMEX", instruments: "GC (Gold), SI (Silver)" },
];

export default function TradersSection({ onSignIn }) {
  const [activeTab, setActiveTab] = useState("data");
  const content = TAB_CONTENT[activeTab];
  const activeTabMeta = TABS.find(t => t.key === activeTab);


  return (
    <section className="bg-black border-t border-gray-800/60">
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-20">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            Built by Traders, for Traders
          </h2>
          <p className="text-gray-500 text-sm max-w-lg">
            Every feature is designed around real trading workflows. No bloat, no gimmicks — just the tools you need to read the tape and execute with confidence.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const isReady = TAB_CONTENT[tab.key].ready;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  isActive
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-transparent text-gray-500 border-gray-800/50 hover:border-gray-700 hover:text-gray-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={isActive ? { color: tab.color } : {}} />
                {tab.label}
                {isReady && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 ml-1">LIVE</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="mb-16">
          <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-2xl">{content.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.features.map((f, i) => {
              const FIcon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-5 hover:border-gray-700/60 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: activeTabMeta.color + "12" }}
                    >
                      <FIcon className="w-4 h-4" style={{ color: activeTabMeta.color }} />
                    </div>
                    <h4 className="text-white text-sm font-semibold">{f.title}</h4>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exchanges */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-4">Supported Exchanges via Rithmic</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {EXCHANGES.map(ex => (
              <div key={ex.name} className="bg-gray-900/60 border border-gray-800/50 rounded-lg px-4 py-3">
                <span className="text-white text-sm font-semibold">{ex.name}</span>
                <p className="text-gray-500 text-xs mt-1">{ex.instruments}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
