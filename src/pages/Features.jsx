import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Database, TrendingUp, Lightbulb, CheckCircle, ArrowRight,
  BarChart3, Activity, LineChart, PieChart, Calendar, Target,
  Shuffle, FlaskConical, Shield, Layers, Eye, Crosshair, Clock,
  Wifi, GitBranch, SlidersHorizontal, Timer, Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";
import chartHeroImg from "../assets/chart-hero.png";

const DATA_FEATURES = [
  { icon: BarChart3, title: "Order Flow Footprint Chart", description: "Canvas-based footprint chart rendering bid/ask volume at every price level. Imbalance detection (3:1 ratio), Point of Control, session volume profile." },
  { icon: Layers, title: "DOM Depth Heatmap", description: "Real-time depth of market visualization overlaid on the chart background. Color-coded intensity shows resting liquidity concentration." },
  { icon: Eye, title: "Iceberg Detection", description: "Automatic detection of hidden iceberg orders that repeatedly replenish at the same price level. Diamond markers show estimated hidden size and fill count." },
  { icon: Crosshair, title: "Order Tracking", description: "Visualize every order event — adds (green), cancels (red), modifies (yellow), fills (white). See exactly how the order book evolves in real time." },
  { icon: Clock, title: "Pull Rate Analysis", description: "Track how often resting orders are pulled vs. filled. Color-coded bars show pull rate intensity — high rates indicate potential spoofing." },
  { icon: GitBranch, title: "Resting Orders", description: "Aggregate resting order size at each price level as horizontal bars. Identify large resting bids/asks acting as support or resistance." },
  { icon: Activity, title: "Delta & Volume Analysis", description: "Per-candle delta, cumulative delta, and total volume summaries. See whether buyers or sellers drive each move." },
  { icon: SlidersHorizontal, title: "OHLCV Info Bar", description: "TradingView-style ticker bar showing Open, High, Low, Close values that update on hover with instrument name and real-time data." },
  { icon: Timer, title: "12 Timeframes", description: "From 1-minute to Monthly — 12 timeframes with live countdown. All candle data re-bucketed from stored 1-minute resolution." },
  { icon: Maximize2, title: "Infinite Zoom", description: "No limits on compressing or stretching price and time axes. Zoom to tick-level detail or full session. Double-click to reset." },
  { icon: Wifi, title: "Latency Monitor", description: "Live latency indicator showing milliseconds between trade timestamp and receipt. Color-coded green (<50ms), yellow (<150ms), or red." },
  { icon: LineChart, title: "Volume Profile & POC", description: "Session volume profile showing total volume at each price level. Point of Control marks the highest-volume price." },
];

const FUTURE_SECTIONS = [
  {
    id: "analysis-layer", title: "Analysis Layer", icon: TrendingUp, color: "#8B5CF6",
    description: "AI-driven statistical analysis on OHLCVD market data. Surface patterns, correlations, and behavioral signatures.",
    features: [
      { icon: LineChart, title: "Volatility Charting", description: "Visualize volatility across time and price to identify regime shifts and trend continuation signals." },
      { icon: Shuffle, title: "Combinatorial Analysis", description: "Discover statistically significant sequences of market events. Uncover non-obvious edge patterns." },
      { icon: PieChart, title: "AI Data Analysis", description: "Deep quantitative analysis powered by AI. Surface correlations, distributions, and behavioral patterns." },
    ],
  },
  {
    id: "insight-layer", title: "Insight Layer", icon: Lightbulb, color: "#F59E0B",
    description: "Connect to your prop firm accounts and surface performance metrics, trade history, and risk analytics.",
    features: [
      { icon: BarChart3, title: "P&L Tracking", description: "Monitor realized and unrealized P&L across all connected accounts in real time." },
      { icon: Target, title: "Win Rate Analytics", description: "Track win rate, average winner vs. loser, and expectancy over time and conditions." },
      { icon: Activity, title: "Drawdown Monitoring", description: "Maximum peak-to-trough decline tracked in real time to stay within prop firm limits." },
      { icon: Calendar, title: "Trade Calendar Heatmap", description: "Color-coded calendar showing daily P&L. Spot performance patterns across days and sessions." },
    ],
  },
  {
    id: "validation-layer", title: "Validation Layer", icon: CheckCircle, color: "#10B981",
    description: "Rigorously test and validate trading strategies before risking real capital.",
    features: [
      { icon: FlaskConical, title: "Strategy Backtesting", description: "Test strategies against historical data with tick-level accuracy across different market regimes." },
      { icon: TrendingUp, title: "Walk-Forward Analysis", description: "Re-optimize on rolling windows and validate on unseen data." },
      { icon: Shuffle, title: "Monte Carlo Simulation", description: "Run thousands of simulated trade sequences to understand probability distributions." },
      { icon: Shield, title: "Risk-Adjusted Metrics", description: "Sharpe, Sortino, Calmar, and other industry-standard risk measures." },
    ],
  },
];

