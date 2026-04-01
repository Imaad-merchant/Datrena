import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Check, X, Zap, Shield, Crown, ArrowRight } from "lucide-react";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";

const PLANS = [
  {
    name: "Free",
    price: 0,
    icon: Zap,
    color: "#6b7280",
    borderClass: "border-gray-700",
    badge: null,
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
    name: "Trader",
    price: 20,
    icon: Shield,
    color: "#3b82f6",
    borderClass: "border-blue-500/40",
    badge: "Most Popular",
    description: "Full analytical suite for active traders.",
    features: [
      { label: "Real-Time Candlestick Chart", included: true },
      { label: "Footprint Chart (DOM)", included: true },
      { label: "Delta / Volume Analysis", included: true },
      { label: "All Timeframes (1m–30m)", included: true },
      { label: "Up to 4 Instruments", included: true },
      { label: "AI Quant Chat", included: true },
      { label: "Volatility Charting", included: true},
      { label: "Prop Firm Tracking", included: false },
      { label: "Backtesting", included: false },
    ],
  },
  {
    name: "Pro",
    price: 40,
    icon: Crown,
    color: "#f59e0b",
    borderClass: "border-yellow-500/40",
    badge: "Full Access",
    description: "Everything, including upcoming features.",
    features: [
      { label: "Real-Time Candlestick Chart", included: true },
      { label: "Footprint Chart (DOM)", included: true },
      { label: "Delta / Volume Analysis", included: true },
      { label: "All Timeframes (1m–30m)", included: true },
      { label: "Unlimited Instruments", included: true },
      { label: "AI Quant Chat", included: true },
      { label: "Volatility Charting", included: true},
      { label: "Prop Firm Tracking", included: true},
      { label: "Backtesting & Validation", included: true},
    ],
  },
];

export default function Pricing() {
  const [selected, setSelected] = useState("Trader");

  return (
    <div className="bg-black min-h-screen text-white">
      <LandingNav activePage="/Pricing" />

      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">Simple, Transparent Pricing</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Start free. Upgrade when you need real-time data and advanced tools. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selected === plan.name;
            return (
              <div
                key={plan.name}
                className={`relative bg-gray-900/60 border rounded-xl p-6 flex flex-col transition-all ${plan.borderClass} ${
                  isSelected ? "ring-1 ring-white/10 scale-[1.02]" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className="text-[10px] font-semibold px-3 py-1 rounded-full border"
                      style={{ color: plan.color, borderColor: plan.color + "40", backgroundColor: plan.color + "10" }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{plan.name}</h2>
                    <p className="text-[11px] text-gray-500">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-white">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                  {plan.price > 0 && <span className="text-sm text-gray-500">/mo</span>}
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {f.included
                        ? <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        : <X className="w-3.5 h-3.5 text-gray-700 shrink-0" />}
                      <span className={f.included ? "text-gray-300" : "text-gray-600"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    setSelected(plan.name);
                    base44.auth.redirectToLogin("/QuantHome");
                  }}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                    isSelected
                      ? "bg-white text-black border-white"
                      : `bg-transparent border-gray-700 hover:bg-gray-800`
                  }`}
                  style={!isSelected ? { color: plan.color } : {}}
                >
                  {plan.price === 0 ? "Get Started" : `Get ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10 space-y-1">
          <p className="text-[11px] text-gray-600">All paid plans billed monthly. Cancel anytime.</p>
          <p className="text-[11px] text-gray-600">Exchange data fees (CME, CBOT, NYMEX, COMEX) may apply separately via Rithmic.</p>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
