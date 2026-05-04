import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { TIERS } from "./tiers";

const LicenseContext = createContext(null);

const STORAGE_KEY = "datrena_license_email";

/**
 * Provides the user's current license tier across the desktop app.
 * - Persists email to localStorage so the user only signs in once.
 * - Re-fetches tier from /api/license/status on app start (subscription state can change).
 * - Web users get tier="free" by default — they don't see paywalls on marketing pages.
 */
export function LicenseProvider({ children }) {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [tierKey, setTierKey] = useState("free");
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState("");

  const refreshTier = useCallback(async (e) => {
    if (!e) {
      setTierKey("free");
      setStatus("ready");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`/api/license/status?email=${encodeURIComponent(e)}`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      setTierKey(data.tier || "free");
      setStatus("ready");
      setError("");
    } catch (err) {
      console.warn("License status fetch failed:", err.message);
      setTierKey("free");
      setStatus("error");
      setError("Could not reach license server — using free tier.");
    }
  }, []);

  useEffect(() => {
    refreshTier(email);
  }, [email, refreshTier]);

  const signIn = useCallback((newEmail) => {
    const e = String(newEmail).toLowerCase().trim();
    try { localStorage.setItem(STORAGE_KEY, e); } catch {}
    setEmail(e);
  }, []);

  const signOut = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setEmail(null);
    setTierKey("free");
  }, []);

  const tier = TIERS[tierKey] || TIERS.free;

  const value = {
    email,
    tierKey,
    tier,
    features: tier.features,
    status,
    error,
    isElectron: typeof window !== "undefined" && window.datrena?.isElectron === true,
    signIn,
    signOut,
    refreshTier: () => refreshTier(email),
  };

  return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>;
}

export function useLicense() {
  const ctx = useContext(LicenseContext);
  if (!ctx) throw new Error("useLicense must be used inside LicenseProvider");
  return ctx;
}
