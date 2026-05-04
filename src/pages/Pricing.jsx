import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, X, Zap, Shield, Crown, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";
import { useLicense } from "../lib/LicenseContext";
import { TIERS } from "../lib/tiers";

const PLANS = [
  {
    tierKey: "free",
    icon: Zap,
    badge: null,
    description: "Try Datrena. Live Binance data, one symbol, basic footprint.",
    features: [
      { label: "Footprint chart on BTC/USDT", included: true },
      { label: "Live Binance level-2 data", included: true },
      { label: "5 AI quant messages/day", included: true },
      { label: "1m / 5m / 15m / 1h / D timeframes", included: true },
      { label: "Multi-symbol charting", included: false },
      { label: "MBO depth heatmap", included: false },
      { label: "Iceberg / queue / pull-rate detection", included: false },
      { label: "Backtesting", included: false },
      { label: "Rithmic / CQG support", included: false },
    ],
  },
  {
    tierKey: "pro",
    icon: Shield,
    badge: "Most Popular",
    description: "Every Binance pair, more overlays, real backtesting.",
    features: [
      { label: "Everything in Free", included: true },
      { label: "All Binance trading pairs", included: true },
      { label: "All sub-hour timeframes", included: true },
      { label: "MBO depth heatmap + resting orders", included: true },
      { label: "100 AI quant messages/day", included: true },
      { label: "Algorithmic backtesting", included: true },
      { label: "30-day chart history", included: true },
      { label: "Iceberg / queue / pull-rate detection", included: false },
      { label: "Rithmic / CQG support", included: false },
    ],
  },
  {
    tierKey: "elite",
    icon: Crown,
    badge: "Pro Trader",
    description: "Every premium overlay, every feed, unlimited everything.",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "All MBO overlays — iceberg, queue, pull-rate, tracking", included: true },
      { label: "Weekly + monthly timeframes", included: true },
      { label: "Unlimited AI quant messages", included: true },
      { label: "365-day chart history", included: true },
      { label: "Rithmic / CQG / dxFeed integration", included: true },
      { label: "Priority support", included: true },
    ],
  },
];

export default function Pricing() {
  const { email, tierKey } = useLicense();
  const [searchParams] = useSearchParams();
  const [loadingTier, setLoadingTier] = useState(null);
  const [error, setError] = useState("");

  // Show success banner when returning from Stripe Checkout
  const checkoutResult = searchParams.get("checkout");
  const purchasedTier = searchParams.get("tier");

  // During beta, every plan CTA routes to the waitlist — no Stripe checkout
  // is exposed publicly until the platform launches.
  const handleSubscribe = (_targetTier) => {
    window.location.href = "/Waitlist";
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <LandingNav activePage="/Pricing" />

      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12">
        {checkoutResult === "success" && (
          <div className="max-w-2xl mx-auto mb-8 bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-sm font-semibold text-emerald-300">
                You're now on {TIERS[purchasedTier]?.name || "Pro"}
              </div>
              <div className="text-xs text-emerald-200/70">
                Open Datrena and your account will activate automatically.
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-tight mb-2">Simple pricing</h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Free download. Free tier. Upgrade only when you need pro features. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const tierDef = TIERS[plan.tierKey];
            const isCurrent = tierKey === plan.tierKey;
            const isLoading = loadingTier === plan.tierKey;

            return (
              <Card
                key={plan.tierKey}
                className={`relative bg-gray-900/40 border-gray-800/40 flex flex-col transition-all ${
                  isCurrent ? "border-emerald-700/50" : ""
                }`}
              >
                {plan.badge && !isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge className="text-[10px] bg-gray-800 text-gray-300 border-none">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge className="text-[10px] bg-emerald-900 text-emerald-200 border-none">
                      Your plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-6 pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-800/60">
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <CardTitle className="text-[15px]">{tierDef.name}</CardTitle>
                      <CardDescription className="text-xs">{plan.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 flex-1">
                  <div className="mb-5">
                    <span className="text-2xl font-bold">{tierDef.priceLabel}</span>
                    {tierDef.interval && <span className="text-sm text-gray-500">/{tierDef.interval}</span>}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        {f.included
                          ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          : <X className="w-3.5 h-3.5 text-gray-700 shrink-0 mt-0.5" />}
                        <span className={f.included ? "text-gray-300" : "text-gray-600"}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button
                    onClick={() => handleSubscribe(plan.tierKey)}
                    asChild
                    className={`w-full text-sm rounded-lg ${
                      plan.badge
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-zinc-900 text-zinc-300 border border-zinc-700 hover:bg-zinc-800"
                    }`}
                  >
                    <Link to="/Waitlist">Join Waitlist</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {error && (
          <div className="text-center mt-6 text-xs text-red-400">{error}</div>
        )}

        <div className="text-center mt-10 space-y-1">
          <p className="text-xs text-amber-500/80">
            Datrena is in private beta. Pricing is locked in for waitlist members at
            launch — join now to secure founder rates.
          </p>
          <p className="text-xs text-gray-600">
            Software is licensed separately from market data. Bring your own feed
            (Binance, Rithmic, CQG, dxFeed, IQFeed).
          </p>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
