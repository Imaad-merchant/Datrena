import React from "react";
import {
  Database, BarChart2, Activity, Layers, Eye, Crosshair, Clock,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const TABS_DATA = [
  { key: "data", label: "Data", icon: Database },
];

const TAB_CONTENT = {
  data: {
    description: "Stream real-time MBO Level 3 data and visualize every order event in the exchange's matching engine. 7+ toggleable overlays built for professional futures and crypto traders.",
    features: [
      { icon: BarChart2, title: "Order Flow Footprint Chart", description: "Canvas-based footprint chart rendering bid/ask volume at every price level. Imbalance detection (3:1 ratio), Point of Control, session volume profile." },
      { icon: Layers, title: "DOM Depth Heatmap Overlay", description: "Real-time depth of market visualization overlaid on the chart background. Color-coded intensity shows resting liquidity concentration." },
      { icon: Eye, title: "Iceberg Order Detection", description: "Automatic detection of hidden iceberg orders that repeatedly replenish at the same price level. Diamond markers show estimated hidden size." },
      { icon: Crosshair, title: "Live Order Tracking", description: "Visualize every order event on the chart — adds, cancels, modifies, and fills." },
      { icon: Clock, title: "Pull Rate Analysis", description: "Track how often resting orders are pulled vs. filled. High rates indicate potential spoofing." },
      { icon: Activity, title: "Delta & Volume Analysis", description: "Per-candle delta, cumulative delta, and total volume summaries. See whether buyers or sellers are driving each move." },
    ],
  },
};

const EXCHANGES = [
  { name: "CME", instruments: "ES (S&P 500), NQ (Nasdaq 100), 6E, 6B" },
  { name: "CBOT", instruments: "YM (Dow), ZB (Bonds), ZN (Notes)" },
  { name: "NYMEX", instruments: "CL (Crude Oil), NG (Natural Gas)" },
  { name: "COMEX", instruments: "GC (Gold), SI (Silver)" },
];

export default function TradersSection() {
  return (
    <section className="bg-black border-t border-gray-800/60">
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-20">
        <div className="mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">Built for Quants</h2>
          <p className="text-gray-500 text-sm max-w-lg">
            From live order flow to validated strategies. Every tool is designed for quantitative research and algorithmic trading.
          </p>
        </div>

        <Tabs defaultValue="data">
          <TabsList className="bg-transparent border-b border-gray-800 rounded-none h-auto p-0 gap-0 w-full justify-start mb-8">
            {TABS_DATA.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium gap-2 text-gray-500 data-[state=active]:text-white"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(TAB_CONTENT).map(([key, content]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-2xl">{content.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.features.map((f, i) => {
                  const FIcon = f.icon;
                  return (
                    <Card key={i} className="bg-gray-900/40 border-gray-800/40 hover:border-gray-700/60 transition-colors">
                      <CardHeader className="p-5 pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800/60">
                            <FIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <CardTitle className="text-sm">{f.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 pt-3">
                        <CardDescription className="text-xs leading-relaxed">{f.description}</CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-16">
          <h3 className="text-white text-sm font-semibold mb-4">Supported Exchanges via Rithmic</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {EXCHANGES.map(ex => (
              <Card key={ex.name} className="bg-gray-900/60 border-gray-800/50">
                <CardContent className="px-4 py-3">
                  <span className="text-white text-sm font-semibold">{ex.name}</span>
                  <p className="text-gray-500 text-xs mt-1">{ex.instruments}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
