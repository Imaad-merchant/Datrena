import React, { useEffect, useState } from "react";
import { Plus, X, Wifi, WifiOff, Search, TrendingUp, TrendingDown, Save, Layout as LayoutIcon } from "lucide-react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import DesktopGate from "../components/DesktopGate";
import { useWorkspace } from "../lib/WorkspaceContext";
import DataLayer from "./DataLayer";

/**
 * Quantower-style main workspace.
 * Two linked panels: Watchlist (left) + Chart (right). Selecting a symbol in the
 * watchlist updates the chart via WorkspaceContext.
 *
 * Templates ("binds" in Quantower) are saved to localStorage with a name and
 * three-letter shorthand and can be loaded from the sidebar.
 */

const BINANCE_REST = "https://api.binance.com/api/v3";
const BINDS_KEY = "datrena_binds";

// ── Watchlist panel ──────────────────────────────────────────────────────────
function WatchlistPanel() {
  const { watchlist, addToWatchlist, removeFromWatchlist, symbol, setSymbol } = useWorkspace();
  const [tickers, setTickers] = useState({}); // sym -> { price, change }
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // Poll Binance 24hr ticker for prices + change
  useEffect(() => {
    let abort = false;
    async function poll() {
      try {
        const res = await fetch(`${BINANCE_REST}/ticker/24hr`);
        if (!res.ok) return;
        const all = await res.json();
        if (abort) return;
        const map = {};
        for (const t of all) {
          map[t.symbol] = {
            price: parseFloat(t.lastPrice),
            change: parseFloat(t.priceChangePercent),
            volume: parseFloat(t.quoteVolume),
          };
        }
        setTickers(map);
      } catch {}
    }
    poll();
    const iv = setInterval(poll, 5000);
    return () => { abort = true; clearInterval(iv); };
  }, []);

  const filteredAdd = search
    ? Object.keys(tickers)
        .filter((s) => s.includes(search.toUpperCase()) && !watchlist.includes(s))
        .slice(0, 20)
    : [];

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-900">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-900">
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
          Watchlist
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-900 text-zinc-500 hover:text-white"
          title="Add symbol"
        >
          <Plus size={12} />
        </button>
      </div>

      {showAdd && (
        <div className="px-2 py-2 border-b border-zinc-900">
          <div className="relative">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value.toUpperCase())}
              placeholder="Add symbol..."
              className="w-full bg-black border border-zinc-800 rounded pl-7 pr-2 py-1.5 text-xs font-mono focus:outline-none focus:border-zinc-600"
            />
          </div>
          {filteredAdd.length > 0 && (
            <div className="mt-1 max-h-40 overflow-y-auto bg-black rounded border border-zinc-900">
              {filteredAdd.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    addToWatchlist(s);
                    setSearch("");
                    setShowAdd(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="text-zinc-600 sticky top-0 bg-zinc-950">
            <tr>
              <th className="text-left font-normal px-3 py-1.5">Symbol</th>
              <th className="text-right font-normal px-2 py-1.5">Last</th>
              <th className="text-right font-normal px-2 py-1.5">24h</th>
              <th className="w-5" />
            </tr>
          </thead>
          <tbody>
            {watchlist.map((s) => {
              const t = tickers[s];
              const isActive = s === symbol;
              const up = t && t.change >= 0;
              return (
                <tr
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={`group cursor-pointer ${
                    isActive ? "bg-zinc-900" : "hover:bg-zinc-900/50"
                  }`}
                >
                  <td className="px-3 py-1.5 font-mono font-semibold text-zinc-200">
                    {s.replace("USDT", "")}
                    <span className="text-zinc-600 font-normal">/USDT</span>
                  </td>
                  <td className="px-2 py-1.5 font-mono text-right text-zinc-300">
                    {t ? t.price.toLocaleString(undefined, { maximumFractionDigits: t.price > 100 ? 2 : 4 }) : "—"}
                  </td>
                  <td
                    className={`px-2 py-1.5 font-mono text-right ${
                      !t ? "text-zinc-600" : up ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {t ? `${up ? "+" : ""}${t.change.toFixed(2)}%` : "—"}
                  </td>
                  <td className="pr-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(s);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400"
                      title="Remove"
                    >
                      <X size={10} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Save-as-Bind dialog ──────────────────────────────────────────────────────
function SaveBindDialog({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [shorthand, setShorthand] = useState("");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-sm"
      >
        <div className="text-sm font-semibold mb-1">Save layout as bind</div>
        <div className="text-xs text-zinc-500 mb-5">
          Save this workspace template so you can recall it any time.
        </div>
        <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My BTC layout"
          className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-sm mb-3 focus:outline-none focus:border-zinc-600"
        />
        <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">
          Shorthand · 3 letters
        </label>
        <input
          value={shorthand}
          onChange={(e) => setShorthand(e.target.value.toUpperCase().slice(0, 3))}
          placeholder="BTC"
          className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-sm font-mono mb-5 focus:outline-none focus:border-zinc-600"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded"
          >
            Cancel
          </button>
          <button
            disabled={!name.trim() || shorthand.length !== 3}
            onClick={() => onSave({ name: name.trim(), shorthand })}
            className="text-xs text-black bg-white hover:bg-zinc-200 disabled:opacity-40 font-semibold px-3 py-1.5 rounded"
          >
            Save bind
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Workspace toolbar ────────────────────────────────────────────────────────
function WorkspaceToolbar() {
  const { feed, symbol } = useWorkspace();
  const [showSave, setShowSave] = useState(false);
  const [binds, setBinds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BINDS_KEY) || "[]"); } catch { return []; }
  });

  const saveBind = ({ name, shorthand }) => {
    const next = [...binds, { name, shorthand, symbol, savedAt: new Date().toISOString() }];
    setBinds(next);
    try { localStorage.setItem(BINDS_KEY, JSON.stringify(next)); } catch {}
    setShowSave(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-900 bg-zinc-950 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Wifi size={11} className="text-emerald-500" />
          <span className="font-semibold capitalize">{feed}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">Live</span>
        </div>
        <div className="w-px h-4 bg-zinc-800" />
        <div className="text-zinc-400">
          Active: <span className="text-white font-mono font-semibold">{symbol}</span>
        </div>

        <div className="flex-1" />

        {/* Saved binds */}
        {binds.length > 0 && (
          <div className="flex items-center gap-1">
            {binds.slice(0, 6).map((b) => (
              <button
                key={b.name}
                onClick={() => { /* future: load layout */ }}
                title={b.name}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-mono text-[10px] font-bold tracking-wider"
              >
                {b.shorthand}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowSave(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
          title="Save current layout as bind"
        >
          <Save size={11} /> Save bind
        </button>
      </div>

      {showSave && (
        <SaveBindDialog onClose={() => setShowSave(false)} onSave={saveBind} />
      )}
    </>
  );
}

// ── Workspace shell ──────────────────────────────────────────────────────────
export default function Workspace() {
  return (
    <DesktopGate title="Workspace">
      <div
        className="h-screen bg-black text-white flex flex-col"
        style={{ paddingLeft: "4rem" }}
      >
        <WorkspaceToolbar />
        <div className="flex-1 min-h-0">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={20} minSize={15} maxSize={35}>
              <WatchlistPanel />
            </Panel>
            <PanelResizeHandle className="w-px bg-zinc-900 hover:bg-zinc-700 transition" />
            <Panel defaultSize={80}>
              {/* The chart panel reads `symbol` from workspace context — see DataLayer */}
              <div className="h-full">
                <DataLayer />
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </DesktopGate>
  );
}
