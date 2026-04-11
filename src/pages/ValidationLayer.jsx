import React, { useState } from "react";
import MainNav from "../components/navigation/MainNav";
import {
  Plus, FolderOpen, ArrowRight, Building2, BookOpen,
  Database, BarChart2, Radio, HeadphonesIcon, Trash2, Play,
  Trophy, GraduationCap, StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const SECTIONS = [
  { name: "Organization", icon: Building2 },
  { name: "Learning", icon: BookOpen },
  { name: "Datasets", icon: Database },
  { name: "Strategies", icon: BarChart2 },
  { name: "Live", icon: Radio },
  { name: "Support", icon: HeadphonesIcon },
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
    <div className="min-h-screen bg-background pl-16 text-foreground">
      <MainNav />

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="col-span-1 space-y-6">
          {/* Start */}
          <div>
            <h2 className="text-[9px] font-semibold text-muted-foreground tracking-widest mb-3">START</h2>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-2 text-[11px] text-dt-blue h-8 rounded-none px-2">
                <Plus className="w-3 h-3" /> New Project
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 text-[11px] text-dt-blue h-8 rounded-none px-2">
                <FolderOpen className="w-3 h-3" /> Open Project
              </Button>
            </div>
          </div>

          <Separator />

          {/* Nav */}
          <div>
            <h2 className="text-[9px] font-semibold text-muted-foreground tracking-widest mb-3">NAVIGATION</h2>
            <div className="space-y-0.5">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.name}
                    variant="ghost"
                    onClick={() => setActiveSection(activeSection === section.name ? null : section.name)}
                    className={`w-full justify-start gap-2.5 text-[11px] text-muted-foreground h-9 rounded-none px-2.5 ${
                      activeSection === section.name ? "bg-secondary" : ""
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span className="flex-1 text-left">{section.name}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-border" />
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Recent Projects */}
          <div>
            <h2 className="text-[9px] font-semibold text-muted-foreground tracking-widest mb-3">RECENT PROJECTS</h2>
            <div className="space-y-1">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center gap-2 group px-2 py-1.5 hover:bg-secondary transition-all">
                  <div className="w-1.5 h-1.5 bg-dt-blue shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground truncate">{project.name}</p>
                    <p className="text-[9px] text-border">{project.lastOpened}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:text-dt-green text-border rounded-none" title="Resume">
                      <Play className="w-2.5 h-2.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 hover:text-dt-red text-border rounded-none" title="Delete" onClick={() => deleteProject(project.id)}>
                      <Trash2 className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-2 space-y-6">

          {/* Top Strategies */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-3 h-3 text-dt-amber" />
              <h2 className="text-[10px] font-semibold tracking-wider">TOP PUBLISHED STRATEGIES</h2>
            </div>
            <Card className="rounded-none">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-[8px] tracking-widest w-12">#</TableHead>
                    <TableHead className="text-[8px] tracking-widest">STRATEGY</TableHead>
                    <TableHead className="text-[8px] tracking-widest">WIN RATE</TableHead>
                    <TableHead className="text-[8px] tracking-widest">PF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TOP_STRATEGIES.map((s) => (
                    <TableRow key={s.rank} className="border-border/50 cursor-pointer">
                      <TableCell className="text-[11px] text-border tabular-nums">#{s.rank}</TableCell>
                      <TableCell>
                        <p className="text-[11px] text-foreground">{s.name}</p>
                        <p className="text-[9px] text-border">by {s.author}</p>
                      </TableCell>
                      <TableCell className="text-[11px] text-dt-green">{s.winRate}</TableCell>
                      <TableCell className="text-[11px] text-dt-blue">{s.pf}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Courses */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-3 h-3 text-dt-purple" />
              <h2 className="text-[10px] font-semibold tracking-wider">LEARNING</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {COURSES.map((c, i) => (
                <Card key={i} className="rounded-none hover:border-muted-foreground/30 transition-all cursor-pointer group">
                  <CardContent className="p-3.5">
                    <p className="text-[11px] font-medium mb-1">{c.title}</p>
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                      <span>{c.lessons} lessons</span>
                      <Badge variant="secondary" className="text-[8px] rounded-none px-1.5 py-0">{c.level}</Badge>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] text-dt-blue opacity-0 group-hover:opacity-100 transition-opacity">
                      Start <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-3 h-3 text-dt-amber" />
              <h2 className="text-[10px] font-semibold tracking-wider">NOTES</h2>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Jot down ideas, observations, or reminders..."
              className="bg-card text-[11px] text-muted-foreground placeholder:text-border rounded-none resize-none"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
}