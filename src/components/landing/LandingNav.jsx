import React, { useState } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "FEATURES", path: "/Features" },
  { label: "PRICING", path: "/Pricing" },
  { label: "FORGE LABS", path: "/ForgeLabs" },
];

export default function LandingNav({ activePage }) {
  const [showToast, setShowToast] = useState(false);

  const handleSignIn = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <nav className="flex items-center justify-between px-6 lg:px-16 py-4 z-10 relative max-w-[1400px] mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-[#22C55E] font-mono text-base font-bold tracking-wider">DATRENA</span>
        </Link>
        <div className="flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[11px] font-mono tracking-wider transition-colors ${
                activePage === link.path ? "text-[#F8FAFC]" : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleSignIn}
            className="text-[11px] font-mono font-semibold tracking-wider bg-[#22C55E] text-[#020617] px-4 py-1.5 hover:bg-[#16A34A] transition-colors ml-2"
          >
            SIGN IN
          </button>
        </div>
      </nav>

      {/* Admin-only toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#0E1223] border border-[#334155] px-4 py-2.5 font-mono text-[11px] text-[#94A3B8] animate-in fade-in slide-in-from-top-2">
          <span className="text-[#EF4444] mr-2">ACCESS DENIED</span>
          Administrator access only.
        </div>
      )}
    </>
  );
}