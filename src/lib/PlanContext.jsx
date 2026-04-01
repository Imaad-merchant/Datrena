import React, { createContext, useContext } from "react";

/*
  Plan tiers and what each unlocks.
  Every authenticated user starts on "free".
  Upgrade logic (Stripe, etc.) will set the plan later.
*/
const PLAN_LIMITS = {
  free: {
    label: "Free",
    dataLevel: 2,                // Level 2 market data only
    footprint: false,            // No footprint chart (Level 3)
    deltaVolume: false,          // No delta / volume overlays
    aiMessagesPerDay: 5,         // Limited AI chat
    instruments: 1,              // 1 instrument
    propFirmTracking: true,      // Included free
    backtesting: true,           // Included free
    allTimeframes: false,        // Limited timeframes
  },
  trader: {
    label: "Trader",
    dataLevel: 3,
    footprint: true,
    deltaVolume: true,
    aiMessagesPerDay: Infinity,
    instruments: 4,
    propFirmTracking: true,
    backtesting: false,
    allTimeframes: true,
  },
  pro: {
    label: "Pro",
    dataLevel: 3,
    footprint: true,
    deltaVolume: true,
    aiMessagesPerDay: Infinity,
    instruments: Infinity,
    propFirmTracking: true,
    backtesting: true,
    allTimeframes: true,
  },
};

const PlanContext = createContext(null);

export function PlanProvider({ children }) {
  // TODO: fetch real plan from user profile / Stripe subscription
  const planKey = "free";
  const limits = PLAN_LIMITS[planKey];

  return (
    <PlanContext.Provider value={{ plan: planKey, limits, PLAN_LIMITS }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be inside PlanProvider");
  return ctx;
}
