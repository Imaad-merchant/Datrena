import React from "react";
import { Link } from "react-router-dom";
import {
  Database, Bot, BarChart3, FlaskConical, ArrowRight,
  Wifi, ChevronRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";
import TradersSection from "../components/landing/TradersSection";

const PRODUCTS = [
  { title: "Data", icon: Database, status: "Live", anchor: "/Features#data",
    description: "Real-time MBO Level 3 order flow visualization. Footprint charts, DOM heatmaps, iceberg detection, and pull rate analysis.",
    tags: ["Footprint", "DOM Heatmap", "Iceberg", "Order Tracking", "Pull Rate", "Delta/Volume"] },
  { title: "AI Analysis", icon: Bot, status: "Beta", anchor: "/Features#ai-analysis",
    description: "AI-powered quantitative analysis on Rithmic market data. Ask about volatility, order flow, market structure, and strategy ideas.",
    tags: ["AI Chat", "Volatility", "Order Flow", "Strategy Ideas"] },
  { title: "Backtesting", icon: BarChart3, status: null, anchor: "/Features#backtesting",
    description: "Chart-based strategy backtesting with the same footprint chart as Data. Replay historical data, test strategies, and analyze results.",
    tags: ["Chart Replay", "Strategy Runner", "Trade Log", "Performance Metrics"] },
  { title: "Research", icon: FlaskConical, status: null, anchor: "/Features#research",
    description: "Cloud-based research terminals with terabytes of financial and alternative data. Train ML models, run parameter optimization, and explore data.",
    tags: ["ML Models", "Parameter Optimization", "Monte Carlo", "Data Explorer"] },
];

const STATS = [
  { value: "Level 3", label: "MBO Market Data" },
  { value: "0.25", label: "Tick Resolution" },
  { value: "7+", label: "MBO Overlays" },
  { value: "<10ms", label: "Relay Latency" },
  { value: "12", label: "Timeframes" },
  { value: "4", label: "CME Exchanges" },
];

const COMPARISON = [
  { feature: "MBO Level 3 Data", datrena: true, tradingview: false, ninjatrader: false },
  { feature: "Footprint Charts", datrena: true, tradingview: false, ninjatrader: true },
  { feature: "DOM Heatmap", datrena: true, tradingview: false, ninjatrader: true },
  { feature: "Iceberg Detection", datrena: true, tradingview: false, ninjatrader: false },
  { feature: "AI Quant Analysis", datrena: true, tradingview: false, ninjatrader: false },
  { feature: "Chart-Based Backtesting", datrena: true, tradingview: true, ninjatrader: true },
  { feature: "Cloud Research Terminals", datrena: true, tradingview: false, ninjatrader: false },
  { feature: "ML Model Training", datrena: true, tradingview: false, ninjatrader: false },
  { feature: "Parameter Optimization", datrena: true, tradingview: false, ninjatrader: false },
  { feature: "Web-Based (No Install)", datrena: true, tradingview: true, ninjatrader: false },
  { feature: "Free Tier", datrena: true, tradingview: true, ninjatrader: false },
];

const FAQ = [
  { q: "What data feed does Datrena use?", a: "Datrena connects to Rithmic's MBO (Market by Order) Level 3 feed, which provides individual order events directly from CME Group's matching engine. This is the same feed used by institutional desks." },
  { q: "Can I write and backtest my own algorithms?", a: "Yes. The Research terminal lets you write quantitative strategies in a cloud-based environment with access to historical and alternative data. Move from research to backtesting with minimal code changes." },
  { q: "What machine learning libraries are supported?", a: "We support popular ML and feature selection libraries out of the box. Custom package installation is available on request for Pro users." },
  { q: "Does it work on Mac / Linux?", a: "Yes. Datrena is a fully web-based platform — no desktop installation required. Works on any modern browser across macOS, Windows, and Linux." },
  { q: "What are the exchange data costs?", a: "Exchange data fees (CME, CBOT, NYMEX, COMEX) are billed separately through Rithmic and depend on your subscription type. Datrena's platform fees are independent of data costs." },
  { q: "How realistic is the backtesting?", a: "Backtests are point-in-time with fee, slippage, and spread adjustments. Multi-asset portfolio backtesting with realistic margin modeling avoids common pitfalls like look-ahead bias." },
];

const TICKER_ITEMS = [
  { sym: "ES", price: "5,842.50", change: "+12.25", up: true },
  { sym: "NQ", price: "20,315.75", change: "+87.50", up: true },
  { sym: "CL", price: "61.38", change: "-0.42", up: false },
  { sym: "GC", price: "3,241.80", change: "+18.60", up: true },
  { sym: "YM", price: "43,125", change: "+95", up: true },
  { sym: "ZB", price: "118.15625", change: "-0.09375", up: false },
  { sym: "6E", price: "1.13525", change: "+0.00125", up: true },
  { sym: "SI", price: "38.425", change: "+0.285", up: true },
];

function LiveTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-y border-gray-800/60 bg-gray-950/60">
      <div className="flex animate-ticker-scroll whitespace-nowrap py-1.5">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-4 text-xs">
            <span className="text-gray-400 font-semibold">{t.sym}</span>
            <span className="text-white">{t.price}</span>
            <span className={t.up ? "text-gray-300" : "text-gray-500"}>{t.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <LandingNav activePage="/" />
      <LiveTicker />

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 pt-16 pb-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs text-gray-300 bg-gray-800/60 border border-gray-700/40 rounded-full px-3 py-1.5 mb-6">
            <Wifi className="w-3 h-3" />
            Live &mdash; Rithmic MBO Level 3 Order Flow
          </div>

          <h1 className="text-4xl lg:text-[3.25rem] font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            Quantitative Trading<br />Research Platform
          </h1>
          <p className="text-gray-400 text-[15px] mb-8 max-w-lg leading-relaxed">
            Live Level 3 market data, cloud research terminals, and institutional-grade backtesting. From raw order flow to validated strategies — all in one platform.
          </p>

          <ul className="space-y-2.5 mb-10">
            {[
              "Real-Time MBO Level 3 Order Flow",
              "AI-Powered Quantitative Analysis",
              "Chart-Based Strategy Backtesting",
              "Cloud Research Terminals with ML",
            ].map(label => (
              <li key={label} className="flex items-center gap-3 text-[13px]">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-gray-500" />
                <span className="text-gray-300">{label}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <Button asChild className="bg-white text-black hover:bg-gray-200 text-sm font-semibold px-7 h-12 rounded-lg gap-2">
              <Link to="/Download">Download Datrena <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" asChild className="text-sm text-gray-400 hover:text-white border-gray-700 hover:border-gray-500 px-6 h-12 rounded-lg gap-1">
              <Link to="/Features">View All Features <ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
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

      {/* Three Products */}
      <section className="border-t border-gray-800/60 bg-gray-950/30">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-24">
          <div className="text-center mb-14">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">From Data to Production</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Live market data, cloud research, and institutional-grade backtesting. Everything a quant needs in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRODUCTS.map(product => {
              const Icon = product.icon;
              return (
                <Link key={product.title} to={product.anchor} className="no-underline">
                  <Card className="relative bg-gray-900/40 border-gray-800/40 hover:border-gray-700/60 transition-all group cursor-pointer h-full">
                    {product.status && (
                      <Badge className="absolute top-4 right-4 bg-gray-800 text-gray-300 text-[10px] border-none">
                        {product.status}
                      </Badge>
                    )}
                    <CardHeader className="p-6 pb-0">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-gray-800/60">
                        <Icon className="w-5 h-5 text-gray-400" />
                      </div>
                      <CardTitle className="text-[15px]">{product.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                      <CardDescription className="text-xs leading-relaxed mb-4">{product.description}</CardDescription>
                      <div className="flex flex-wrap gap-1.5">
                        {product.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-gray-800/60 border border-gray-700/40 text-gray-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <TradersSection />

      {/* Comparison */}
      <section className="border-t border-gray-800/60">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-20">
          <h2 className="text-2xl font-bold text-white mb-3">How Datrena Compares</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-lg">
            Purpose-built for quantitative trading research. Not a general charting platform with add-ons.
          </p>
          <Card className="bg-gray-900 border-gray-800 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-xs text-gray-500">Feature</TableHead>
                  <TableHead className="text-xs text-white text-center">Datrena</TableHead>
                  <TableHead className="text-xs text-gray-500 text-center">TradingView</TableHead>
                  <TableHead className="text-xs text-gray-500 text-center">NinjaTrader</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON.map((row, i) => (
                  <TableRow key={i} className="border-gray-800/50">
                    <TableCell className="text-sm text-gray-300">{row.feature}</TableCell>
                    <TableCell className="text-center">
                      {row.datrena ? <Check className="w-4 h-4 text-white mx-auto" /> : <span className="text-gray-700">&mdash;</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.tradingview ? <Check className="w-4 h-4 text-gray-400 mx-auto" /> : <span className="text-gray-700">&mdash;</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.ninjatrader ? <Check className="w-4 h-4 text-gray-400 mx-auto" /> : <span className="text-gray-700">&mdash;</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-800/60 bg-gray-950/30">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-20">
          <h2 className="text-2xl font-bold text-white mb-3">FAQ</h2>
          <p className="text-gray-500 text-sm mb-8">Common questions about data, research, and backtesting.</p>
          <div className="max-w-2xl">
            <Accordion type="single" collapsible>
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-gray-800/50">
                  <AccordionTrigger className="text-sm text-gray-200 hover:no-underline hover:text-white">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-500 leading-relaxed">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800/60 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-24 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">Ready to see what's behind the price?</h2>
          <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto">
            Stop guessing. Start reading the order flow. Get access to live Level 3 data, cloud research, and backtesting today.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild className="bg-white text-black hover:bg-gray-200 text-sm font-semibold px-8 h-12 rounded-lg gap-2">
              <Link to="/Download">Download Datrena <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" asChild className="text-sm text-gray-400 hover:text-white border-gray-700 hover:border-gray-500 px-7 h-12 rounded-lg">
              <Link to="/Pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
