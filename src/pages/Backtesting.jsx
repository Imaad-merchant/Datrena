import React, { useState } from "react";
import MainNav from "../components/navigation/MainNav";
import {
  Play, Pause, SkipForward, SkipBack, FastForward,
  Calendar, ChevronDown, BarChart3, Code2,
  TrendingUp, Clock, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const INSTRUMENTS = ["ES", "NQ", "CL", "GC", "YM", "ZB", "6E", "SI"];
const TIMEFRAMES = ["1m", "3m", "5m", "15m", "30m", "1H", "4H", "D"];
const SPEEDS = ["1x", "2x", "5x", "10x", "50x", "Max"];

export default function Backtesting() {
  const [instrument, setInstrument] = useState("NQ");
  const [timeframe, setTimeframe] = useState("5m");
  const [speed, setSpeed] = useState("1x");
  const [playing, setPlaying] = useState(false);
  const [strategyLoaded, setStrategyLoaded] = useState(false);

  return (
    <div className="h-screen bg-black pl-16 flex flex-col text-white overflow-hidden">
      <MainNav />

      {/* Top toolbar */}
      <div className="border-b border-gray-800/60 px-4 py-2 flex items-center gap-3 shrink-0">
        {/* Instrument selector */}
        <div className="relative">
          <select
            value={instrument}
            onChange={e => setInstrument(e.target.value)}
            className="bg-gray-900/60 border border-gray-800/50 text-white text-xs font-semibold rounded-lg px-3 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none"
          >
            {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Timeframe */}
        <div className="flex items-center gap-0.5 bg-gray-900/40 border border-gray-800/50 rounded-lg p-0.5">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 text-[10px] rounded font-medium transition-colors ${
                timeframe === tf
                  ? "bg-gray-700 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-800 mx-1" />

        {/* Date range */}
        <button className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-800/50 rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
          <Calendar className="w-3 h-3" />
          Jan 1 – Mar 31, 2025
        </button>

        <div className="w-px h-5 bg-gray-800 mx-1" />

        {/* Playback controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-500 hover:text-white">
            <SkipBack className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-gray-400 hover:text-white"
            onClick={() => setPlaying(!playing)}
          >
            {playing
              ? <Pause className="w-4 h-4" />
              : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-500 hover:text-white">
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-500 hover:text-white">
            <FastForward className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Speed */}
        <div className="relative">
          <select
            value={speed}
            onChange={e => setSpeed(e.target.value)}
            className="bg-gray-900/60 border border-gray-800/50 text-gray-400 text-[10px] font-medium rounded-lg px-2 py-1.5 pr-6 appearance-none cursor-pointer focus:outline-none"
          >
            {SPEEDS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="w-2.5 h-2.5 text-gray-600 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="text-xs text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white h-7 px-3 rounded-lg gap-1.5"
            onClick={() => setStrategyLoaded(!strategyLoaded)}
          >
            <Code2 className="w-3 h-3" />
            {strategyLoaded ? "Strategy Loaded" : "Load Strategy"}
          </Button>
          <Button className="bg-white text-black hover:bg-gray-200 text-xs h-7 px-3 rounded-lg gap-1.5">
            <Play className="w-3 h-3" />
            Run Backtest
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Chart area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chart placeholder */}
          <div className="flex-1 flex items-center justify-center bg-gray-950/30 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={`h${i}`} className="absolute left-0 right-0 border-t border-gray-500" style={{ top: `${(i + 1) * 5}%` }} />
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={`v${i}`} className="absolute top-0 bottom-0 border-l border-gray-500" style={{ left: `${(i + 1) * 5}%` }} />
              ))}
            </div>

            <div className="text-center z-10">
              <BarChart3 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium mb-1">
                {instrument} &mdash; {timeframe} Footprint Chart
              </p>
              <p className="text-gray-600 text-xs">
                Load a strategy and select a date range to begin backtesting
              </p>
            </div>

            {/* Price axis placeholder */}
            <div className="absolute right-0 top-0 bottom-0 w-14 border-l border-gray-800/40 bg-black/30 flex flex-col justify-between py-4 px-1">
              {["5850", "5840", "5830", "5820", "5810", "5800", "5790"].map(p => (
                <span key={p} className="text-[9px] text-gray-600 tabular-nums text-right">{p}</span>
              ))}
            </div>
          </div>

          {/* Time axis */}
          <div className="h-5 border-t border-gray-800/40 bg-black/30 flex items-center justify-around px-16 shrink-0">
            {["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00"].map(t => (
              <span key={t} className="text-[9px] text-gray-600 tabular-nums">{t}</span>
            ))}
          </div>
        </div>

        {/* Right panel — Results */}
        <div className="w-72 border-l border-gray-800/60 bg-gray-950/30 overflow-y-auto shrink-0">
          <div className="p-4 space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Performance</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Net P&L", value: "—" },
                  { label: "Win Rate", value: "—" },
                  { label: "Profit Factor", value: "—" },
                  { label: "Sharpe Ratio", value: "—" },
                  { label: "Max Drawdown", value: "—" },
                  { label: "Total Trades", value: "—" },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-900/40 border border-gray-800/30 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-gray-600">{stat.label}</p>
                    <p className="text-sm text-gray-400 tabular-nums">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Trade Log</h3>
              <div className="bg-gray-900/40 border border-gray-800/30 rounded-lg p-4 text-center">
                <AlertCircle className="w-5 h-5 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-600">No trades yet</p>
                <p className="text-[10px] text-gray-700 mt-0.5">Run a backtest to see results</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Settings</h3>
              <div className="space-y-2">
                {[
                  { label: "Initial Capital", value: "$100,000" },
                  { label: "Commission", value: "$2.50 / side" },
                  { label: "Slippage", value: "1 tick" },
                  { label: "Position Size", value: "1 contract" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{s.label}</span>
                    <span className="text-gray-400">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
