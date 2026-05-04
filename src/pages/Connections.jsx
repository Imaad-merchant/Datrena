import React, { useState } from "react";
import { Wifi, WifiOff, Check, Lock, Settings, Plus, Bitcoin, BarChart3, TrendingUp, Building2, Activity } from "lucide-react";
import DesktopGate from "../components/DesktopGate";
import { useWorkspace } from "../lib/WorkspaceContext";
import { useLicense } from "../lib/LicenseContext";

/**
 * Quantower-style Connections panel.
 * Shows every available data feed and lets the user activate one.
 * "Free" plans get one active connection at a time (matches Quantower's free tier).
 */

const FEEDS = [
  {
    id: "binance",
    name: "Binance",
    category: "Crypto",
    icon: Bitcoin,
    description: "Spot crypto · Live trades + L2 depth20@100ms",
    available: true,
    requiresLicense: false,
    supportsTrading: false,
    region: "Global",
  },
  {
    id: "dxfeed",
    name: "dxFeed",
    category: "Stocks · Futures · Options",
    icon: BarChart3,
    description: "Professional US market data (CME, NYSE, NASDAQ, OPRA)",
    available: false,
    requiresLicense: "pro",
    supportsTrading: false,
    region: "US",
  },
  {
    id: "rithmic",
    name: "Rithmic R | Trader Pro",
    category: "Futures",
    icon: TrendingUp,
    description: "CME Group, ICE, Eurex futures · Tick + L2",
    available: false,
    requiresLicense: "elite",
    supportsTrading: true,
    region: "US",
  },
  {
    id: "cqg",
    name: "CQG",
    category: "Futures",
    icon: TrendingUp,
    description: "Global futures, indices, commodities",
    available: false,
    requiresLicense: "elite",
    supportsTrading: true,
    region: "US",
  },
  {
    id: "polygon",
    name: "Polygon.io",
    category: "Stocks",
    icon: Building2,
    description: "US stocks, options, indices · WebSocket + REST",
    available: false,
    requiresLicense: "pro",
    supportsTrading: false,
    region: "US",
  },
  {
    id: "tradovate",
    name: "Tradovate",
    category: "Futures",
    icon: Activity,
    description: "Retail futures broker · CME Group access",
    available: false,
    requiresLicense: "pro",
    supportsTrading: true,
    region: "US",
  },
  {
    id: "iqfeed",
    name: "DTN IQFeed",
    category: "Stocks · Futures",
    icon: BarChart3,
    description: "Professional US market data feed",
    available: false,
    requiresLicense: "pro",
    supportsTrading: false,
    region: "US",
  },
];

export default function Connections() {
  const { feed: activeFeed, switchFeed, connectionMode, setConnectionMode } = useWorkspace();
  const { tierKey, tier } = useLicense();
  const [filter, setFilter] = useState("all");

  const categories = ["all", ...Array.from(new Set(FEEDS.map((f) => f.category)))];
  const filtered = filter === "all" ? FEEDS : FEEDS.filter((f) => f.category === filter);

  return (
    <DesktopGate title="Connections">
      <div className="min-h-screen bg-black text-white" style={{ paddingLeft: "4rem" }}>
        <div className="max-w-5xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-light tracking-tight mb-1">Connections</h1>
              <p className="text-sm text-zinc-500">
                Connect Datrena to your market data feeds. Free tier supports one active
                connection at a time.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs">
              <span className="text-zinc-500">Plan:</span>
              <span className="text-white font-semibold">{tier.name}</span>
            </div>
          </div>

          {/* Mode toggle (Info / Trading) — Quantower has this */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold mb-0.5">Connection mode</div>
              <div className="text-xs text-zinc-500">
                {connectionMode === "info"
                  ? "Info only — receive market data, no order routing."
                  : "Trading — receive data and route live orders to the broker."}
              </div>
            </div>
            <div className="flex items-center bg-black rounded-md border border-zinc-800 p-0.5 text-xs">
              <button
                onClick={() => setConnectionMode("info")}
                className={`px-3 py-1.5 rounded transition ${
                  connectionMode === "info"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setConnectionMode("trading")}
                className={`px-3 py-1.5 rounded transition ${
                  connectionMode === "trading"
                    ? "bg-emerald-700/40 text-emerald-300"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Trading
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition ${
                  filter === c
                    ? "bg-white text-black font-semibold"
                    : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {c === "all" ? "All providers" : c}
              </button>
            ))}
          </div>

          {/* Feed list */}
          <div className="space-y-2">
            {filtered.map((f) => {
              const Icon = f.icon;
              const isActive = activeFeed === f.id;
              return (
                <div
                  key={f.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition ${
                    isActive
                      ? "bg-emerald-950/20 border-emerald-700/50"
                      : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold">{f.name}</span>
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500">
                        {f.category}
                      </span>
                      {f.supportsTrading && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-400">
                          Trading
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-700 text-white flex items-center gap-1">
                          <Wifi size={9} />
                          Connected
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500">{f.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {f.available ? (
                      isActive ? (
                        <button
                          onClick={() => switchFeed("binance")}
                          className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 transition flex items-center gap-1.5"
                        >
                          <WifiOff size={11} /> Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => switchFeed(f.id)}
                          className="text-xs text-black bg-white hover:bg-zinc-200 font-semibold px-3 py-1.5 rounded transition flex items-center gap-1.5"
                        >
                          <Wifi size={11} /> Connect
                        </button>
                      )
                    ) : f.requiresLicense ? (
                      <button
                        onClick={() => (window.location.href = "/Pricing")}
                        className="text-xs text-amber-500 px-3 py-1.5 rounded bg-amber-950/40 border border-amber-900/40 hover:border-amber-700 transition flex items-center gap-1.5"
                      >
                        <Lock size={11} /> {f.requiresLicense.toUpperCase()}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="text-xs text-zinc-600 px-3 py-1.5 rounded bg-zinc-900 cursor-not-allowed flex items-center gap-1.5"
                      >
                        <Settings size={11} /> Configure
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-xs text-zinc-600 leading-relaxed">
            <p className="mb-1">
              Need a feed not listed here?{" "}
              <a href="mailto:hello@datrena.com" className="text-zinc-400 hover:text-white">
                Request integration →
              </a>
            </p>
            <p>
              Datrena is licensed separately from market data. Exchange and feed fees
              are billed by your provider, not by Datrena.
            </p>
          </div>
        </div>
      </div>
    </DesktopGate>
  );
}

