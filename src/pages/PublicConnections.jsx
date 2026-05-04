import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Plug, Globe, Sparkles, ArrowRight } from "lucide-react";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";

/**
 * Public-facing Connections marketing page.
 * Showcases the data feeds, brokers, and exchanges Datrena will support.
 * Lives at /Connections on the marketing site (datrena.com).
 *
 * Note: The in-app data-feed manager (only inside the Electron desktop app)
 * lives at /AppConnections and is a different component.
 */

// Three top-level benefits pills
const BENEFITS = [
  {
    icon: Plug,
    title: "Use any connection",
    description:
      "Bring your own broker or data feed. Datrena is platform-neutral — your subscription stays with the provider.",
  },
  {
    icon: Globe,
    title: "Every market, one workspace",
    description:
      "Crypto, futures, equities, options — view and analyze them all from a single panel layout.",
  },
  {
    icon: Sparkles,
    title: "More to come",
    description:
      "We are actively adding new feeds. If you don't see your provider, request the integration and we'll prioritize it.",
  },
];

// Providers Datrena will support at launch.
// Each entry has a status: live | beta | planned | requested.
const PROVIDERS = [
  // Crypto exchanges
  { name: "Binance", market: "Crypto", type: "Crypto exchange", region: "Global", status: "live" },
  { name: "Binance Futures", market: "Crypto", type: "Crypto exchange", region: "Global", status: "planned" },
  { name: "Coinbase", market: "Crypto", type: "Crypto exchange", region: "Global", status: "planned" },
  { name: "Kraken", market: "Crypto", type: "Crypto exchange", region: "Global", status: "planned" },
  { name: "Bybit", market: "Crypto", type: "Crypto exchange", region: "Global", status: "planned" },
  { name: "OKX", market: "Crypto", type: "Crypto exchange", region: "Global", status: "planned" },
  { name: "Bitfinex", market: "Crypto", type: "Crypto exchange", region: "Global", status: "planned" },
  { name: "Kucoin", market: "Crypto", type: "Crypto exchange", region: "Global", status: "requested" },
  { name: "Deribit", market: "Crypto", type: "Crypto exchange", region: "Global", status: "requested" },

  // Futures brokers + data
  { name: "Rithmic", market: "Futures", type: "Data feed", region: "US", status: "beta" },
  { name: "CQG", market: "Futures", type: "Data feed", region: "US", status: "planned" },
  { name: "Tradovate", market: "Futures", type: "Broker", region: "US", status: "planned" },
  { name: "Interactive Brokers", market: "Futures", type: "Broker", region: "Global", status: "planned" },
  { name: "AMP Futures", market: "Futures", type: "Broker", region: "US", status: "planned" },
  { name: "NinjaTrader", market: "Futures", type: "Broker", region: "US", status: "requested" },

  // Stocks / equities
  { name: "Polygon.io", market: "Stocks", type: "Data feed", region: "US", status: "planned" },
  { name: "Alpaca", market: "Stocks", type: "Broker", region: "US", status: "planned" },
  { name: "Tradier", market: "Stocks", type: "Broker", region: "US", status: "requested" },
  { name: "TradeStation", market: "Stocks", type: "Broker", region: "US", status: "requested" },

  // Multi-asset data feeds
  { name: "dxFeed", market: "Multi-asset", type: "Data feed", region: "Global", status: "planned" },
  { name: "DTN IQFeed", market: "Stocks", type: "Data feed", region: "US", status: "planned" },
  { name: "Databento", market: "Multi-asset", type: "Data feed", region: "US", status: "planned" },
  { name: "Barchart", market: "Multi-asset", type: "Data feed", region: "Global", status: "requested" },

  // Prop firms
  { name: "Topstep", market: "Futures", type: "Prop firm", region: "Global", status: "planned" },
  { name: "Apex Trader Funding", market: "Futures", type: "Prop firm", region: "Global", status: "planned" },
  { name: "Bulenox", market: "Futures", type: "Prop firm", region: "Global", status: "requested" },
  { name: "Earn2Trade", market: "Futures", type: "Prop firm", region: "Global", status: "requested" },

  // FX
  { name: "OANDA", market: "Forex", type: "Broker", region: "Global", status: "planned" },
  { name: "FXCM", market: "Forex", type: "Broker", region: "Global", status: "planned" },
  { name: "FxPro", market: "Forex", type: "Broker", region: "Global", status: "requested" },
];

