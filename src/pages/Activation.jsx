import React, { useState } from "react";
import { useLicense } from "../lib/LicenseContext";
import { ArrowRight, Loader2, ChevronLeft, Check, Bitcoin, BarChart3, TrendingUp, Building2 } from "lucide-react";

/**
 * Quantower-style multi-step first-launch wizard inside the desktop app.
 *   1. Terms of Use
 *   2. Choose your starting data feed (matches the connection types Quantower offers)
 *   3. Email sign-in (license activation)
 */

const DATA_FEEDS = [
  {
    id: "binance",
    name: "Binance",
    desc: "Crypto · Live trades + L2 depth",
    icon: Bitcoin,
    available: true,
    note: "Recommended for your first session",
  },
  {
    id: "dxfeed",
    name: "dxFeed",
    desc: "US futures, equities, options",
    icon: BarChart3,
    available: false,
    note: "Bring your own dxFeed credentials",
  },
  {
    id: "rithmic",
    name: "Rithmic",
    desc: "CME / CBOT / NYMEX / COMEX futures",
    icon: TrendingUp,
    available: false,
    note: "Requires Rithmic data subscription",
  },
  {
    id: "polygon",
    name: "Polygon.io",
    desc: "US stocks, options, indices",
    icon: Building2,
    available: false,
    note: "BYO API key",
  },
];

export default function Activation() {
  const { signIn, status, error } = useLicense();
  const [step, setStep] = useState(0); // 0=terms, 1=feed, 2=email
  const [feedId, setFeedId] = useState("binance");
  const [emailInput, setEmailInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.includes("@")) return;
    setSubmitted(true);
    // Persist the chosen feed so the Workspace can boot it on first load
    try {
      localStorage.setItem("datrena_default_feed", feedId);
    } catch {}
    signIn(emailInput);
  };

  const loading = submitted && status === "loading";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-2xl font-bold tracking-tight mb-1">Datrena</div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          Quant Trading Desktop
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {["Terms", "Connection", "Sign in"].map((label, i) => (
          <React.Fragment key={label}>
            <div
              className={`flex items-center gap-2 ${
                i <= step ? "text-white" : "text-zinc-600"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold border ${
                  i < step
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : i === step
                      ? "border-white text-white"
                      : "border-zinc-700 text-zinc-600"
                }`}
              >
                {i < step ? <Check size={10} /> : i + 1}
              </div>
              <span className="text-xs">{label}</span>
            </div>
            {i < 2 && <div className={`w-8 h-px ${i < step ? "bg-emerald-700" : "bg-zinc-800"}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl p-7">
        {/* STEP 1 — TERMS */}
        {step === 0 && (
          <>
            <h1 className="text-xl font-light mb-3">Welcome to Datrena</h1>
            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
              Before we get started, please review the terms of use. Datrena is
              quantitative-analysis software — it does not provide investment advice or
              execute trades on your behalf.
            </p>
            <div className="bg-black border border-zinc-900 rounded-lg p-4 max-h-44 overflow-y-auto text-xs text-zinc-500 leading-relaxed mb-4 space-y-2">
              <p>
                <strong className="text-zinc-300">1. License.</strong> Datrena software
                is licensed, not sold. Your license is tied to the email you sign in
                with and is non-transferable.
              </p>
              <p>
                <strong className="text-zinc-300">2. Market data.</strong> Datrena does
                not redistribute exchange data. Live data is provided by your connected
                feed (Binance, Rithmic, dxFeed, etc.). Exchange fees are billed
                separately by those vendors.
              </p>
              <p>
                <strong className="text-zinc-300">3. No advice.</strong> Charts,
                analysis, AI commentary, and any signals shown are informational only
                and do not constitute investment, legal, tax, or trading advice.
              </p>
              <p>
                <strong className="text-zinc-300">4. Risk.</strong> Trading carries
                substantial risk of loss. You are solely responsible for your own
                trading decisions and outcomes.
              </p>
            </div>
            <label className="flex items-start gap-2 mb-5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I have read and accept the Datrena Terms of Use and Privacy Policy.
              </span>
            </label>
            <button
              onClick={() => setStep(1)}
              disabled={!acceptedTerms}
              className="w-full bg-white text-black rounded py-2.5 text-sm font-semibold hover:bg-zinc-200 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Accept and Continue <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* STEP 2 — DATA FEED */}
        {step === 1 && (
          <>
            <h1 className="text-xl font-light mb-2">Choose your data feed</h1>
            <p className="text-sm text-zinc-400 mb-5">
              Datrena connects to live market data from these providers. You can change
              or add connections any time from the Connections panel.
            </p>
            <div className="space-y-2 mb-5">
              {DATA_FEEDS.map((f) => {
                const Icon = f.icon;
                const selected = feedId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => f.available && setFeedId(f.id)}
                    disabled={!f.available}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                      selected
                        ? "bg-zinc-900 border-zinc-600"
                        : "bg-black border-zinc-900 hover:border-zinc-800"
                    } ${!f.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        selected ? "bg-white text-black" : "bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        {f.name}
                        {!f.available && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 font-normal">
                            Configure later
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">{f.desc}</div>
                    </div>
                    {selected && <Check size={16} className="text-emerald-500" />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-1 bg-transparent text-zinc-400 border border-zinc-800 rounded py-2.5 px-4 text-sm font-medium hover:text-white transition"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-white text-black rounded py-2.5 text-sm font-semibold hover:bg-zinc-200 transition flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* STEP 3 — EMAIL */}
        {step === 2 && (
          <>
            <h1 className="text-xl font-light mb-2">Sign in to Datrena</h1>
            <p className="text-sm text-zinc-400 mb-5">
              Enter your email. We'll match it to your account — or start you on the
              free tier if you're new here.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={loading}
                  placeholder="you@example.com"
                  className="w-full bg-black border border-zinc-800 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                  autoFocus
                  required
                />
              </div>

              {error && submitted && (
                <div className="text-xs text-amber-500 bg-amber-950/30 border border-amber-900/40 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 bg-transparent text-zinc-400 border border-zinc-800 rounded py-2.5 px-4 text-sm font-medium hover:text-white transition"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !emailInput}
                  className="flex-1 bg-white text-black rounded py-2.5 text-sm font-semibold hover:bg-zinc-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Activating...
                    </>
                  ) : (
                    <>
                      Launch Datrena <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <p className="text-center text-xs text-zinc-600 mt-6 max-w-lg">
        Already paid? Use the same email you used at checkout — your subscription
        activates automatically.
      </p>
    </div>
  );
}
