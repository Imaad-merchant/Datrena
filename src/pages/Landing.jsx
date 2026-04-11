import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Database, TrendingUp, Lightbulb, CheckCircle, ArrowRight,
  Wifi, ChevronRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";
import TradersSection from "../components/landing/TradersSection";

/* ── Four platform layers ──────────────────────────────────────────────── */
const LAYERS = [
  {
    title: "Data Layer", icon: Database, color: "#3B82F6",
    status: "LIVE", anchor: "/Features#data-layer",
    description: "Real-time MBO Level 3 order flow visualization. Footprint charts, DOM heatmaps, iceberg detection, and pull rate analysis.",
    tags: ["Footprint", "DOM Heatmap", "Iceberg", "Order Tracking", "Pull Rate", "Delta/Volume"],
  },
  {
    title: "Analysis Layer", icon: TrendingUp, color: "#8B5CF6",
    status: null, anchor: "/Features#analysis-layer",
    description: "AI-driven statistical research on OHLCVD market data. Volatility surfaces, combinatorial analysis, and pattern discovery.",
    tags: ["Volatility", "Combinatorics", "AI Analysis"],
  },
  {
    title: "Insight Layer", icon: Lightbulb, color: "#F59E0B",
    status: null, anchor: "/Features#insight-layer",
    description: "Prop firm performance tracking — P&L, drawdown monitoring, win rate analytics, and trade calendar heatmaps.",
    tags: ["P&L", "Win Rate", "Drawdown", "Calendar"],
  },
  {
    title: "Validation Layer", icon: CheckCircle, color: "#10B981",
    status: null, anchor: "/Features#validation-layer",
    description: "Backtest and validate strategies with walk-forward analysis, Monte Carlo simulation, and risk metrics.",
    tags: ["Backtesting", "Walk-Forward", "Monte Carlo", "Risk Metrics"],
  },
];

/* ── Stats bar ─────────────────────────────────────────────────────────── */
const STATS = [
  { value: "Level 3",  label: "MBO DATA" },
  { value: "0.25",     label: "TICK RES" },
  { value: "7+",       label: "OVERLAYS" },
  { value: "<10ms",    label: "LATENCY" },
  { value: "12",       label: "TIMEFRAMES" },
  { value: "4",        label: "EXCHANGES" },
];

/* ── Comparison data ───────────────────────────────────────────────────── */
const COMPARISON = [
  { feature: "MBO Level 3 Data", datrena: true, tradingview: false, ninjatrader: false },
  { feature: "Footprint Charts", datrena: true, tradingview: false, ninjatrader: true },
  { feature: "DOM Heatmap", datrena: true, tradingview: false, ninjatrader: true },
  { feature: "Iceberg Detection", datrena: true, tradingview: false, ninjatrader: false },
  { feature: "Pull Rate Analysis", datrena: true, tradingview: false, ninjatrader: false },
  { feature: "AI Quant Analysis", datrena: true, tradingview: false, ninjatrader: false },
  { feature: "Web-Based (No Install)", datrena: true, tradingview: true, ninjatrader: false },
  { feature: "Free Tier", datrena: true, tradingview: true, ninjatrader: false },
];

/* ── FAQ data ──────────────────────────────────────────────────────────── */
const FAQ = [
  { q: "What data feed does Datrena use?", a: "Datrena connects to Rithmic's MBO (Market by Order) Level 3 feed, which provides individual order events directly from CME Group's matching engine. This is the same feed used by institutional desks." },
  { q: "Is there a learning curve for order flow?", a: "The footprint chart can seem dense at first, but we provide toggleable overlays so you can start with simple candlesticks and progressively add order flow layers (delta, DOM heatmap, iceberg detection) as you learn." },
  { q: "Does it work on Mac / Linux?", a: "Yes. Datrena is a fully web-based platform — no desktop installation required. Works on any modern browser across macOS, Windows, and Linux." },
  { q: "What are the exchange data costs?", a: "Exchange data fees (CME, CBOT, NYMEX, COMEX) are billed separately through Rithmic and depend on your subscription type (professional vs. non-professional). Datrena's platform fees are independent of data costs." },
  { q: "Can I use Datrena for automated trading?", a: "The Validation Layer (coming soon) will support strategy backtesting, walk-forward analysis, and Monte Carlo simulation. Live automated execution is on the roadmap." },
];

