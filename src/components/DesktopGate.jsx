import React from "react";
import { Apple, Monitor, Download, Rocket } from "lucide-react";

/**
 * Wraps content that should only render inside the Datrena desktop app.
 * On the web, shows a launch / download gate instead.
 *
 * Detection: window.datrena.isElectron is exposed via the Electron preload script.
 */
export default function DesktopGate({ children, title = "Datrena Charting" }) {
  const isElectron =
    typeof window !== "undefined" && window.datrena?.isElectron === true;

  if (isElectron) return <>{children}</>;

  // Build deep-link to open the desktop app if installed (custom protocol: datrena://)
  const launchUrl = "datrena://open" + (typeof window !== "undefined" ? window.location.pathname : "");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a10",
        color: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: 560, width: "100%" }}>
        <div
          style={{
            border: "1px solid #1a1a2c",
            borderRadius: 12,
            padding: "2.5rem",
            background:
              "linear-gradient(180deg, rgba(15,15,22,1) 0%, rgba(8,8,14,1) 100%)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              background: "#0c1020",
              border: "1px solid #152040",
              color: "#60a5fa",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
              marginBottom: 18,
            }}
          >
            DESKTOP ONLY
          </div>

          <h1
            style={{
              fontSize: 28,
              fontWeight: 300,
              letterSpacing: -0.5,
              margin: 0,
              marginBottom: 10,
              color: "#fafafa",
            }}
          >
            {title} runs in the desktop app
          </h1>

          <p
            style={{
              color: "#7a7a8c",
              fontSize: 14,
              lineHeight: 1.55,
              margin: 0,
              marginBottom: 22,
            }}
          >
            For real-time orderflow, footprint rendering, and direct connections
            to your data feed, Datrena's charting engine runs natively on your
            machine — not in the browser.
          </p>

          <a
            href={launchUrl}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "12px 16px",
              background: "#fafafa",
              color: "#0a0a10",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            <Rocket size={16} /> Launch Datrena Desktop
          </a>

          <a
            href="/Download"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "12px 16px",
              background: "transparent",
              color: "#9ca3af",
              border: "1px solid #1a1a2c",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            <Download size={14} /> Don't have it yet? Download
          </a>

          <div
            style={{
              marginTop: 22,
              paddingTop: 18,
              borderTop: "1px solid #14141f",
              display: "flex",
              gap: 16,
              fontSize: 11,
              color: "#5a5a6c",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Apple size={12} /> macOS · Apple Silicon & Intel
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Monitor size={12} /> Windows 10/11
            </span>
          </div>
        </div>

        <p
          style={{
            color: "#3a3a48",
            fontSize: 11,
            textAlign: "center",
            marginTop: 16,
            lineHeight: 1.5,
          }}
        >
          Datrena software is licensed separately from market data. Use any
          supported feed (Binance, Rithmic, CQG, dxFeed, IQFeed).
        </p>
      </div>
    </div>
  );
}
