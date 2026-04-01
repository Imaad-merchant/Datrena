import React, { useState } from "react";
import MainNav from "../components/navigation/MainNav";
import {
  Plus, DollarSign, Target, TrendingUp, TrendingDown,
  Calendar, BarChart2, Activity, Clock, X, Check,
} from "lucide-react";

/* ── Demo data ────────────────────────────────────────────────────────── */
const DEMO_STATS = {
  totalTrades: 142, wins: 98, losses: 44,
  netPnl: 8420.50, avgWin: 215.30, avgLoss: -128.60,
  winRate: 69, profitFactor: 2.18, largestWin: 1240.00, largestLoss: -580.00,
  avgDuration: "14m", bestDay: 1860.00, worstDay: -720.00,
};

const DEMO_CALENDAR = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const weeks = [];
  let week = new Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const isWeekend = new Date(year, month, d).getDay() % 6 === 0;
    const val = isWeekend ? 0 : (Math.random() - 0.35) * 600;
    week.push({ day: d, value: Math.round(val), trades: isWeekend ? 0 : Math.floor(Math.random() * 8) + 1 });
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week); }
  return weeks;
})();

const PROP_FIRMS = ["TopStep", "Tradovate", "Apex", "Alpha Futures", "FTMO", "Earn2Trade", "The5ers", "Bulenox"];

const CONNECTIONS = [
  { firm: "TopStep", account: "TS-882441", status: "connected", lastSync: "2 min ago" },
];

