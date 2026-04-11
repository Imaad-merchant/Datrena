import React from "react";
import { Link } from "react-router-dom";

export default function LandingFooter() {
  return (
    <footer className="bg-[#020617] border-t border-[#334155]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="text-[#22C55E] font-mono text-sm font-bold tracking-wider">DATRENA</span>
            <p className="text-[#64748B] text-[10px] font-mono mt-2 leading-relaxed">
              Quantitative order flow analytics for futures traders. Real-time MBO Level 3 data via Rithmic.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[#94A3B8] text-[10px] font-mono font-semibold tracking-widest mb-3">PRODUCT</h4>
            <ul className="space-y-1.5">
              <li><Link to="/Features" className="text-[#64748B] text-[10px] font-mono hover:text-[#94A3B8] transition-colors">Features</Link></li>
              <li><Link to="/Pricing" className="text-[#64748B] text-[10px] font-mono hover:text-[#94A3B8] transition-colors">Pricing</Link></li>
              <li><Link to="/ForgeLabs" className="text-[#64748B] text-[10px] font-mono hover:text-[#94A3B8] transition-colors">Forge Labs</Link></li>
            </ul>
          </div>

          {/* Exchanges */}
          <div>
            <h4 className="text-[#94A3B8] text-[10px] font-mono font-semibold tracking-widest mb-3">EXCHANGES</h4>
            <ul className="space-y-1.5">
              <li className="text-[#64748B] text-[10px] font-mono">CME &mdash; ES, NQ, 6E, 6B</li>
              <li className="text-[#64748B] text-[10px] font-mono">CBOT &mdash; YM, ZB, ZN</li>
              <li className="text-[#64748B] text-[10px] font-mono">NYMEX &mdash; CL, NG</li>
              <li className="text-[#64748B] text-[10px] font-mono">COMEX &mdash; GC, SI</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#94A3B8] text-[10px] font-mono font-semibold tracking-widest mb-3">CONTACT</h4>
            <ul className="space-y-1.5">
              <li><a href="mailto:support@datrena.com" className="text-[#64748B] text-[10px] font-mono hover:text-[#94A3B8] transition-colors">support@datrena.com</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#334155]/50 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[#475569] text-[9px] font-mono">&copy; {new Date().getFullYear()} DATRENA. All rights reserved.</p>
          <p className="text-[#334155] text-[9px] font-mono">Market data via Rithmic. Not affiliated with CME Group. Exchange fees may apply.</p>
        </div>
      </div>
    </footer>
  );
}