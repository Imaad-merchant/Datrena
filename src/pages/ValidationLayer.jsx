import React, { useState } from "react";
import MainNav from "../components/navigation/MainNav";
import {
  Plus, FolderOpen, ArrowRight, Building2, BookOpen,
  Database, BarChart2, Radio, HeadphonesIcon, Trash2, Play,
  Trophy, GraduationCap, StickyNote,
} from "lucide-react";

const SECTIONS = [
  { name: "Organization", icon: Building2, description: "Manage your workspace, team settings, and account preferences." },
  { name: "Learning", icon: BookOpen, description: "Access courses, tutorials, and quant trading resources." },
  { name: "Datasets", icon: Database, description: "Browse and manage your imported market datasets." },
  { name: "Strategies", icon: BarChart2, description: "Build, manage, and deploy trading strategies." },
  { name: "Live", icon: Radio, description: "Monitor live trading sessions and real-time performance." },
  { name: "Support", icon: HeadphonesIcon, description: "Get help, submit tickets, and access documentation." },
];

const TOP_STRATEGIES = [
  { rank: 1, name: "CL Supply Zone Reversal", author: "nx_trader", winRate: "72%", pf: 2.4 },
  { rank: 2, name: "MNQ Imbalance Hunter", author: "edgelab", winRate: "70%", pf: 2.2 },
  { rank: 3, name: "ES Opening Drive Fade", author: "vortex_q", winRate: "68%", pf: 2.1 },
  { rank: 4, name: "NQ Delta Divergence Short", author: "zeroslip", winRate: "63%", pf: 1.9 },
  { rank: 5, name: "NQ VWAP Reclaim Long", author: "darkpool7", winRate: "61%", pf: 1.8 },
  { rank: 6, name: "RTY Liquidity Sweep", author: "m_quant", winRate: "58%", pf: 1.7 },
  { rank: 7, name: "ES Gap Fill Scalp", author: "qflo", winRate: "55%", pf: 1.6 },
];

const COURSES = [
  { title: "Intro to Quantitative Trading", lessons: 12, level: "Beginner" },
  { title: "Order Flow & Footprint Charts", lessons: 8, level: "Intermediate" },
  { title: "Statistical Edge & Expectancy", lessons: 10, level: "Intermediate" },
  { title: "Backtesting Methodology", lessons: 7, level: "Advanced" },
];

const INITIAL_PROJECTS = [
  { id: 1, name: "ES Volatility Study", section: "Strategies", lastOpened: "2 hours ago" },
  { id: 2, name: "NQ Footprint Analysis", section: "Datasets", lastOpened: "Yesterday" },
  { id: 3, name: "Trend Breakout System", section: "Strategies", lastOpened: "3 days ago" },
];

export default function ValidationLayer() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [note, setNote] = useState("");
  const [activeSection, setActiveSection] = useState(null);

  const deleteProject = (id) => setProjects(prev => prev.filter(p => p.id !== id));

  return (
    <div className="min-h-screen bg-black pl-16 text-white">
      <MainNav />

      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="col-span-1 space-y-8">
          {/* Start */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Start</h2>
            <div className="space-y-3">
              <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="w-4 h-4" />
                New Project
              </button>
              <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                <FolderOpen className="w-4 h-4" />
                Open Project
              </button>
            </div>
          </div>

          {/* Nav */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Navigation</h2>
            <div className="space-y-1">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.name}
                    onClick={() => setActiveSection(activeSection === section.name ? null : section.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-900 transition-all text-left group ${
                      activeSection === section.name ? "bg-gray-900" : ""
                    }`}
                  >
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{section.name}</span>
                    <ArrowRight className="w-3 h-3 text-gray-700 group-hover:text-gray-400 ml-auto transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Projects */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Recent Projects</h2>
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-gray-900 transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{project.name}</p>
                    <p className="text-xs text-gray-600">{project.lastOpened}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Resume" className="p-1 hover:text-green-400 text-gray-600 transition-colors">
                      <Play className="w-3 h-3" />
                    </button>
                    <button title="Delete" onClick={() => deleteProject(project.id)} className="p-1 hover:text-red-400 text-gray-600 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-2 space-y-8">

          {/* Top Strategies */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h2 className="text-sm font-semibold text-white">Top Published Strategies</h2>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 text-xs text-gray-500 uppercase tracking-wider px-4 py-2 border-b border-gray-800">
                <span>#</span>
                <span className="col-span-2">Strategy</span>
                <span>Win Rate</span>
                <span>Profit Factor</span>
              </div>
              {TOP_STRATEGIES.map((s, i) => (
                <div key={i} className="grid grid-cols-5 px-4 py-3 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/40 transition-colors cursor-pointer">
                  <span className="text-sm text-gray-500 self-center font-mono">#{s.rank}</span>
                  <div className="col-span-2">
                    <p className="text-sm text-white">{s.name}</p>
                    <p className="text-xs text-gray-500">by {s.author}</p>
                  </div>
                  <span className="text-sm text-green-400 self-center">{s.winRate}</span>
                  <span className="text-sm text-blue-400 self-center">{s.pf}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Learning</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {COURSES.map((c, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-all cursor-pointer group">
                  <p className="text-sm text-white font-medium mb-1">{c.title}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{c.lessons} lessons</span>
                    <span className="px-2 py-0.5 bg-gray-800 rounded text-gray-400">{c.level}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Start <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <StickyNote className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Notes</h2>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Jot down ideas, observations, or reminders..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-gray-600 transition-colors"
              rows={4}
            />
          </div>

        </div>

      </div>
    </div>
  );
}
