import React from "react";
import {
  Database, TrendingUp, Lightbulb, CheckCircle,
  BarChart3, Activity, LineChart, PieChart, Calendar, Target,
  Shuffle, FlaskConical, Shield, Layers, Eye, Crosshair, Clock,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TABS_DATA = [
  { key: "data", label: "DATA", icon: Database, color: "#3B82F6" },
  { key: "analysis", label: "ANALYSIS", icon: TrendingUp, color: "#8B5CF6" },
  { key: "insight", label: "INSIGHT", icon: Lightbulb, color: "#F59E0B" },
  { key: "validation", label: "VALIDATION", icon: CheckCircle, color: "#10B981" },
];

const TAB_CONTENT = {
  data: {
    description: "Stream real-time MBO Level 3 data from Rithmic and visualize every order event in the exchange's matching engine. 7+ toggleable overlays built for professional futures traders.",
    color: "#3B82F6",
    features: [
      { icon: BarChart3, title: "Order Flow Footprint Chart", description: "Canvas-based footprint chart rendering bid/ask volume at every price level. Imbalance detection (3:1 ratio), Point of Control, session volume profile." },
      { icon: Layers, title: "DOM Depth Heatmap Overlay", description: "Real-time depth of market visualization overlaid on the chart background. Color-coded intensity shows resting liquidity concentration." },
      { icon: Eye, title: "Iceberg Order Detection", description: "Automatic detection of hidden iceberg orders that repeatedly replenish at the same price level. Diamond markers show estimated hidden size." },
      { icon: Crosshair, title: "Live Order Tracking", description: "Visualize every order event on the chart — adds (green), cancels (red), modifies (yellow), and fills (white)." },
      { icon: Clock, title: "Pull Rate Analysis", description: "Track how often resting orders are pulled vs. filled. Color-coded bars show pull rate intensity — high rates indicate potential spoofing." },
      { icon: Activity, title: "Delta & Volume Analysis", description: "Per-candle delta, cumulative delta, and total volume summaries. See whether buyers or sellers are driving each move." },
    ],
  },
  analysis: {
    description: "AI-powered statistical analysis on OHLCVD market data. Surface patterns, correlations, and edge across instruments and timeframes.",
    color: "#8B5CF6",
    features: [
      { icon: LineChart, title: "Volatility Charting", description: "Visualize volatility across time and price to identify regime shifts, mean-reversion opportunities, and trend continuation setups." },
      { icon: Shuffle, title: "Combinatorial Analysis", description: "Discover statistically significant sequences of market events. Uncover non-obvious edge patterns." },
      { icon: PieChart, title: "AI Data Analysis", description: "Deep quantitative analysis powered by AI on OHLCVD market data. Surface correlations, distributions, and behavioral patterns." },
    ],
  },
  insight: {
    description: "Connect to your prop firm accounts and surface performance metrics, trade history, and risk analytics in one unified dashboard.",
    color: "#F59E0B",
    features: [
      { icon: BarChart3, title: "P&L Tracking", description: "Monitor realized and unrealized P&L across all connected accounts in real time." },
      { icon: Target, title: "Win Rate Analytics", description: "Track win rate, average winner vs. loser, and expectancy across all trades." },
      { icon: Activity, title: "Drawdown Monitoring", description: "Monitor maximum peak-to-trough decline to stay within prop firm risk limits." },
      { icon: Calendar, title: "Trade Calendar Heatmap", description: "Daily P&L displayed as a color-coded calendar heatmap." },
    ],
  },
  validation: {
    description: "Rigorously test and validate trading strategies with historical data, walk-forward analysis, and statistical robustness checks.",
    color: "#10B981",
    features: [
      { icon: FlaskConical, title: "Strategy Backtesting", description: "Test strategies against historical data with tick-level accuracy across different market regimes." },
      { icon: TrendingUp, title: "Walk-Forward Analysis", description: "Re-optimize on rolling windows and validate on unseen data." },
      { icon: Shuffle, title: "Monte Carlo Simulation", description: "Run thousands of simulated trade sequences to understand probability distributions." },
      { icon: Shield, title: "Risk-Adjusted Metrics", description: "Sharpe, Sortino, Calmar, and other risk-adjusted performance measures." },
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
  return (
    <section className="bg-background border-t border-border">
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16">
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-2 tracking-wide">BUILT BY TRADERS, FOR TRADERS</h2>
          <p className="text-muted-foreground text-[12px] max-w-lg">
            Every feature is designed around real trading workflows. No bloat — just the tools you need to read the tape and execute with confidence.
          </p>
        </div>

        <Tabs defaultValue="data">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-0 w-full justify-start">
            {TABS_DATA.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-[10px] tracking-widest gap-2 text-muted-foreground data-[state=active]:text-foreground"
                  style={{ "--trigger-color": tab.color }}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(TAB_CONTENT).map(([key, content]) => (
            <TabsContent key={key} value={key} className="mt-6">
              <p className="text-muted-foreground text-[11px] mb-6 leading-relaxed max-w-2xl">{content.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {content.features.map((f, i) => {
                  const FIcon = f.icon;
                  return (
                    <Card key={i} className="rounded-none hover:border-muted-foreground/30 transition-colors">
                      <CardHeader className="p-4 pb-0">
                        <div className="flex items-center gap-2.5">
                          <FIcon className="w-3.5 h-3.5" style={{ color: content.color }} />
                          <CardTitle className="text-[11px]">{f.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <CardDescription className="text-[10px] leading-relaxed">{f.description}</CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Exchanges */}
        <div className="mt-12">
          <h3 className="text-muted-foreground text-[10px] font-semibold tracking-widest mb-3">SUPPORTED EXCHANGES VIA RITHMIC</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {EXCHANGES.map(ex => (
              <Card key={ex.name} className="rounded-none">
                <CardContent className="p-3">
                  <span className="text-foreground text-[11px] font-semibold">{ex.name}</span>
                  <p className="text-muted-foreground text-[9px] mt-0.5">{ex.instruments}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}