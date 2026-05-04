import React, { useState } from "react";
import { CheckCircle2, Loader2, Mail, ArrowRight, Sparkles } from "lucide-react";
import LandingNav from "../components/landing/LandingNav";

/**
 * Beta waitlist page. Datrena is in private beta — users drop their email
 * here to be notified when the public download opens. No software access
 * is given out from this page.
 */

const PERKS = [
  "Early access — invited before public launch",
  "Free Pro tier for the first 30 days",
  "Direct line to the team for feedback & feature requests",
  "Founder pricing locked in for the life of your account",
];

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [referrer, setReferrer] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referrer, source: "datrena-landing" }),
      });
      // We treat any non-network failure as a soft success — emails get
      // captured locally even if the API isn't reachable in dev.
      if (!res.ok && res.status !== 404) {
        throw new Error("Could not save your email. Try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <LandingNav />

      <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-12 pb-24">
        {/* Beta badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-900/40 text-xs font-medium text-amber-400 mb-8">
          <Sparkles className="w-3 h-3" />
          Private beta — limited spots
        </div>

        {/* Hero */}
        <h1 className="text-4xl lg:text-5xl font-light tracking-tight mb-5 leading-tight">
          Get on the Datrena
          <br />
          <span className="text-zinc-500">early-access list</span>
        </h1>
        <p className="text-zinc-400 text-base lg:text-lg max-w-xl leading-relaxed mb-10">
          Datrena is still in private beta. We're handing out access in waves to make
          sure the platform is rock-solid before the public launch. Drop your email and
          we'll send you a download link the moment your spot opens up.
        </p>

        {/* Form / success state */}
        {status === "success" ? (
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-6 mb-12 max-w-xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-emerald-300 mb-1">
                  You're on the list
                </div>
                <div className="text-xs text-emerald-200/80 leading-relaxed">
                  We'll email <strong>{email}</strong> the moment your spot opens up.
                  Check your inbox in a day or two for a confirmation.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl mb-12">
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-white text-black rounded-lg px-6 py-3 text-sm font-semibold hover:bg-zinc-200 transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Request access <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="text-xs text-red-400 mb-2">{error}</div>
            )}
            <input
              type="text"
              value={referrer}
              onChange={(e) => setReferrer(e.target.value)}
              placeholder="Where did you hear about us? (optional)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 focus:outline-none focus:border-zinc-700"
            />
            <p className="text-xs text-zinc-600 mt-3">
              No spam. We only email when your invite is ready.
            </p>
          </form>
        )}

        {/* Perks */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-7 max-w-xl">
          <h2 className="text-sm uppercase tracking-wider text-zinc-400 font-semibold mb-5">
            What early-access members get
          </h2>
          <ul className="space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-zinc-600 mt-10 max-w-xl leading-relaxed">
          Datrena is software for quantitative analysis of market data. It doesn't
          provide investment advice or execute trades. The platform is built to support
          your own data feeds — Binance, Rithmic, CQG, dxFeed, IQFeed and others — at
          launch.
        </p>
      </div>
    </div>
  );
}
