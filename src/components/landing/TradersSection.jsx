import React, { useState } from "react";
import { Database, TrendingUp, Lightbulb, CheckCircle, BarChart3, Activity, LineChart, PieChart, Calendar, Target, Shuffle, FlaskConical, Shield } from "lucide-react";

const HERO_IMG = "https://media.base44.com/images/public/69a877fa3c3927b616239696/ea49b83e1_Screenshot2026-03-19at55922PM.png";

const TABS = [
  { key: "data", label: "Data Layer", icon: Database, color: "#3b82f6" },
  { key: "analysis", label: "Analysis Layer", icon: TrendingUp, color: "#8b5cf6" },
  { key: "insight", label: "Insight Layer", icon: Lightbulb, color: "#f59e0b" },
  { key: "validation", label: "Validation Layer", icon: CheckCircle, color: "#10b981" },
];

const TAB_CONTENT = {
  data: {
    description: "Stream real-time MBO Level 3 data from Rithmic and visualize every order event in the exchange's matching engine. The Data Layer is the foundation of Datrena.",
    ready: true,
    features: [
      {
        label: "DOM Footprint",
        icon: BarChart3,
        title: "DOM Footprint Chart",
        description: "Canvas-based footprint chart rendering bid/ask volume at every price level. See order flow imbalances, POC (Point of Control), and volume profile in real time with tick-by-tick precision from Rithmic MBO data.",
        hasImage: true,
      },
      {
        label: "Delta / Volume",
        icon: Activity,
        title: "Delta & Volume Analysis",
        description: "Track the net difference between aggressive buying and selling volume at each price level. Delta analysis reveals whether buyers or sellers are driving price movement. Includes per-candle delta, cumulative delta, and total volume summaries.",
        hasImage: true,
      },
      {
        label: "Candlestick Chart",
        icon: LineChart,
        title: "Candlestick Chart",
        description: "OHLC candlestick visualization with mini-candles rendered inside each footprint cell. Multiple timeframes (1m, 5m, 15m, 30m) with a live countdown timer showing time remaining until the next candle closes.",
        hasImage: true,
      },
    ],
  },
  analysis: {
    description: "The Analysis Layer provides AI-powered statistical analysis on OHLCVD market data. Surface patterns, correlations, and edge across instruments and timeframes.",
    ready: false,
    features: [
      {
        label: "Volatility Charting",
        icon: LineChart,
        title: "Volatility Charting",
        description: "Visualize volatility across time and price to identify regime shifts, mean-reversion opportunities, and trend continuation setups. Request volatility surfaces for any date range through the AI assistant.",
      },
      {
        label: "Combinatorics",
        icon: Shuffle,
        title: "Combinatorial Analysis",
        description: "Apply combinatorial analysis to discover statistically significant sequences of market events. Uncover non-obvious edge patterns invisible to traditional indicator-based analysis.",
      },
      {
        label: "Data Analysis",
        icon: PieChart,
        title: "AI Data Analysis",
        description: "Run deep quantitative analysis powered by AI on OHLCVD market data. Surface correlations, distributions, and behavioral patterns across multiple instruments and timeframes.",
      },
    ],
  },
  insight: {
    description: "Connect to your prop firm accounts and surface performance metrics, trade history, and risk analytics in one unified dashboard.",
    ready: false,
    features: [
      {
        label: "P&L Tracking",
        icon: BarChart3,
        title: "P&L Tracking",
        description: "Monitor realized and unrealized profit and loss across all connected accounts in real time. Drill down by session, symbol, or date range.",
      },
      {
        label: "Win Rate",
        icon: Target,
        title: "Win Rate Analytics",
        description: "Track your win rate, average winner vs. average loser, and expectancy. Understand how these metrics evolve over time and under different market conditions.",
      },
      {
        label: "Drawdown",
        icon: Activity,
        title: "Drawdown Monitoring",
        description: "Monitor maximum peak-to-trough decline to stay within prop firm risk limits. Visualize drawdown curves to identify periods of underperformance before they escalate.",
      },
      {
        label: "Calendar",
        icon: Calendar,
        title: "Trade Calendar Heatmap",
        description: "Daily P&L displayed as a color-coded calendar heatmap. Instantly spot patterns in performance across days of the week, months, and sessions.",
      },
    ],
  },
  validation: {
    description: "Rigorously test and validate trading strategies with historical data, walk-forward analysis, and statistical robustness checks before risking real capital.",
    ready: false,
    features: [
      {
        label: "Backtesting",
        icon: FlaskConical,
        title: "Strategy Backtesting",
        description: "Test strategies against historical data with tick-level accuracy. Evaluate performance across different market regimes, sessions, and instrument types.",
      },
      {
        label: "Walk-Forward",
        icon: TrendingUp,
        title: "Walk-Forward Analysis",
        description: "Continuously re-optimize on rolling windows and test on unseen data, ensuring your edge holds up across different market conditions without overfitting.",
      },
      {
        label: "Monte Carlo",
        icon: Shuffle,
        title: "Monte Carlo Simulation",
        description: "Run thousands of simulated trade sequences to understand the probability distribution of outcomes. Quantify worst-case drawdown scenarios before going live.",
      },
      {
        label: "Risk Metrics",
        icon: Shield,
        title: "Risk-Adjusted Metrics",
        description: "Evaluate strategies using Sharpe, Sortino, Calmar, and other industry-standard risk-adjusted performance measures beyond simple win rate or P&L.",
      },
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
  const [activeFeature, setActiveFeature] = useState(0);
  const content = TAB_CONTENT[activeTab];
  const selectedFeature = content.features[activeFeature] || content.features[0];
  const activeTabMeta = TABS.find(t => t.key === activeTab);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setActiveFeature(0);
  };

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
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  isActive
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-transparent text-gray-500 border-gray-800/50 hover:border-gray-700 hover:text-gray-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={isActive ? { color: tab.color } : {}} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
          {/* Left — description + feature list */}
          <div className="lg:col-span-2">
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{content.description}</p>

            <div className="space-y-1">
              {content.features.map((f, i) => {
                const FIcon = f.icon;
                const isActive = activeFeature === i;
                return (
                  <button
                    key={i}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                      isActive
                        ? "bg-gray-800/80 text-white"
                        : "text-gray-500 hover:text-gray-300 hover:bg-gray-900/50"
                    }`}
                    onClick={() => setActiveFeature(i)}
                  >
                    <FIcon className="w-4 h-4 shrink-0" style={isActive ? { color: activeTabMeta.color } : {}} />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — feature detail */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-gray-800/60 overflow-hidden bg-gray-950/50">
              {/* Image or placeholder */}
              {selectedFeature.hasImage ? (
                <img
                  src={HERO_IMG}
                  alt={selectedFeature.title}
                  className="w-full object-cover"
                  style={{ maxHeight: 300 }}
                />
              ) : (
                <div
                  className="w-full flex items-center justify-center"
                  style={{ height: 300, background: `linear-gradient(135deg, ${activeTabMeta.color}08, ${activeTabMeta.color}03)` }}
                >
                  <div className="text-center">
                    {(() => { const FIcon = selectedFeature.icon; return <FIcon className="w-10 h-10 mx-auto mb-3" style={{ color: activeTabMeta.color + "40" }} />; })()}
                    <span className="text-gray-600 text-sm">{selectedFeature.title}</span>
                  </div>
                </div>
              )}
              <div className="p-5">
                <h4 className="text-white font-semibold text-base mb-2">{selectedFeature.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{selectedFeature.description}</p>
              </div>
            </div>
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
