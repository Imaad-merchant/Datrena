import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MainNav from "../components/navigation/MainNav";
import { Database, Bot, BarChart3, FlaskConical, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function QuantHome() {
  const navigate = useNavigate();

  const products = [
    {
      name: "Data", icon: Database, page: "DataLayer", status: "Live",
      description: "Real-time MBO Level 3 order flow visualization. Footprint charts, DOM heatmaps, iceberg detection, and pull rate analysis powered by Rithmic.",
      tools: ["Footprint", "DOM Heatmap", "Iceberg", "Delta/Volume", "Pull Rate", "Order Tracking"]
    },
    {
      name: "AI Analysis", icon: Bot, page: "AnalysisLayer", status: "Beta",
      description: "AI-powered quantitative analysis on Rithmic market data. Ask about volatility, order flow, strategies, and more.",
      tools: ["AI Chat", "Volatility Analysis", "Order Flow", "Strategy Ideas"]
    },
    {
      name: "Backtesting", icon: BarChart3, page: "Backtesting", status: "Dev",
      description: "Chart-based strategy backtesting with the same footprint chart as Data. Replay historical data, test strategies, and analyze results.",
      tools: ["Chart Replay", "Strategy Runner", "Trade Log", "Performance Metrics"]
    },
    {
      name: "Research", icon: FlaskConical, page: "ValidationLayer", status: "Dev",
      description: "Cloud-based research terminals with terabytes of financial and alternative data. Train ML models, run parameter optimization, and explore data.",
      tools: ["ML Models", "Parameter Optimization", "Monte Carlo", "Data Explorer", "Risk Metrics"]
    }
  ];

  return (
    <div className="min-h-screen bg-black pl-16">
      <MainNav />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white mb-2">Workspace</h1>
          <p className="text-gray-400 text-sm">
            From live market data to validated strategies. Select a product to begin.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <Card
                key={product.page}
                className="bg-gray-900/40 border-gray-800/40 hover:border-gray-700/60 transition-all cursor-pointer group"
                onClick={() => navigate(createPageUrl(product.page))}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-800/60">
                        <Icon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <CardTitle className="text-[15px]">{product.name}</CardTitle>
                        <Badge className="text-[10px] mt-1 bg-gray-800 text-gray-400 border-none">
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <CardDescription className="text-xs leading-relaxed mb-3">{product.description}</CardDescription>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tools.map((tool, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-800/60 border border-gray-700/40 text-gray-400">
                        {tool}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-gray-900/40 border-gray-800/40">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Quick Launch</p>
              <p className="text-gray-500 text-xs mt-0.5">Jump directly into the live footprint chart</p>
            </div>
            <Button
              className="bg-white text-black hover:bg-gray-200 text-sm gap-2 rounded-lg"
              onClick={() => navigate(createPageUrl("DataLayer"))}
            >
              Open Chart <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
