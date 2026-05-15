import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "datrena_admin";

/**
 * Datrena's beta-only access mechanism.
 *
 * Anyone visiting datrena.com sees the marketing site + waitlist.
 * The chart, backtesting, and admin tools are gated — the ONLY way to unlock
 * them is to press Shift+Z anywhere on the site. That sets a localStorage flag
 * (datrena_admin = "true") and immediately routes the user to /DataLayer.
 *
 * To exit, the user clicks "Exit Admin" in the chart's sidebar (which calls
 * clearAccess) or manually clears localStorage.
 */
export function useSecretAccess() {
  const [isAdmin, setIsAdmin] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
  });

  const clearAccess = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.shiftKey || e.key !== "Z") return;
      // Ignore the chord when the user is typing in a field
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;

      try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
      setIsAdmin(true);
      // Only redirect if we aren't already inside the gated app
      if (!window.location.pathname.startsWith("/DataLayer")) {
        window.location.href = "/DataLayer";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { isAdmin, clearAccess };
}
