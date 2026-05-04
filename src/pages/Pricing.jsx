import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Zap, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";

const PLANS = [
  {
    name: "Free", price: 0, icon: Zap, badge: null,
    description: "Core tools with Level 2 data access.",
    features: [
      { label: "Candlestick Chart (Level 2 data)", included: true },
      { label: "Prop Firm Tracking", included: true },
      { label: "Algorithmic Backtesting", included: true },
      { label: "AI Quant Chat (limited messages)", included: true },
      { label: "1 Instrument", included: true },
      { label: "Footprint Chart (Level 3)", included: false },
      { label: "Delta / Volume Analysis", included: false },
      { label: "Unlimited AI Messages", included: false },
      { label: "Multiple Instruments", included: false },
    ],
  },
  {
    name: "Trader", price: 20, icon: Shield, badge: "Most Popular",
    description: "Full analytical suite for active traders.",
    features: [
      { label: "Real-Time Candlestick Chart", included: true },
      { label: "Footprint Chart (DOM)", included: true },
      { label: "Delta / Volume Analysis", included: true },
      { label: "All Timeframes (1m-30m)", included: true },
      { label: "Up to 4 Instruments", included: true },
      { label: "AI Quant Chat", included: true },
      { label: "Volatility Charting", included: true },
      { label: "Prop Firm Tracking", included: false },
      { label: "Backtesting", included: false },
    ],
  },
  {
    name: "Pro", price: 40, icon: Crown, badge: "Full Access",
    description: "Everything, including upcoming features.",
    features: [
      { label: "Real-Time Candlestick Chart", included: true },
      { label: "Footprint Chart (DOM)", included: true },
      { label: "Delta / Volume Analysis", included: true },
      { label: "All Timeframes (1m-30m)", included: true },
      { label: "Unlimited Instruments", included: true },
      { label: "AI Quant Chat", included: true },
      { label: "Volatility Charting", included: true },
      { label: "Prop Firm Tracking", included: true },
      { label: "Backtesting & Validation", included: true },
    ],
  },
];

export default function Pricing() {
  const [selected, setSelected] = useState("Trader");
  const handleAction = (plan) => {
    setSelected(plan.name);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <LandingNav activePage="/Pricing" />

      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2">Pricing</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Start free. Upgrade when you need real-time data and advanced tools. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selected === plan.name;
            return (
              <Card
                key={plan.name}
                className={`relative bg-gray-900/40 border-gray-800/40 flex flex-col transition-all ${
                  isSelected ? "border-gray-600" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge className="text-[10px] bg-gray-800 text-gray-300 border-none">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-6 pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-800/60">
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <CardTitle className="text-[15px]">{plan.name}</CardTitle>
                      <CardDescription className="text-xs">{plan.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 flex-1">
                  <div className="mb-5">
                    <span className="text-2xl font-bold">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                    {plan.price > 0 && <span className="text-sm text-gray-500">/mo</span>}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        {f.included
                          ? <Check className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          : <X className="w-3.5 h-3.5 text-gray-700 shrink-0" />}
                        <span className={f.included ? "text-gray-300" : "text-gray-600"}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button
                    asChild
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full text-sm rounded-lg ${
                      isSelected
                        ? "bg-white text-black hover:bg-gray-200"
                        : "text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white"
                    }`}
                  >
                    <Link to="/Download" onClick={() => handleAction(plan)}>
                      {plan.price === 0 ? "Download Free" : `Get ${plan.name}`}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8 space-y-1">
          <p className="text-xs text-gray-600">All paid plans billed monthly. Cancel anytime.</p>
          <p className="text-xs text-gray-600">Exchange data fees (CME, CBOT, NYMEX, COMEX) may apply separately via Rithmic.</p>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
