import React, { useState, useCallback } from "react";
import TerminalSettings from "../components/terminal/TerminalSettings";
import VolatilityHeatmap from "../components/terminal/VolatilityHeatmap";
import AIChat from "../components/terminal/AIChat";
import MainNav from "../components/navigation/MainNav";
import { AlertCircle, Loader2, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Terminal() {
  const [symbol, setSymbol] = useState("ES=F");
  const [lookbackDays, setLookbackDays] = useState(30);
  const [timeframe, setTimeframe] = useState("1h");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    // TODO: Replace with your own API endpoint
    setError("Data backend not connected. Connect your own API.");
    setLoading(false);
  }, [symbol, lookbackDays, timeframe]);

  const aiContext = data
    ? `Ticker: ${symbol} · Timeframe: ${timeframe}
Analysis Window: ${lookbackDays} days · ${data.rows.length} bars
Current Price: ${data.rows[data.rows.length - 1]?.close?.toFixed(2) ?? "N/A"}
NY Open Price: ${data.nyOpenPrice?.toFixed(2) ?? "N/A"}`
    : "";

  return (
    <div className="min-h-screen bg-black text-gray-100 pl-16">
      <MainNav />
      <div className="border-b border-gray-800 bg-gray-900/60 px-6 py-3 flex items-center gap-3">
        {data && (
          <span className="text-sm text-gray-400">
            {data.meta?.longName || symbol} · {data.rows.length} bars
          </span>
        )}
      </div>

      <div className="flex h-[calc(100vh-110px)]">
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-800 bg-gray-900/50 p-4 flex-shrink-0 overflow-y-auto">
          <TerminalSettings
            symbol={symbol}
            setSymbol={setSymbol}
            lookbackDays={lookbackDays}
            setLookbackDays={setLookbackDays}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            onRun={fetchData}
            loading={loading}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <Alert className="border-red-800 bg-red-950 text-red-300">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
              <span>Fetching market data...</span>
            </div>
          )}

          {data && !loading && (
            <>
              <VolatilityHeatmap
                hourlyVol={data.hourlyVol}
                previousHourlyVol={data.previousHourlyVol}
                timeframe={timeframe}
                onTimeframeChange={async (tf) => {
                  setTimeframe(tf);
                  setLoading(true);
                  setError(null);
                  setData(null);
                  // TODO: Replace with your own API endpoint
                  setError("Data backend not connected. Connect your own API.");
                  setLoading(false);
                }}
              />
              <AIChat context={aiContext} />
            </>
          )}

          {!data && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-2">
              <Activity className="w-10 h-10 text-gray-700" />
              <p className="text-sm">Configure settings and click <span className="text-yellow-400 font-semibold">Run Analysis</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}