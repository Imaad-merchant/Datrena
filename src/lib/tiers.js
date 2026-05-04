/**
 * Datrena tier matrix — single source of truth for what each plan unlocks.
 * Consumed by the React app (UpgradeGate, useLicense) and the API
 * (/api/license/status returns one of these tier keys).
 *
 * Quantower/Sierra-style model:
 *   - Anyone can download Datrena for free.
 *   - Free tier lets users explore the app with real (but limited) features.
 *   - Paywall appears when they click a premium feature → UpgradeGate.
 */

export const TIERS = {
  free: {
    key: "free",
    name: "Free",
    price: 0,
    priceLabel: "Free",
    interval: null,
    cta: "Current plan",
    features: {
      maxSymbols: 1,            // BTCUSDT only
      timeframes: ["1m", "5m", "15m", "1h", "D"],
      mboOverlays: ["footprint"], // just the footprint, no premium overlays
      aiChatMessagesPerDay: 5,
      backtesting: false,
      rithmicSupport: false,
      cqgSupport: false,
      historyDays: 1,
    },
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: 29,
    priceLabel: "$29",
    interval: "month",
    cta: "Upgrade to Pro",
    stripePriceId: "price_PRO_PLACEHOLDER", // set this to your real Stripe Price ID
    features: {
      maxSymbols: Infinity,     // every Binance pair
      timeframes: ["1m", "2m", "3m", "5m", "10m", "15m", "30m", "1h", "4h", "D", "W"],
      mboOverlays: ["footprint", "depthHeatmap", "restingOrders"],
      aiChatMessagesPerDay: 100,
      backtesting: true,
      rithmicSupport: false,
      cqgSupport: false,
      historyDays: 30,
    },
  },
  elite: {
    key: "elite",
    name: "Elite",
    price: 99,
    priceLabel: "$99",
    interval: "month",
    cta: "Upgrade to Elite",
    stripePriceId: "price_ELITE_PLACEHOLDER",
    features: {
      maxSymbols: Infinity,
      timeframes: ["1m", "2m", "3m", "5m", "10m", "15m", "30m", "1h", "4h", "D", "W", "M"],
      // All overlays unlocked
      mboOverlays: [
        "footprint",
        "depthHeatmap",
        "restingOrders",
        "orderTracking",
        "queuePosition",
        "icebergDetection",
        "pullRate",
      ],
      aiChatMessagesPerDay: Infinity,
      backtesting: true,
      rithmicSupport: true,
      cqgSupport: true,
      historyDays: 365,
    },
  },
};

export const TIER_ORDER = ["free", "pro", "elite"];

/** Does the user's tier meet the required minimum? */
export function tierMeetsRequirement(userTier, requiredTier) {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(requiredTier);
}

/** What's the tier above the user's current tier? Returns null if at top. */
export function nextTier(currentTier) {
  const idx = TIER_ORDER.indexOf(currentTier);
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null;
}
