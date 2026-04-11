import React, { useState } from "react";
import MainNav from "../components/navigation/MainNav";
import {
  Plus, FolderOpen, ArrowRight, Play, Trash2,
  BarChart3, SlidersHorizontal, TrendingUp, Shuffle,
  Shield, Cpu, Clock, FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const CAPABILITIES = [
  { icon: Cpu, title: "Train ML Models", description: "scikit-learn, XGBoost, TensorFlow on market data" },
  { icon: SlidersHorizontal, title: "Parameter Optimization", description: "Thousands of iterations with heatmap visualization" },
  { icon: TrendingUp, title: "Factor Analysis", description: "Quantify feature importance and alpha signals" },
  { icon: Shuffle, title: "Monte Carlo Simulation", description: "Probability distributions and worst-case scenarios" },
  { icon: Shield, title: "Risk Metrics", description: "Sharpe, Sortino, Calmar, and drawdown analysis" },
  { icon: BarChart3, title: "Data Explorer", description: "Interactive exploration on financial and alternative data" },
];

const INITIAL_PROJECTS = [
  { id: 1, name: "ES Volatility Regime Study", status: "Completed", trades: 342, winRate: "68%", sharpe: 1.82, lastRun: "2 hours ago" },
  { id: 2, name: "NQ OFI Feature Analysis", status: "Completed", trades: 187, winRate: "63%", sharpe: 1.54, lastRun: "Yesterday" },
  { id: 3, name: "CL Mean-Reversion Model", status: "Running", trades: null, winRate: null, sharpe: null, lastRun: "Now" },
];

export default function ValidationLayer() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  const deleteProject = (id) => setProjects(prev => prev.filter(b => b.id !== id));

  return (
    <div className="min-h-screen bg-black pl-16 text-white">
      <MainNav />

      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Research</h1>
          <p className="text-gray-400 text-sm max-w-2xl">
            Cloud-based research terminals with terabytes of financial and alternative data. Train ML models, explore data, and run parameter optimization on fast cloud cores.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Left — Actions & Capabilities */}
          <div className="col-span-1 space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Start</h2>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-gray-300 h-9 rounded-lg px-3 hover:bg-gray-800">
                  <Plus className="w-4 h-4" /> New Research
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-gray-300 h-9 rounded-lg px-3 hover:bg-gray-800">
                  <FileCode className="w-4 h-4" /> Import Strategy
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-gray-300 h-9 rounded-lg px-3 hover:bg-gray-800">
                  <FolderOpen className="w-4 h-4" /> Open Project
                </Button>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Capabilities</h2>
              <div className="space-y-3">
                {CAPABILITIES.map(cap => {
                  const Icon = cap.icon;
                  return (
                    <div key={cap.title} className="flex items-start gap-2.5 px-1">
                      <Icon className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-300 font-medium">{cap.title}</p>
                        <p className="text-[11px] text-gray-600">{cap.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Recent Projects */}
          <div className="col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Recent Projects</h2>
                <span className="text-xs text-gray-600">{projects.length} total</span>
              </div>

              <div className="space-y-3">
                {projects.map(bt => (
                  <Card key={bt.id} className="bg-gray-900/40 border-gray-800/40 hover:border-gray-700/60 transition-all group cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-medium text-white">{bt.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-[10px] border-none px-2 py-0.5 ${
                              bt.status === "Running"
                                ? "bg-gray-800 text-gray-300"
                                : "bg-gray-800/60 text-gray-500"
                            }`}>
                              {bt.status}
                            </Badge>
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {bt.lastRun}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="w-7 h-7 hover:text-white text-gray-600 rounded-lg" title="Run">
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 hover:text-white text-gray-600 rounded-lg" title="Delete" onClick={() => deleteProject(bt.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {bt.trades && (
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-800/40">
                          <div>
                            <p className="text-[11px] text-gray-600">Trades</p>
                            <p className="text-sm text-white tabular-nums">{bt.trades}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-600">Win Rate</p>
                            <p className="text-sm text-white tabular-nums">{bt.winRate}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-600">Sharpe</p>
                            <p className="text-sm text-white tabular-nums">{bt.sharpe}</p>
                          </div>
                        </div>
                      )}

                      {bt.status === "Running" && (
                        <div className="mt-3 pt-3 border-t border-gray-800/40">
                          <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <div className="bg-gray-500 h-1.5 rounded-full animate-pulse" style={{ width: "45%" }} />
                          </div>
                          <p className="text-[11px] text-gray-600 mt-1">Processing... 45% complete</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Start */}
            <Card className="bg-gray-900/40 border-gray-800/40">
              <CardContent className="p-5 text-center">
                <p className="text-gray-400 text-sm mb-3">
                  Explore data, train models, and optimize parameters in the cloud.
                </p>
                <Button className="bg-white text-black hover:bg-gray-200 text-sm gap-2 rounded-lg">
                  New Notebook <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