/* ── Live ticker simulation ────────────────────────────────────────────── */
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
    <div className="overflow-hidden border-y border-border bg-card">
      <div className="flex animate-ticker-scroll whitespace-nowrap py-1.5">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-4 text-[10px]">
            <span className="text-muted-foreground font-semibold">{t.sym}</span>
            <span className="text-foreground">{t.price}</span>
            <span className={t.up ? "text-dt-green" : "text-dt-red"}>{t.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const [showToast, setShowToast] = useState(false);

  const handleSignIn = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      <LandingNav activePage="/" />
      <LiveTicker />

      {/* ═══ Hero ═══ */}
      <section className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 pt-14 pb-20">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-6 text-[10px] tracking-wider text-dt-green border-dt-green/20 bg-dt-green/10 gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-dt-green animate-pulse-green" />
            LIVE &mdash; RITHMIC MBO LEVEL 3
          </Badge>

          <h1 className="text-3xl lg:text-[2.75rem] font-bold leading-[1.15] mb-5 tracking-tight">
            Institutional Grade<br />Order Flow Analytics
          </h1>
          <p className="text-muted-foreground text-[13px] mb-8 max-w-lg leading-relaxed">
            See every order event in the exchange matching engine — icebergs, pulls, resting liquidity, and aggressive flow. Professional footprint charts with real-time MBO data from Rithmic.
          </p>

          <ul className="space-y-2 mb-8">
            {[
              { label: "Real-Time Order Flow & Footprint Charts", color: "#3B82F6" },
              { label: "AI-Driven Statistical Analysis", color: "#8B5CF6" },
              { label: "Prop Firm Performance Tracking", color: "#F59E0B" },
              { label: "Strategy Backtesting & Validation", color: "#10B981" },
            ].map(item => (
              <li key={item.label} className="flex items-center gap-3 text-[11px]">
                <span className="w-1.5 h-1.5 shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.label}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Button onClick={handleSignIn} className="bg-dt-green text-background hover:bg-dt-green/90 text-[12px] tracking-wide gap-2 rounded-none px-6 h-11">
              START FREE <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" asChild className="text-[12px] tracking-wide gap-1 rounded-none h-11">
              <Link to="/Features">
                ALL FEATURES <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Admin-only toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-card border border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="text-dt-red mr-2">ACCESS DENIED</span>
          Administrator access only.
        </div>
      )}

      {/* ═══ Stats bar ═══ */}
      <section className="border-y border-border bg-card">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-6 grid grid-cols-3 md:grid-cols-6 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-base font-bold text-foreground">{s.value}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5 tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Four Layers ═══ */}
      <section className="border-t border-border">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-20">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold mb-2 tracking-wide">FOUR INTEGRATED LAYERS</h2>
            <p className="text-muted-foreground text-[11px] max-w-xl mx-auto">
              From raw market data to validated strategies. Each layer builds on the last.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {LAYERS.map(layer => {
              const Icon = layer.icon;
              return (
                <Link key={layer.title} to={layer.anchor} className="no-underline">
                  <Card className="bg-card border-border hover:border-muted-foreground/30 transition-all group relative rounded-none h-full">
                    {layer.status && (
                      <Badge variant="outline" className="absolute top-3 right-3 text-[8px] tracking-widest rounded-none border-none"
                        style={{ color: layer.color, backgroundColor: layer.color + "15" }}>
                        {layer.status}
                      </Badge>
                    )}
                    <CardHeader className="p-5 pb-0">
                      <div className="w-8 h-8 flex items-center justify-center mb-3" style={{ backgroundColor: layer.color + "12" }}>
                        <Icon className="w-4 h-4" style={{ color: layer.color }} />
                      </div>
                      <CardTitle className="text-[13px]">{layer.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-2">
                      <CardDescription className="text-[10px] leading-relaxed mb-3">{layer.description}</CardDescription>
                      <div className="flex flex-wrap gap-1">
                        {layer.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-[8px] px-1.5 py-0 rounded-none"
                            style={{ color: layer.color + "cc" }}>
                            {tag}
                          </Badge>
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

      {/* ═══ Traders Section ═══ */}
      <TradersSection onSignIn={handleSignIn} />

      {/* ═══ Comparison Table ═══ */}
      <section className="border-t border-border">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16">
          <h2 className="text-lg font-bold mb-2 tracking-wide">HOW DATRENA COMPARES</h2>
          <p className="text-muted-foreground text-[11px] mb-8 max-w-lg">
            Purpose-built for order flow analysis. Not a general charting platform with add-ons.
          </p>

          <Card className="rounded-none">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-[9px] tracking-widest text-muted-foreground">FEATURE</TableHead>
                  <TableHead className="text-[9px] tracking-widest text-dt-green text-center">DATRENA</TableHead>
                  <TableHead className="text-[9px] tracking-widest text-muted-foreground text-center">TRADINGVIEW</TableHead>
                  <TableHead className="text-[9px] tracking-widest text-muted-foreground text-center">NINJATRADER</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON.map((row, i) => (
                  <TableRow key={i} className="border-border/50">
                    <TableCell className="text-[11px] text-muted-foreground">{row.feature}</TableCell>
                    <TableCell className="text-center text-[11px]">
                      {row.datrena ? <Check className="w-3.5 h-3.5 text-dt-green mx-auto" /> : <span className="text-border">&mdash;</span>}
                    </TableCell>
                    <TableCell className="text-center text-[11px]">
                      {row.tradingview ? <Check className="w-3.5 h-3.5 text-muted-foreground mx-auto" /> : <span className="text-border">&mdash;</span>}
                    </TableCell>
                    <TableCell className="text-center text-[11px]">
                      {row.ninjatrader ? <Check className="w-3.5 h-3.5 text-muted-foreground mx-auto" /> : <span className="text-border">&mdash;</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="border-t border-border bg-card">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16">
          <h2 className="text-lg font-bold mb-2 tracking-wide">FAQ</h2>
          <p className="text-muted-foreground text-[11px] mb-6">
            Common questions about data, compatibility, and costs.
          </p>
          <div className="max-w-2xl">
            <Accordion type="single" collapsible>
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border/50">
                  <AccordionTrigger className="text-[12px] hover:no-underline hover:text-dt-green py-3">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="border-t border-border">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-20 text-center">
          <h2 className="text-xl font-bold mb-3 tracking-wide">
            READY TO SEE WHAT'S BEHIND THE PRICE?
          </h2>
          <p className="text-muted-foreground text-[11px] mb-8 max-w-md mx-auto">
            Stop guessing. Start reading the order flow. Get access to the full footprint chart suite with real-time MBO data.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={handleSignIn} className="bg-dt-green text-background hover:bg-dt-green/90 text-[12px] tracking-wide gap-2 rounded-none px-7 h-11">
              GET STARTED FREE <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" asChild className="text-[12px] tracking-wide rounded-none h-11">
              <Link to="/Pricing">VIEW PRICING</Link>
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}