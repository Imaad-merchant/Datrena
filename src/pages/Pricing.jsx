import React from "react";
import { Link } from "react-router-dom";
import { Check, Zap, Shield, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";

// Beta-mode pricing — every CTA routes to the waitlist. Real billing flips
// on at launch.

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "Free",
    icon: Zap,
    badge: null,
    description: "Get started with live Binance order flow on BTC/USDT.",
    features: [
      "Live Binance order flow",
      "Footprint chart with bid/ask volume",
      "Volume profile + POC",
      "All standard timeframes",
      "Order flow imbalance detection",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "$29",
    interval: "month",
    icon: Shield,
    badge: "Most Popular",
    description: "Every Binance pair, MBO overlays, deeper history.",
    features: [
      "Everything in Free",
      "All Binance trading pairs",
      "MBO depth heatmap + resting orders",
      "Algorithmic backtesting",
      "30-day chart history",
      "Pro AI quant chat (100 msgs/day)",
    ],
  },
  {
    key: "elite",
    name: "Elite",
    price: "$99",
    interval: "month",
    icon: Crown,
    badge: "Pro Trader",
    description: "Every premium overlay, every feed, unlimited everything.",
    features: [
      "Everything in Pro",
      "Iceberg, queue, pull-rate detection",
      "Order tracking overlay",
      "Rithmic / CQG / dxFeed support",
      "365-day chart history",
      "Unlimited AI quant chat",
      "Priority support",
    ],
  },
];

export default function Pricing() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <LandingNav activePage="/Pricing" />

      <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-900/40 text-xs font-medium text-amber-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Locked-in founder pricing for waitlist members
          </div>
          <h1 className="text-3xl font-light tracking-tight mb-2">Simple pricing</h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Start free. Upgrade when you need every market and premium overlays. Cancel
            anytime once paid plans launch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.key}
                className="relative bg-gray-900/40 border-gray-800/40 flex flex-col"
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
                    <span className="text-2xl font-bold">{plan.price}</span>
                    {plan.interval && <span className="text-sm text-gray-500">/{plan.interval}</span>}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-gray-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button
                    asChild
                    className={`w-full text-sm rounded-lg ${
                      plan.badge
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-zinc-900 text-zinc-300 border border-zinc-700 hover:bg-zinc-800"
                    }`}
                  >
                    <Link to="/Waitlist" className="flex items-center justify-center gap-1.5">
                      Join Waitlist <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-10 space-y-1">
          <p className="text-xs text-amber-500/80">
            Datrena is in private beta. Pricing is locked in for waitlist members at launch.
          </p>
          <p className="text-xs text-gray-600">
            Software is licensed separately from market data. Bring your own feed (Binance,
            Rithmic, CQG, dxFeed, IQFeed).
          </p>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
