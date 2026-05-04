import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Apple, Monitor, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function Download() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [licenseKey, setLicenseKey] = useState(params.get("key") || "");
  const [status, setStatus] = useState("idle"); // idle | verifying | verified | error
  const [error, setError] = useState("");
  const [downloads, setDownloads] = useState(null);

  // Auto-verify if key + email are in the URL (from purchase confirmation email)
  useEffect(() => {
    if (params.get("key") && params.get("email")) {
      verify(params.get("email"), params.get("key"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async (e, k) => {
    setStatus("verifying");
    setError("");
    try {
      const res = await fetch("/api/download/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, licenseKey: k }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setStatus("error");
        setError(data.error || "Invalid license key");
        return;
      }
      setDownloads(data.downloads);
      setStatus("verified");
    } catch (err) {
      setStatus("error");
      setError("Could not reach download server. Try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !licenseKey) {
      setError("Email and license key required");
      return;
    }
    verify(email, licenseKey);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light tracking-tight mb-2">Download Datrena</h1>
          <p className="text-sm text-gray-500">
            Enter the license key from your purchase confirmation email.
          </p>
        </div>

        {status !== "verified" && (
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 space-y-4"
          >
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "verifying"}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                License Key
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                disabled={status === "verifying"}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                placeholder="DTRN-XXXX-XXXX-XXXX"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "verifying"}
              className="w-full bg-white text-black rounded py-2.5 text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "verifying" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Download"
              )}
            </button>

            <div className="text-center text-xs text-gray-500 pt-2">
              Don't have a license?{" "}
              <a href="/Pricing" className="text-white hover:underline">
                Purchase Datrena
              </a>
            </div>
          </form>
        )}

        {status === "verified" && downloads && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-2 text-green-400 text-sm mb-6">
              <CheckCircle2 className="w-4 h-4" />
              License verified for {email}
            </div>

            <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
              Choose your platform
            </h2>

            <div className="space-y-3">
              {downloads.mac && (
                <a
                  href={downloads.mac}
                  className="flex items-center gap-3 bg-black border border-zinc-800 hover:border-zinc-600 rounded-lg p-4 transition group"
                >
                  <Apple className="w-6 h-6" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Datrena for macOS</div>
                    <div className="text-xs text-gray-500">Apple Silicon & Intel · .dmg</div>
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-white">Download →</span>
                </a>
              )}

              {downloads.win && (
                <a
                  href={downloads.win}
                  className="flex items-center gap-3 bg-black border border-zinc-800 hover:border-zinc-600 rounded-lg p-4 transition group"
                >
                  <Monitor className="w-6 h-6" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Datrena for Windows</div>
                    <div className="text-xs text-gray-500">Windows 10/11 · .exe installer</div>
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-white">Download →</span>
                </a>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800 text-xs text-gray-500">
              <p className="mb-2">
                <strong className="text-gray-300">Next step:</strong> Datrena requires a market data
                feed to display live charts. Compatible providers: Rithmic, CQG, dxFeed, IQFeed,
                Tradovate.
              </p>
              <p>
                Your license key is also used to activate the app. Keep it somewhere safe.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