const MARKETS = ["All", "Crypto", "Futures", "Stocks", "Forex", "Multi-asset"];
const TYPES = ["All", "Crypto exchange", "Broker", "Data feed", "Prop firm"];

const STATUS_STYLES = {
  live: "bg-emerald-900/30 border-emerald-700/40 text-emerald-300",
  beta: "bg-amber-950/40 border-amber-900/40 text-amber-300",
  planned: "bg-zinc-900 border-zinc-800 text-zinc-400",
  requested: "bg-zinc-900/50 border-zinc-900 text-zinc-600",
};
const STATUS_LABEL = {
  live: "Live",
  beta: "Beta",
  planned: "Planned",
  requested: "Requested",
};

export default function PublicConnections() {
  const [search, setSearch] = useState("");
  const [market, setMarket] = useState("All");
  const [type, setType] = useState("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PROVIDERS.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (market !== "All" && p.market !== market) return false;
      if (type !== "All" && p.type !== type) return false;
      return true;
    });
  }, [search, market, type]);

  const liveCount = PROVIDERS.filter((p) => p.status === "live" || p.status === "beta").length;
  const totalCount = PROVIDERS.length;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <LandingNav activePage="/Connections" />

      <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            {liveCount} live · {totalCount - liveCount} planned
          </div>
          <h1 className="text-4xl lg:text-5xl font-light tracking-tight mb-4">
            Connections
          </h1>
          <p className="text-zinc-400 text-base lg:text-lg max-w-2xl leading-relaxed">
            Datrena is platform-neutral — bring your own broker, your own data feed, and
            your own subscription. We don't resell market data or take a cut. You connect,
            you analyze, you keep your edge.
          </p>
        </div>

        {/* Three benefit pills */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-sm font-semibold mb-1">{b.title}</div>
                <div className="text-xs text-zinc-500 leading-relaxed">{b.description}</div>
              </div>
            );
          })}
        </div>

        {/* Featured / promo banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-zinc-950 border border-emerald-900/30 p-8 mb-16">
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-semibold mb-2">
                Founder offer
              </div>
              <h2 className="text-2xl font-light mb-2">
                Free Pro tier for the first 30 days
              </h2>
              <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                Waitlist members get every feature unlocked at launch — multi-symbol
                charting, MBO depth heatmap, all timeframes — on us, while you set up
                your data feed.
              </p>
            </div>
            <Link
              to="/Waitlist"
              className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition whitespace-nowrap"
            >
              Reserve your spot <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Find your connection */}
        <div className="mb-8">
          <h2 className="text-xl font-light mb-2">Find your connection</h2>
          <p className="text-sm text-zinc-500">
            Browse the providers Datrena supports today, plus the integrations on the
            roadmap. Don't see yours?{" "}
            <a href="mailto:hello@datrena.com" className="text-zinc-300 hover:text-white">
              Request it →
            </a>
          </p>
        </div>

        {/* Filters */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by provider name..."
              className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">
                Market
              </div>
              <div className="flex flex-wrap gap-2">
                {MARKETS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarket(m)}
                    className={`text-xs px-3 py-1 rounded-full transition ${
                      market === m
                        ? "bg-white text-black font-semibold"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">
                Type
              </div>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`text-xs px-3 py-1 rounded-full transition ${
                      type === t
                        ? "bg-white text-black font-semibold"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Provider grid */}
        {filtered.length === 0 ? (
          <div className="bg-zinc-950 border border-dashed border-zinc-800 rounded-xl p-12 text-center">
            <div className="text-sm text-zinc-400 mb-2">No providers match your filters</div>
            <button
              onClick={() => { setSearch(""); setMarket("All"); setType("All"); }}
              className="text-xs text-zinc-500 hover:text-white underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
            {filtered.map((p) => (
              <div
                key={p.name}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm font-semibold text-zinc-200">{p.name}</div>
                  <span
                    className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border whitespace-nowrap ${STATUS_STYLES[p.status]}`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 flex items-center gap-2">
                  <span>{p.market}</span>
                  <span className="text-zinc-700">·</span>
                  <span>{p.type}</span>
                </div>
                <div className="text-[10px] text-zinc-700 mt-1">{p.region}</div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center pt-12 border-t border-zinc-900">
          <h3 className="text-xl font-light mb-2">Don't see your provider?</h3>
          <p className="text-sm text-zinc-500 mb-5 max-w-md mx-auto">
            We're prioritizing integrations based on waitlist demand. Vote for yours
            and we'll bump it up the queue.
          </p>
          <Link
            to="/Waitlist"
            className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition"
          >
            Join the waitlist <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