export default function InsightLayer() {
  const [connections, setConnections] = useState(CONNECTIONS);
  const [showDialog, setShowDialog] = useState(false);
  const [firm, setFirm] = useState("");
  const [accountId, setAccountId] = useState("");
  const [apiKey, setApiKey] = useState("");

  const handleConnect = () => {
    if (!firm || !accountId || !apiKey) return;
    setConnections(prev => [...prev, { firm, account: accountId, status: "connected", lastSync: "just now" }]);
    setShowDialog(false);
    setFirm(""); setAccountId(""); setApiKey("");
  };

  const s = DEMO_STATS;
  const now = new Date();
  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="h-screen bg-[#0a0a10] pl-16 flex flex-col text-white overflow-hidden">
      <MainNav />

      {/* Toolbar */}
      <div className="border-b border-gray-800/60 bg-[#0a0a10] px-5 py-2.5 flex items-center gap-3 shrink-0" style={{ fontFamily: "sans-serif" }}>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Insight</span>
        <span className="text-xs text-white font-semibold">Trades Summary</span>

        <div className="ml-auto flex items-center gap-3">
          {connections.map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-900/60 border border-gray-800/50 rounded-lg px-3 py-1.5 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-gray-300 font-medium">{c.firm}</span>
              <span className="text-gray-600">{c.account}</span>
              <span className="text-gray-600 text-[10px]">{c.lastSync}</span>
            </div>
          ))}
          <button
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Plus className="w-3 h-3" /> Connect Firm
          </button>
        </div>
      </div>

      {/* Main — fits one screen */}
      <div className="flex-1 grid grid-cols-5 gap-0 overflow-hidden">

        {/* Left: Performance stats */}
        <div className="col-span-2 border-r border-gray-800/40 flex flex-col overflow-hidden">
          {/* Gauge + key metrics */}
          <div className="p-5 border-b border-gray-800/40">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Performance</span>
            </div>

            <div className="flex items-center gap-6">
              {/* Win rate ring */}
              <div className="relative shrink-0">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a2c" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="8"
                    strokeDasharray={`${s.winRate * 2.51} 251`} strokeLinecap="round"
                    transform="rotate(-90 50 50)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">{s.winRate}%</span>
                  <span className="text-[9px] text-gray-500">Win Rate</span>
                </div>
              </div>

              {/* Key numbers */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1">
                <div className="flex justify-between"><span className="text-gray-500">Net P&L</span><span className="text-emerald-400 font-semibold">+${s.netPnl.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">PF</span><span className="text-blue-400 font-semibold">{s.profitFactor}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Trades</span><span className="text-white font-semibold">{s.totalTrades}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Avg Duration</span><span className="text-white font-semibold">{s.avgDuration}</span></div>
              </div>
            </div>
          </div>

          {/* Detailed stats */}
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              {/* Wins */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-semibold text-white">Wins ({s.wins})</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {[
                    ["Avg Win", `+$${s.avgWin.toFixed(2)}`, "text-emerald-400"],
                    ["Largest Win", `+$${s.largestWin.toFixed(2)}`, "text-emerald-400"],
                    ["Best Day", `+$${s.bestDay.toFixed(2)}`, "text-emerald-400"],
                    ["Win Streak", "6", "text-white"],
                  ].map(([label, val, color]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className={`font-semibold ${color}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Losses */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-xs font-semibold text-white">Losses ({s.losses})</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {[
                    ["Avg Loss", `$${Math.abs(s.avgLoss).toFixed(2)}`, "text-red-400"],
                    ["Largest Loss", `$${Math.abs(s.largestLoss).toFixed(2)}`, "text-red-400"],
                    ["Worst Day", `$${Math.abs(s.worstDay).toFixed(2)}`, "text-red-400"],
                    ["Loss Streak", "3", "text-white"],
                  ].map(([label, val, color]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className={`font-semibold ${color}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Calendar heatmap */}
        <div className="col-span-3 p-5 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-white">{monthLabel}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-gray-600">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" /> Profit</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-600 inline-block" /> Loss</span>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-5 gap-2.5 mb-4">
            {[
              { label: "Total Trades", value: s.totalTrades, icon: BarChart2, color: "#9ca3af" },
              { label: "Net P&L", value: `+$${s.netPnl.toLocaleString()}`, icon: DollarSign, color: "#22c55e" },
              { label: "Win %", value: `${s.winRate}%`, icon: Target, color: "#22c55e" },
              { label: "Best Day", value: `+$${s.bestDay.toFixed(0)}`, icon: TrendingUp, color: "#22c55e" },
              { label: "Worst Day", value: `-$${Math.abs(s.worstDay).toFixed(0)}`, icon: TrendingDown, color: "#ef4444" },
            ].map(c => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="bg-gray-900/40 border border-gray-800/30 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3" style={{ color: c.color }} />
                    <span className="text-[10px] text-gray-500">{c.label}</span>
                  </div>
                  <div className="text-sm font-bold" style={{ color: c.color }}>{c.value}</div>
                </div>
              );
            })}
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-1.5">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <div key={d} className="text-center text-[10px] text-gray-600 font-medium">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex-1 flex flex-col gap-2">
            {DEMO_CALENDAR.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-2 flex-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${
                      day === null ? "" :
                      day.value > 200 ? "bg-emerald-600/80 text-white" :
                      day.value > 0 ? "bg-emerald-600/40 text-emerald-200" :
                      day.value < -200 ? "bg-red-600/80 text-white" :
                      day.value < 0 ? "bg-red-600/40 text-red-200" :
                      "bg-gray-900/40 text-gray-700"
                    }`}
                  >
                    {day && (
                      <>
                        <span className="text-[10px] opacity-60">{day.day}</span>
                        {day.value !== 0 && (
                          <span className="font-bold text-[11px]">
                            {day.value > 0 ? "+" : ""}${Math.abs(day.value)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connect Prop Firm Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowDialog(false)}>
          <div className="bg-[#111118] border border-gray-800 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()} style={{ fontFamily: "sans-serif" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-base">Connect Prop Firm</h3>
              <button onClick={() => setShowDialog(false)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Prop Firm</label>
                <select
                  value={firm}
                  onChange={e => setFirm(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800/50 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-gray-600"
                >
                  <option value="">Select firm...</option>
                  {PROP_FIRMS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Account ID</label>
                <input
                  type="text" value={accountId} onChange={e => setAccountId(e.target.value)}
                  placeholder="Enter account ID"
                  className="w-full bg-gray-900/60 border border-gray-800/50 text-white text-sm rounded-lg px-3 py-2.5 placeholder-gray-600 focus:outline-none focus:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">API Key</label>
                <input
                  type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter API key"
                  className="w-full bg-gray-900/60 border border-gray-800/50 text-white text-sm rounded-lg px-3 py-2.5 placeholder-gray-600 focus:outline-none focus:border-gray-600"
                />
              </div>
              <button
                onClick={handleConnect}
                disabled={!firm || !accountId || !apiKey}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
