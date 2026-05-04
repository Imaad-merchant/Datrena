import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * Quantower-style workspace context.
 * Tracks the active connection, the active symbol, and the watchlist —
 * shared across all linked panels in the workspace.
 *
 * Panels that opt into linking (Watchlist, Chart, DOM) read & write `symbol`
 * here so changing the symbol in one panel updates the others.
 */

const WorkspaceContext = createContext(null);

const FEED_KEY = "datrena_default_feed";
const WATCHLIST_KEY = "datrena_watchlist";

const DEFAULT_WATCHLIST = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
];

export function WorkspaceProvider({ children }) {
  const [feed, setFeed] = useState(() => {
    try { return localStorage.getItem(FEED_KEY) || "binance"; } catch { return "binance"; }
  });
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  });
  // Connection mode: 'info' (data only) or 'trading' (allows orders) — Quantower-style
  const [connectionMode, setConnectionMode] = useState("info");

  const switchFeed = useCallback((newFeed) => {
    setFeed(newFeed);
    try { localStorage.setItem(FEED_KEY, newFeed); } catch {}
  }, []);

  const addToWatchlist = useCallback((sym) => {
    setWatchlist((prev) => {
      if (prev.includes(sym)) return prev;
      const next = [...prev, sym];
      try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeFromWatchlist = useCallback((sym) => {
    setWatchlist((prev) => {
      const next = prev.filter((s) => s !== sym);
      try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const value = {
    feed,
    switchFeed,
    symbol,
    setSymbol,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    connectionMode,
    setConnectionMode,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
