import React, { useState } from "react";
import { useLicense } from "../lib/LicenseContext";
import { ArrowRight, Loader2 } from "lucide-react";

/**
 * First-launch screen inside the desktop app.
 * Captures the user's email, then `useLicense` fetches their tier.
 * Quantower-style: any email works for the free tier; paid tiers come from
 * matching the email to a Stripe customer with an active subscription.
 */
export default function Activation() {
  const { signIn, status, error } = useLicense();
  const [emailInput, setEmailInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.includes("@")) return;
    setSubmitted(true);
    signIn(emailInput);
  };

  const loading = submitted && status === "loading";

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-2xl font-bold tracking-tight mb-2">Datrena</div>
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            Quant trading desktop
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-7">
          <h1 className="text-xl font-light mb-2">Sign in to continue</h1>
          <p className="text-sm text-zinc-400 mb-6">
            Enter your email. We'll match it to your Datrena account — or start you on
            the free tier if you're new here.
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

            <button
              type="submit"
              disabled={loading || !emailInput}
              className="w-full bg-white text-black rounded py-2.5 text-sm font-semibold hover:bg-zinc-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking license...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Already paid?{" "}
          <span className="text-zinc-400">
            Use the same email you used at checkout — your subscription will activate
            automatically.
          </span>
        </p>
      </div>
    </div>
  );
}
