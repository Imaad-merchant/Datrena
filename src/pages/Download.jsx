import React from "react";
import { Apple, Monitor, ArrowRight, Check } from "lucide-react";

/**
 * Public Download page — like Sierra Chart / Quantower:
 *   - Anyone can download for free, no signup required at the website.
 *   - The app launches with a free tier.
 *   - Sign-in / payment happens inside the desktop app.
 */

const RELEASE_REPO = "Imaad-merchant/Datrena";
const RELEASE_TAG = "v0.1.0";

const downloads = {
  mac: `https://github.com/${RELEASE_REPO}/releases/download/${RELEASE_TAG}/Datrena-${RELEASE_TAG.replace(/^v/, "")}-arm64.dmg`,
  win: `https://github.com/${RELEASE_REPO}/releases/download/${RELEASE_TAG}/Datrena-Setup-${RELEASE_TAG.replace(/^v/, "")}.exe`,
};

const FREE_FEATURES = [
  "Live Binance level-2 order flow data",
  "Footprint charting on BTC/USDT",
  "5 AI quant chat messages per day",
  "1m / 5m / 15m / 1h / Daily timeframes",
];

export default function Download() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Free download · No credit card required
          </div>
          <h1 className="text-4xl lg:text-5xl font-light tracking-tight mb-4">
            Download Datrena
          </h1>
          <p className="text-zinc-400 text-base lg:text-lg max-w-xl mx-auto">
            Quantitative trading analytics for your desktop. Install free, sign in inside
            the app, upgrade only if you need pro features.
          </p>
        </div>

        {/* Download buttons */}
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-16">
          <a
            href={downloads.mac}
            className="group flex items-center gap-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition"
          >
            <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Apple className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">macOS</div>
              <div className="text-xs text-zinc-500">Apple Silicon · 12+</div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
          </a>

          <a
            href={downloads.win}
            className="group flex items-center gap-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition"
          >
            <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Monitor className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Windows</div>
              <div className="text-xs text-zinc-500">10 / 11 · 64-bit</div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
          </a>
        </div>

        {/* What's free */}
        <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-800 rounded-xl p-6 lg:p-8 mb-8">
          <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-5">
            What you get for free
          </h2>
          <ul className="space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-zinc-300">{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-5 border-t border-zinc-800 text-xs text-zinc-500">
            Need every Binance pair, MBO depth heatmap, iceberg detection, or unlimited
            AI chat?{" "}
            <a href="/Pricing" className="text-white hover:underline">
              Compare plans →
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 max-w-xl mx-auto">
          Datrena software is licensed separately from market data. The free tier uses
          Binance public market data. Pro plans unlock Rithmic, CQG, dxFeed, IQFeed,
          Tradovate.
        </p>
      </div>
    </div>
  );
}
