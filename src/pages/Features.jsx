import React from "react";
import { Link } from "react-router-dom";
import {
  Database, FlaskConical, BarChart3, ArrowRight,
  BarChart2, Activity, LineChart, PieChart,
  Shuffle, Shield, Layers, Eye, Crosshair, Clock,
  Wifi, GitBranch, SlidersHorizontal, Timer, Maximize2,
  Target, Cpu, TrendingUp, Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";
import chartHeroImg from "../assets/chart-hero.png";

const DATA_FEATURES = [
  { icon: BarChart2, title: "Order Flow Footprint Chart", description: "Canvas-based footprint chart rendering bid/ask volume at every price level. Imbalance detection (3:1 ratio), Point of Control, session volume profile." },
  { icon: Layers, title: "DOM Depth Heatmap", description: "Real-time depth of market visualization overlaid on the chart background. Color-coded intensity shows resting liquidity concentration." },
  { icon: Eye, title: "Iceberg Detection", description: "Automatic detection of hidden iceberg orders that repeatedly replenish at the same price level. Diamond markers show estimated hidden size and fill count." },
  { icon: Crosshair, title: "Order Tracking", description: "Visualize every order event — adds, cancels, modifies, and fills. See exactly how the order book evolves in real time." },
  { icon: Clock, title: "Pull Rate Analysis", description: "Track how often resting orders are pulled vs. filled. High rates indicate potential spoofing." },
  { icon: GitBranch, title: "Resting Orders", description: "Aggregate resting order size at each price level as horizontal bars. Identify large resting bids/asks acting as support or resistance." },
  { icon: Activity, title: "Delta & Volume Analysis", description: "Per-candle delta, cumulative delta, and total volume summaries. See whether buyers or sellers drive each move." },
  { icon: SlidersHorizontal, title: "OHLCV Info Bar", description: "TradingView-style ticker bar showing Open, High, Low, Close values that update on hover with instrument name and real-time data." },
  { icon: Timer, title: "12 Timeframes", description: "From 1-minute to Monthly — 12 timeframes with live countdown. All candle data re-bucketed from stored 1-minute resolution." },
  { icon: Maximize2, title: "Infinite Zoom", description: "No limits on compressing or stretching price and time axes. Zoom to tick-level detail or full session. Double-click to reset." },
  { icon: Wifi, title: "Latency Monitor", description: "Live latency indicator showing milliseconds between trade timestamp and receipt." },
  { icon: LineChart, title: "Volume Profile & POC", description: "Session volume profile showing total volume at each price level. Point of Control marks the highest-volume price." },
];

const RESEARCH_FEATURES = [
  { icon: Cpu, title: "Train Machine Learning Models", description: "Build and train ML models on historical market data. Use scikit-learn, XGBoost, TensorFlow, and more to identify predictive features and quantify factor importance." },
  { icon: LineChart, title: "Visualize and Explore Data", description: "Interactive data exploration on terabytes of financial, fundamental, and alternative data. Everything preformatted and linked to underlying securities via FIGI, CUSIP, and ISIN." },
  { icon: PieChart, title: "AI Quant Analysis", description: "Deep quantitative analysis powered by AI. Ask natural-language questions about your data and get statistically rigorous answers with citations." },
  { icon: Target, title: "Fast Cloud Cores", description: "Run compute-intensive research on scalable cloud infrastructure. Complete weeks of analysis in minutes without managing any infrastructure." },
  { icon: Code2, title: "Custom Packages", description: "Access popular machine learning and feature selection libraries out of the box. We can install custom packages on request for Pro users." },
  { icon: Shuffle, title: "Combinatorial Analysis", description: "Discover statistically significant sequences of market events. Uncover non-obvious edge patterns across instruments and timeframes." },
];

const BACKTESTING_FEATURES = [
  { icon: BarChart3, title: "Algorithmic Backtesting", description: "Point-in-time, fee, slippage, and spread-adjusted backtesting on fast cloud cores. Multi-asset portfolio backtesting with realistic margin modeling." },
  { icon: SlidersHorizontal, title: "Parameter Optimization", description: "Run thousands of full backtests on scalable cloud compute. Visualize parameter sensitivity on heatmaps to find robust out-of-sample configurations." },
  { icon: TrendingUp, title: "Walk-Forward Analysis", description: "Re-optimize on rolling windows and validate on unseen data. Avoid overfitting and ensure your strategy holds up in live markets." },
  { icon: Shuffle, title: "Monte Carlo Simulation", description: "Run thousands of simulated trade sequences to understand probability distributions, drawdown risk, and worst-case scenarios." },
  { icon: Shield, title: "Risk-Adjusted Metrics", description: "Sharpe, Sortino, Calmar, and other industry-standard risk measures. Understand your strategy's full risk profile before deploying capital." },
  { icon: Cpu, title: "Agentic AI", description: "Use an AI assistant to design, backtest, optimize, and deploy your quantitative strategies through a streamlined, AI-ready workflow." },
];

export default function Features() {

  return (
    <div className="bg-black min-h-screen text-white">
      <LandingNav activePage="/Features" />

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 pt-10 pb-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Platform Features</h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Live Level 3 data, cloud research terminals, and institutional-grade backtesting — built for quants.
        </p>
      </section>

      {/* ═══ Data ═══ */}
      <section id="data" className="border-t border-gray-800/60">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-800/60">
              <Database className="w-4 h-4 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold">Data</h2>
            <Badge className="text-[10px] bg-gray-800 text-gray-300 border-none">Live</Badge>
          </div>
          <p className="text-gray-400 text-sm mb-6 max-w-3xl leading-relaxed">
            Real-time order flow visualization powered by Rithmic MBO Level 3 data. Direct window into the exchange matching engine with 7+ toggleable overlays, 12 timeframes, and sub-10ms relay latency.
          </p>

          {/* Chart screenshot */}
          <Card className="bg-gray-900/40 border-gray-800/40 mb-8 overflow-hidden rounded-xl">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border-b border-gray-800">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-600" />
                <div className="w-2 h-2 rounded-full bg-gray-600" />
                <div className="w-2 h-2 rounded-full bg-gray-600" />
              </div>
              <span className="text-xs text-gray-500 mx-auto">ES S&P 500 E-MINI &mdash; 5M Footprint</span>
            </div>
            <img src={chartHeroImg} alt="Datrena Order Flow Footprint Chart" className="w-full block" />
          </Card>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DATA_FEATURES.map(f => {
              const FIcon = f.icon;
              return (
                <Card key={f.title} className="bg-gray-900/40 border-gray-800/40 hover:border-gray-700/60 transition-colors group">
                  <CardHeader className="p-5 pb-0">
                    <div className="flex items-center gap-2">
                      <FIcon className="w-4 h-4 text-gray-400" />
                      <CardTitle className="text-sm">{f.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-2">
                    <CardDescription className="text-xs leading-relaxed">{f.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Research ═══ */}
      <section id="research" className="border-t border-gray-800/60">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-800/60">
              <FlaskConical className="w-4 h-4 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold">Research</h2>
          </div>
          <p className="text-gray-400 text-sm mb-6 max-w-3xl leading-relaxed">
            Cloud-based research terminals attached to terabytes of financial, fundamental, and alternative data — preformatted and ready to use. Alternative data is linked to underlying securities via FIGI, CUSIP, and ISIN to facilitate building strategies.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RESEARCH_FEATURES.map(f => {
              const FIcon = f.icon;
              return (
                <Card key={f.title} className="bg-gray-900/40 border-gray-800/40 hover:border-gray-700/60 transition-colors">
                  <CardContent className="p-5">
                    <FIcon className="w-4 h-4 text-gray-400 mb-2" />
                    <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Backtesting ═══ */}
      <section id="backtesting" className="border-t border-gray-800/60">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-800/60">
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold">Backtesting</h2>
          </div>
          <p className="text-gray-400 text-sm mb-2 max-w-3xl leading-relaxed">
            With minimal-to-no code changes, move from research to point-in-time, fee, slippage, and spread-adjusted backtesting on lightning-fast cloud cores. Perform multi-asset backtesting on portfolios comprised of thousands of securities with realistic margin modeling.
          </p>
          <p className="text-gray-500 text-xs mb-6 max-w-3xl leading-relaxed">
            Import custom and alternative data linked to underlying securities for realistically modeling live-trading portfolios and avoiding common pitfalls like look-ahead bias.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BACKTESTING_FEATURES.map(f => {
              const FIcon = f.icon;
              return (
                <Card key={f.title} className="bg-gray-900/40 border-gray-800/40 hover:border-gray-700/60 transition-colors">
                  <CardContent className="p-5">
                    <FIcon className="w-4 h-4 text-gray-400 mb-2" />
                    <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Exchange Data ═══ */}
      <section className="border-t border-gray-800/60">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
          <h2 className="text-lg font-bold mb-1">Exchange Data</h2>
          <p className="text-gray-400 text-sm mb-5">All data via Rithmic MBO Level 3 feed. Exchange fees apply separately.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: "CME", instruments: "ES (S&P 500), NQ (Nasdaq 100), 6E, 6B" },
              { name: "CBOT", instruments: "YM (Dow), ZB (Bonds), ZN (Notes)" },
              { name: "NYMEX", instruments: "CL (Crude Oil), NG (Natural Gas)" },
              { name: "COMEX", instruments: "GC (Gold), SI (Silver)" },
            ].map(ex => (
              <Card key={ex.name} className="bg-gray-900/40 border-gray-800/40">
                <CardContent className="p-4">
                  <span className="text-white text-sm font-semibold">{ex.name}</span>
                  <p className="text-gray-500 text-xs mt-1">{ex.instruments}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="border-t border-gray-800/60 bg-gray-950/60">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12 text-center">
          <h2 className="text-xl font-bold mb-2">Start Trading with Better Data</h2>
          <p className="text-gray-400 text-sm mb-6">Free tier available. No credit card required.</p>
          <Button asChild className="bg-white text-black hover:bg-gray-200 text-sm font-semibold gap-2 rounded-lg px-7 h-11">
            <Link to="/Waitlist">Join the Waitlist <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
