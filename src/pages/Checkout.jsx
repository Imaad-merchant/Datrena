import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Shield, Crown, Check, Lock, CreditCard } from "lucide-react";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";

const PLANS = {
  Trader: {
    name: "Trader",
    price: 20,
    icon: Shield,
    color: "#3b82f6",
    description: "Full analytical suite for active traders.",
    features: [
      "Real-Time Candlestick Chart",
      "Footprint Chart (DOM)",
      "Delta / Volume Analysis",
      "All Timeframes (1m–30m)",
      "Up to 4 Instruments",
      "AI Quant Chat",
      "Volatility Charting",
    ],
  },
  Pro: {
    name: "Pro",
    price: 40,
    icon: Crown,
    color: "#f59e0b",
    description: "Everything, including upcoming features.",
    features: [
      "Real-Time Candlestick Chart",
      "Footprint Chart (DOM)",
      "Delta / Volume Analysis",
      "All Timeframes (1m–30m)",
      "Unlimited Instruments",
      "AI Quant Chat",
      "Volatility Charting",
      "Prop Firm Tracking",
      "Backtesting & Validation",
    ],
  },
};

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const planKey = params.get("plan") || "Trader";
  const plan = PLANS[planKey] || PLANS.Trader;
  const Icon = plan.icon;

  const [form, setForm] = useState({ name: "", email: "", card: "", exp: "", cvc: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const fmt = (val, type) => {
    const d = val.replace(/\D/g, "");
    if (type === "card") return d.replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
    if (type === "exp") return d.length > 2 ? d.slice(0, 2) + " / " + d.slice(2, 4) : d;
    if (type === "cvc") return d.slice(0, 4);
    return val;
  };

  const handleChange = (field, value) => {
    if (field === "card" || field === "exp" || field === "cvc") value = fmt(value, field);
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.card || !form.exp || !form.cvc) {
      setError("Please fill in all fields.");
      return;
    }

    setProcessing(true);

    // TODO: Replace with real Stripe checkout session / payment intent
    // For now, simulate a brief processing delay
    setTimeout(() => {
      setProcessing(false);
      setError("Payment processing is not yet connected. Stripe integration coming soon.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <LandingNav activePage="/Pricing" />

      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-16 py-12 flex-1">
        {/* Back link */}
        <button
          onClick={() => navigate("/Pricing")}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pricing
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Left — Order summary */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>

            <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: plan.color + "15" }}>
                  <Icon className="w-5 h-5" style={{ color: plan.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{plan.name} Plan</h2>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-800/50 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-gray-400 text-sm">Monthly subscription</span>
                  <div>
                    <span className="text-2xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-gray-600">
              <p>Cancel anytime. No long-term commitment.</p>
              <p>Exchange data fees (CME, CBOT, NYMEX, COMEX) may apply separately via Rithmic.</p>
            </div>
          </div>

          {/* Right — Payment form */}
          <div>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" />
              Payment Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleChange("name", e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-gray-900/60 border border-gray-800/50 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-gray-900/60 border border-gray-800/50 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Card Number</label>
                <input
                  type="text"
                  value={form.card}
                  onChange={e => handleChange("card", e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="w-full bg-gray-900/60 border border-gray-800/50 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors font-mono tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Expiry</label>
                  <input
                    type="text"
                    value={form.exp}
                    onChange={e => handleChange("exp", e.target.value)}
                    placeholder="MM / YY"
                    maxLength={7}
                    className="w-full bg-gray-900/60 border border-gray-800/50 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">CVC</label>
                  <input
                    type="text"
                    value={form.cvc}
                    onChange={e => handleChange("cvc", e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full bg-gray-900/60 border border-gray-800/50 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors font-mono"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-white text-black font-bold py-3.5 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Pay ${plan.price}/mo
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-600 mt-2">
                <Lock className="w-3 h-3" />
                Secured with SSL encryption
              </div>
            </form>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
