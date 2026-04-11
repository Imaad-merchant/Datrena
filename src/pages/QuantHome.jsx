import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MainNav from "../components/navigation/MainNav";
import { Database, TrendingUp, Lightbulb, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function QuantHome() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const layers = [
    {
      name: "DATA LAYER", icon: Database, color: "#3B82F6", page: "DataLayer", status: "LIVE",
      description: "Real-time MBO Level 3 order flow, footprint charts, DOM heatmaps",
      tools: ["Footprint", "DOM Heatmap", "Iceberg", "Delta/Volume", "Pull Rate"]
    },
    {
      name: "ANALYSIS LAYER", icon: TrendingUp, color: "#8B5CF6", page: "AnalysisLayer", status: "BETA",
      description: "AI-driven volatility charting, combinatorics, statistical analysis",
      tools: ["Volatility", "Combinatorics", "AI Analysis"]
    },
    {
      name: "INSIGHT LAYER", icon: Lightbulb, color: "#F59E0B", page: "InsightLayer", status: "DEV",
      description: "Prop firm tracking, P&L analytics, drawdown monitoring",
      tools: ["P&L", "Win Rate", "Drawdown", "Calendar"]
    },
    {
      name: "VALIDATION LAYER", icon: CheckCircle, color: "#10B981", page: "ValidationLayer", status: "DEV",
      description: "Strategy backtesting, walk-forward analysis, Monte Carlo simulation",
      tools: ["Backtesting", "Walk-Forward", "Monte Carlo", "Risk Metrics"]
    }
  ];

  return (
    <div className="min-h-screen bg-background pl-16">
      <MainNav />

      {/* Status Bar */}
      <div className="border-b border-border bg-card px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-dt-green text-[11px] font-bold tracking-wider">DATRENA</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-muted-foreground text-[10px] tracking-wider">SYSTEM STATUS</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-dt-green animate-pulse-green" />
            <span className="text-dt-green text-[9px] tracking-wider">CONNECTED</span>
          </div>
          <span className="text-muted-foreground text-[10px] tabular-nums">
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-wide mb-1">WORKSPACE</h1>
          <p className="text-muted-foreground text-[11px]">
            Select a layer to begin. All modules share a unified data pipeline.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {layers.map((layer) => {
            const Icon = layer.icon;
            return (
              <Card
                key={layer.page}
                className="rounded-none hover:border-muted-foreground/30 transition-all cursor-pointer group"
                onClick={() => navigate(createPageUrl(layer.page))}
              >
                <CardHeader className="p-5 pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: layer.color + "12" }}>
                        <Icon className="w-4 h-4" style={{ color: layer.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-[13px]">{layer.name}</CardTitle>
                        <Badge variant="outline" className="text-[8px] tracking-widest rounded-none mt-1 border-none px-1.5 py-0"
                          style={{ color: layer.color, backgroundColor: layer.color + "15" }}>
                          {layer.status}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-border group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-3">
                  <CardDescription className="text-[10px] leading-relaxed mb-3">{layer.description}</CardDescription>
                  <div className="flex flex-wrap gap-1">
                    {layer.tools.map((tool, i) => (
                      <Badge key={i} variant="outline" className="text-[8px] text-muted-foreground rounded-none px-1.5 py-0">{tool}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Launch */}
        <Card className="mt-8 rounded-none">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-muted-foreground text-[11px]">QUICK LAUNCH</span>
              <p className="text-muted-foreground/60 text-[9px] mt-0.5">Jump directly into the Data Layer footprint chart</p>
            </div>
            <Button
              className="bg-dt-blue text-background hover:bg-dt-blue/90 text-[11px] tracking-wide gap-2 rounded-none"
              onClick={() => navigate(createPageUrl("DataLayer"))}
            >
              OPEN CHART <ArrowRight className="w-3 h-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}