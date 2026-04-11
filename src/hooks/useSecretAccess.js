import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "datrena_admin";

export function useSecretAccess() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const clearAccess = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key === "Z") {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsAdmin(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { isAdmin, clearAccess };
}