import React from "react";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="bg-black border-t border-gray-800/60">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-white" />
              <span className="text-white font-bold tracking-wide">Datrena</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Quantitative trading analytics built for futures traders. Real-time order flow, footprint charts, and statistical analysis.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/Features" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Features</Link></li>
              <li><Link to="/Pricing" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Pricing</Link></li>
              <li><Link to="/ForgeLabs" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Forge Labs</Link></li>
            </ul>
          </div>

          {/* Data */}
          <div>
            <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-3">Exchange Data</h4>
            <ul className="space-y-2">
              <li className="text-gray-500 text-xs">CME &mdash; ES, NQ, 6E, 6B</li>
              <li className="text-gray-500 text-xs">CBOT &mdash; YM, ZB, ZN</li>
              <li className="text-gray-500 text-xs">NYMEX &mdash; CL, NG</li>
              <li className="text-gray-500 text-xs">COMEX &mdash; GC, SI</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-3">Contact</h4>
            <ul className="space-y-2">
              <li><a href="mailto:support@datrena.com" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">support@datrena.com</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-[10px]">&copy; {new Date().getFullYear()} Datrena. All rights reserved.</p>
          <p className="text-gray-700 text-[10px]">Market data provided via Rithmic. Datrena is not affiliated with CME Group. Exchange data fees may apply.</p>
        </div>
      </div>
    </footer>
  );
}
