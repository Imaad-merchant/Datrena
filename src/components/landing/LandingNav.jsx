import React from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "Features", path: "/Features" },
  { label: "Pricing", path: "/Pricing" },
  { label: "Forge Labs", path: "/ForgeLabs" },
];

export default function LandingNav({ activePage }) {
  return (
    <nav className="flex items-center justify-between px-6 lg:px-16 py-5 z-10 relative max-w-[1400px] mx-auto w-full">
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="text-white text-lg font-bold tracking-wide">Datrena</span>
      </Link>
      <div className="flex items-center gap-8">
        {NAV_LINKS.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm transition-colors ${
              activePage === link.path ? "text-white font-medium" : "text-gray-400 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
        <Link
          to="/SignIn"
          className="text-sm font-semibold bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors ml-2"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}
