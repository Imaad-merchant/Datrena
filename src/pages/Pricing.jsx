import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, X, Zap, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";

const PLANS = [
  {
    name: "Free", price: 0, icon: Zap, color: "#64748B", badge: null,
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
    name: "Trader", price: 20, icon: Shield, color: "#3B82F6", badge: "MOST POPULAR",
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
    name: "Pro", price: 40, icon: Crown, color: "#F59E0B", badge: "FULL ACCESS",
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
  const [showToast, setShowToast] = useState(false);

  const handleAction = (plan) => {
    setSelected(plan.name);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <LandingNav activePage="/Pricing" />

      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2 tracking-wide">PRICING</h1>
          <p className="text-muted-foreground text-[11px] max-w-md mx-auto">
            Start free. Upgrade when you need real-time data and advanced tools. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selected === plan.name;
            return (
              <Card
                key={plan.name}
                className={`relative rounded-none flex flex-col transition-all ${
                  isSelected ? "border-muted-foreground/40" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge variant="outline" className="text-[8px] tracking-widest rounded-none"
                      style={{ color: plan.color, borderColor: plan.color + "40", backgroundColor: plan.color + "10" }}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-5 pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: plan.color + "12" }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: plan.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-[13px]">{plan.name}</CardTitle>
                      <CardDescription className="text-[9px]">{plan.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 flex-1">
                  <div className="mb-4">
                    <span className="text-2xl font-bold">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                    {plan.price > 0 && <span className="text-[10px] text-muted-foreground">/mo</span>}
                  </div>

                  <ul className="space-y-1.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px]">
                        {f.included
                          ? <Check className="w-3 h-3 text-dt-green shrink-0" />
                          : <X className="w-3 h-3 text-border shrink-0" />}
                        <span className={f.included ? "text-muted-foreground" : "text-border"}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  <Button
                    onClick={() => handleAction(plan)}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full rounded-none text-[11px] tracking-wide"
                    style={!isSelected ? { color: plan.color } : {}}
                  >
                    {plan.price === 0 ? "GET STARTED" : `GET ${plan.name.toUpperCase()}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8 space-y-1">
          <p className="text-[9px] text-border">All paid plans billed monthly. Cancel anytime.</p>
          <p className="text-[9px] text-border">Exchange data fees (CME, CBOT, NYMEX, COMEX) may apply separately via Rithmic.</p>
        </div>
      </div>

      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-card border border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="text-dt-red mr-2">ACCESS DENIED</span>
          Administrator access only.
        </div>
      )}

      <LandingFooter />
    </div>
  );
}