export default function Features() {
  const [showToast, setShowToast] = useState(false);

  const handleCTA = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <LandingNav activePage="/Features" />

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 pt-10 pb-12 text-center">
        <h1 className="text-2xl font-bold mb-2 tracking-wide">PLATFORM FEATURES</h1>
        <p className="text-muted-foreground text-[11px] max-w-lg mx-auto">
          Professional-grade order flow analysis tools built on Rithmic MBO Level 3 data.
        </p>
      </section>

      {/* ═══ Data Layer ═══ */}
      <section id="data-layer" className="border-t border-border">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 flex items-center justify-center bg-dt-blue/10">
              <Database className="w-3.5 h-3.5 text-dt-blue" />
            </div>
            <h2 className="text-base font-bold tracking-wide">DATA LAYER</h2>
            <Badge variant="outline" className="text-[8px] tracking-widest rounded-none border-none bg-dt-blue/15 text-dt-blue">LIVE</Badge>
          </div>
          <p className="text-muted-foreground text-[11px] mb-6 max-w-3xl leading-relaxed">
            Real-time order flow visualization powered by Rithmic MBO Level 3 data. Direct window into the exchange matching engine with 7+ toggleable overlays, 12 timeframes, and sub-10ms relay latency.
          </p>

          {/* Chart screenshot */}
          <Card className="rounded-none mb-8 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card border-b border-border">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-dt-red/60" />
                <div className="w-2 h-2 bg-dt-amber/60" />
                <div className="w-2 h-2 bg-dt-green/60" />
              </div>
              <span className="text-[9px] text-muted-foreground mx-auto tracking-wider">ES S&P 500 E-MINI &mdash; 5M FOOTPRINT</span>
            </div>
            <img src={chartHeroImg} alt="Datrena Order Flow Footprint Chart" className="w-full block" />
          </Card>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DATA_FEATURES.map(f => {
              const FIcon = f.icon;
              return (
                <Card key={f.title} className="rounded-none hover:border-dt-blue/30 transition-colors group">
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-center gap-2">
                      <FIcon className="w-3.5 h-3.5 text-dt-blue" />
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
        </div>
      </section>

      {/* ═══ Future layers ═══ */}
      {FUTURE_SECTIONS.map((section) => {
        const Icon = section.icon;
        return (
          <section key={section.title} id={section.id} className="border-t border-border">
            <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: section.color + "15" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: section.color }} />
                </div>
                <h2 className="text-base font-bold tracking-wide">{section.title.toUpperCase()}</h2>
              </div>
              <p className="text-muted-foreground text-[11px] mb-6 max-w-2xl leading-relaxed">{section.description}</p>

              <div className={`grid grid-cols-1 ${section.features.length >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"} gap-3`}>
                {section.features.map(f => {
                  const FIcon = f.icon;
                  return (
                    <Card key={f.title} className="rounded-none hover:border-muted-foreground/30 transition-colors">
                      <CardContent className="p-4">
                        <FIcon className="w-4 h-4 mb-2" style={{ color: section.color }} />
                        <h3 className="text-[11px] font-semibold mb-1">{f.title}</h3>
                        <p className="text-muted-foreground text-[10px] leading-relaxed">{f.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* ═══ Exchange Data ═══ */}
      <section className="border-t border-border">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
          <h2 className="text-base font-bold mb-1 tracking-wide">EXCHANGE DATA</h2>
          <p className="text-muted-foreground text-[11px] mb-5">All data via Rithmic MBO Level 3 feed. Exchange fees apply separately.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { name: "CME", instruments: "ES (S&P 500), NQ (Nasdaq 100), 6E, 6B" },
              { name: "CBOT", instruments: "YM (Dow), ZB (Bonds), ZN (Notes)" },
              { name: "NYMEX", instruments: "CL (Crude Oil), NG (Natural Gas)" },
              { name: "COMEX", instruments: "GC (Gold), SI (Silver)" },
            ].map(ex => (
              <Card key={ex.name} className="rounded-none">
                <CardContent className="p-3">
                  <span className="text-foreground text-[11px] font-semibold">{ex.name}</span>
                  <p className="text-muted-foreground text-[9px] mt-0.5">{ex.instruments}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="border-t border-border bg-card">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12 text-center">
          <h2 className="text-lg font-bold mb-2 tracking-wide">START TRADING WITH BETTER DATA</h2>
          <p className="text-muted-foreground text-[11px] mb-5">Free tier available. No credit card required.</p>
          <Button onClick={handleCTA} className="bg-dt-green text-background hover:bg-dt-green/90 text-[11px] tracking-wide gap-2 rounded-none px-7 h-10">
            GET STARTED FREE <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </section>

      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-card border border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="text-dt-red mr-2">ACCESS DENIED</span>
          Administrator access only.
        </div>
      )}

      <LandingFooter />
    </div>
  );
}