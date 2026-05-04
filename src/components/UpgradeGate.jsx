import React from "react";
import { Lock, Sparkles } from "lucide-react";
import { useLicense } from "../lib/LicenseContext";
import { TIERS, tierMeetsRequirement } from "../lib/tiers";

/**
 * Wraps premium features. If the user's tier meets `requires`, renders children.
 * Otherwise shows a blurred-children overlay with a single "Upgrade" CTA.
 * This is the Quantower / Sierra paywall pattern: features render but are gated.
 *
 * Usage:
 *   <UpgradeGate requires="pro" feature="MBO Depth Heatmap">
 *     <DepthHeatmapToggle />
 *   </UpgradeGate>
 */
export default function UpgradeGate({ requires = "pro", feature, children, compact = false }) {
  const { tierKey } = useLicense();
  const ok = tierMeetsRequirement(tierKey, requires);
  if (ok) return <>{children}</>;

  const target = TIERS[requires];

  if (compact) {
    // Inline compact lock badge for menu items / toggles
    return (
      <div
        className="relative inline-flex items-center gap-1.5 opacity-60 cursor-not-allowed"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = "/Pricing";
        }}
      >
        {children}
        <Lock className="w-3 h-3 text-amber-500" />
      </div>
    );
  }

  return (
    <div className="relative" style={{ minHeight: 200 }}>
      <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(2px)",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "#0a0a10",
            border: "1px solid #252538",
            borderRadius: 12,
            padding: "28px 32px",
            maxWidth: 380,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              borderRadius: 999,
              background: "#1a1400",
              border: "1px solid #453000",
              color: "#f59e0b",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 0.5,
              marginBottom: 14,
              textTransform: "uppercase",
            }}
          >
            <Sparkles size={11} />
            {target.name} feature
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 500, margin: 0, marginBottom: 8, color: "#fafafa" }}>
            {feature || "This feature"} is on {target.name}
          </h3>
          <p style={{ color: "#7a7a8c", fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
            Upgrade to {target.name} for {target.priceLabel}/{target.interval} to unlock
            this and more.
          </p>
          <button
            onClick={() => { window.location.href = "/Pricing"; }}
            style={{
              background: "#fafafa",
              color: "#0a0a10",
              border: "none",
              borderRadius: 6,
              padding: "10px 22px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {target.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
