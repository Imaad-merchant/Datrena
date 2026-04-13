import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MainNav from "../components/navigation/MainNav";
import {
  Loader2, TrendingUp, DollarSign, AlertTriangle, Globe, Clock,
  Target, Zap, BarChart3, CheckCircle, XCircle, ArrowRight,
  Briefcase, Activity, ChevronDown, ChevronUp
} from "lucide-react";

function ScoreRing({ score, size = 80, color = "#f59e0b" }) {
  const r = (size / 2) - 8;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f2937" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        className="rotate-90 fill-white font-bold"
        style={{ fontSize: size * 0.22, transform: `rotate(90deg) translate(0, -${size / 2}px)` }}
      />
    </svg>
  );
}

function ScoreCard({ label, score, icon: Icon, color }) {
  const r = 32;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="40" cy="40" r={r} fill="none" stroke="#1f2937" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg">{score}</span>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
        <div className="text-sm font-semibold text-white">
          {score >= 75 ? "Excellent" : score >= 55 ? "Good" : score >= 35 ? "Fair" : "Poor"}
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    Critical: "bg-red-950 text-red-400 border-red-800",
    High: "bg-orange-950 text-orange-400 border-orange-800",
    Medium: "bg-yellow-950 text-yellow-400 border-yellow-800",
    Low: "bg-green-950 text-green-400 border-green-800",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[severity] || map.Medium}`}>
      {severity}
    </span>
  );
}

function ProjectionBadge({ projection }) {
  const map = {
    Optimistic: "text-green-400", Likely: "text-blue-400", Cautious: "text-yellow-400",
    Declining: "text-orange-400", Transformative: "text-purple-400", Strong: "text-green-400",
    Stable: "text-blue-400", Uncertain: "text-yellow-400", Obsolete: "text-red-400",
  };
  return <span className={`font-semibold ${map[projection] || "text-gray-400"}`}>{projection}</span>;
}

function CollapsibleSection({ title, icon: Icon, iconColor, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-800/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
          <span className="text-sm font-semibold text-gray-200 uppercase tracking-wide">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
      </button>
      {open && <div className="border-t border-gray-800 p-5">{children}</div>}
    </div>
  );
}

export default function BusinessEvaluator() {
  const [idea, setIdea] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const evaluate = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    // TODO: Replace with your own API endpoint
    setError("Backend not connected. Connect your own API.");
    setLoading(false);
  };

  const verdictColor = {
    "Highly Viable": "#10b981",
    "Viable": "#3b82f6",
    "Risky": "#f59e0b",
    "High Risk": "#f97316",
    "Not Recommended": "#ef4444",
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 pl-16">
      <MainNav />

      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/60 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-400 font-medium">Business Idea Evaluator</span>
          {result && (
            <span
              className="text-xs px-2.5 py-0.5 rounded-full border font-semibold ml-2"
              style={{
                color: verdictColor[result.viabilityVerdict] || "#f59e0b",
                borderColor: verdictColor[result.viabilityVerdict] || "#f59e0b",
                backgroundColor: (verdictColor[result.viabilityVerdict] || "#f59e0b") + "1a",
              }}
            >
              {result.viabilityVerdict}
            </span>
          )}
        </div>
        {result && (
          <span className="text-xs text-gray-600">
            Viability Score: <span className="text-yellow-400 font-bold">{result.viabilityScore}/100</span>
          </span>
        )}
      </div>

      <div className="flex h-[calc(100vh-110px)]">
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-800 bg-gray-900/50 p-4 flex-shrink-0 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">
              Your Business Idea *
            </label>
            <Textarea
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="e.g. A subscription-based service that delivers curated local food experiences to remote workers..."
              rows={5}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-600 text-sm resize-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Industry</label>
            <Input
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="e.g. Food & Beverage, SaaS, Health..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-600 text-sm focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Target Market</label>
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. US, Global, NYC, Remote..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-600 text-sm focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Available Budget</label>
            <Input
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="e.g. $10K, $50K, $200K..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-600 text-sm focus:border-yellow-500"
            />
          </div>

          <Button
            onClick={evaluate}
            disabled={loading || !idea.trim()}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-bold h-10"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Evaluate Idea
              </>
            )}
          </Button>

          {result && (
            <Button
              variant="ghost"
              onClick={() => { setResult(null); setIdea(""); setIndustry(""); setLocation(""); setBudget(""); }}
              className="w-full text-gray-500 hover:text-white text-xs h-8"
            >
              Clear & Start Over
            </Button>
          )}

          {/* Quick ideas */}
          {!result && !loading && (
            <div className="pt-2">
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Try an example</p>
              {[
                "AI-powered personal finance coach app",
                "Mobile IV hydration therapy service",
                "Micro-factory for 3D printed custom furniture",
                "Premium pet wellness subscription box",
              ].map(ex => (
                <button
                  key={ex}
                  onClick={() => setIdea(ex)}
                  className="w-full text-left text-xs text-gray-500 hover:text-yellow-400 py-1.5 border-b border-gray-800/50 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              <div className="text-center">
                <p className="text-sm text-white font-medium">Evaluating your business idea...</p>
                <p className="text-xs text-gray-600 mt-1">Analyzing market trends, economics, competition & projections</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600 gap-3">
              <Briefcase className="w-12 h-12 text-gray-800" />
              <div className="text-center">
                <p className="text-sm text-gray-500">Enter your business idea and click <span className="text-yellow-400 font-semibold">Evaluate Idea</span></p>
                <p className="text-xs mt-1">Get a deep analysis: profitability, startup costs, market trends, and 10-year outlook</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <>
              {/* Hero card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-700 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-1">{result.businessName}</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">{result.summary}</p>
                  </div>
                  <div className="flex-shrink-0 text-center">
                    <div className="relative inline-flex">
                      <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="45" cy="45" r="36" fill="none" stroke="#1f2937" strokeWidth="7" />
                        <circle
                          cx="45" cy="45" r="36" fill="none"
                          stroke={verdictColor[result.viabilityVerdict] || "#f59e0b"}
                          strokeWidth="7"
                          strokeDasharray={2 * Math.PI * 36}
                          strokeDashoffset={2 * Math.PI * 36 * (1 - result.viabilityScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white leading-none">{result.viabilityScore}</div>
                          <div className="text-xs text-gray-500">/ 100</div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="text-xs font-semibold mt-1"
                      style={{ color: verdictColor[result.viabilityVerdict] || "#f59e0b" }}
                    >
                      {result.viabilityVerdict}
                    </div>
                  </div>
                </div>
              </div>

              {/* Score row */}
              <div className="grid grid-cols-3 gap-3">
                <ScoreCard label="Profitability" score={result.profitability?.score ?? 0} icon={DollarSign} color="#10b981" />
                <ScoreCard label="Market Demand" score={result.marketDemand?.score ?? 0} icon={TrendingUp} color="#3b82f6" />
                <ScoreCard label="Economic Fit" score={result.economicFit?.score ?? 0} icon={Globe} color="#8b5cf6" />
              </div>

              {/* Profitability */}
              <CollapsibleSection title="Profitability Analysis" icon={DollarSign} iconColor="#10b981">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Time to Profit", value: result.profitability?.timeToProfit },
                    { label: "Year 1 Revenue", value: result.profitability?.annualRevenueEstimate },
                    { label: "Gross Margin", value: result.profitability?.marginEstimate },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                      <div className="text-sm font-semibold text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mb-3">{result.profitability?.analysis}</p>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Revenue Streams</p>
                  <div className="flex flex-wrap gap-2">
                    {result.profitability?.revenueStreams?.map((s, i) => (
                      <span key={i} className="text-xs bg-green-950 text-green-400 border border-green-800 rounded-full px-2.5 py-1">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              {/* Startup Costs */}
              <CollapsibleSection title="Startup Costs" icon={BarChart3} iconColor="#f59e0b">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500">Total Estimated Range</span>
                  <span className="text-lg font-bold text-yellow-400">{result.startupCosts?.total}</span>
                </div>
                <div className="space-y-2">
                  {result.startupCosts?.breakdown?.map((item, i) => {
                    const maxVal = Math.max(...(result.startupCosts?.breakdown?.map(b => b.value) ?? [1]));
                    const pct = Math.round((item.value / maxVal) * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">{item.item}</span>
                          <span className="text-gray-300">{item.amount}</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleSection>

              {/* Market Demand */}
              <CollapsibleSection title="Market Demand & Trends" icon={TrendingUp} iconColor="#3b82f6">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Current Demand", value: result.marketDemand?.currentDemand },
                    { label: "Trend Direction", value: result.marketDemand?.trendDirection },
                    { label: "Market Size", value: result.marketDemand?.marketSize },
                    { label: "Search Trend", value: result.marketDemand?.searchTrend },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                      <div className="text-sm font-semibold text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mb-3">{result.marketDemand?.analysis}</p>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Target Audience</p>
                  <p className="text-sm text-gray-200">{result.marketDemand?.targetAudience}</p>
                </div>
              </CollapsibleSection>

              {/* Competitive Landscape */}
              <CollapsibleSection title="Competitive Landscape" icon={Target} iconColor="#ec4899">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Competition", value: result.competitiveLandscape?.intensity },
                    { label: "Moat Potential", value: result.competitiveLandscape?.moatPossibility },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                      <div className="text-sm font-semibold text-white">{item.value}</div>
                    </div>
                  ))}
                  <div className="bg-gray-800 rounded-lg p-3 col-span-1">
                    <div className="text-xs text-gray-500 mb-1">Major Players</div>
                    <div className="text-sm text-white">{result.competitiveLandscape?.majorPlayers?.join(", ")}</div>
                  </div>
                </div>
                <div className="bg-pink-950/30 border border-pink-900/50 rounded-lg p-3">
                  <p className="text-xs text-pink-400 font-semibold mb-1">Differentiation Opportunity</p>
                  <p className="text-sm text-gray-300">{result.competitiveLandscape?.differentiationOpportunity}</p>
                </div>
              </CollapsibleSection>

              {/* Obstacles */}
              <CollapsibleSection title="Key Obstacles & Risks" icon={AlertTriangle} iconColor="#f97316">
                <div className="space-y-3">
                  {result.obstacles?.map((obs, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-white">{obs.title}</span>
                        <SeverityBadge severity={obs.severity} />
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{obs.description}</p>
                      <div className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-green-400">{obs.mitigation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Economic Fit */}
              <CollapsibleSection title="Economic Climate Fit" icon={Globe} iconColor="#8b5cf6">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Current Climate</div>
                    <div className="text-sm font-semibold text-white">{result.economicFit?.currentClimate}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-3">{result.economicFit?.analysis}</p>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Macro Factors</p>
                  <div className="space-y-1">
                    {result.economicFit?.macroFactors?.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              {/* 5 Year */}
              <CollapsibleSection title="5-Year Outlook" icon={Clock} iconColor="#06b6d4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-gray-500">Projection:</span>
                  <ProjectionBadge projection={result.fiveYearOutlook?.projection} />
                  <span className="text-xs text-gray-600">·</span>
                  <span className="text-sm text-cyan-400 font-semibold">{result.fiveYearOutlook?.revenueRange}</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">{result.fiveYearOutlook?.analysis}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Key Drivers</p>
                    {result.fiveYearOutlook?.keyDrivers?.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-green-400 mb-1">
                        <ArrowRight className="w-3 h-3" />{d}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Risks</p>
                    {result.fiveYearOutlook?.risks?.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-orange-400 mb-1">
                        <AlertTriangle className="w-3 h-3" />{r}
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              {/* 10 Year */}
              <CollapsibleSection title="10-Year Outlook" icon={Activity} iconColor="#a855f7">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500">Long-term projection:</span>
                  <ProjectionBadge projection={result.tenYearOutlook?.projection} />
                </div>
                <p className="text-sm text-gray-400 mb-4">{result.tenYearOutlook?.analysis}</p>
                <div className="bg-purple-950/30 border border-purple-900/50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-purple-400 font-semibold mb-1">AI & Automation Impact</p>
                  <p className="text-sm text-gray-300">{result.tenYearOutlook?.aiImpact}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Industry Shifts to Watch</p>
                  {result.tenYearOutlook?.industryShifts?.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />{s}
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Success Factors */}
              <CollapsibleSection title="Success Factors" icon={CheckCircle} iconColor="#10b981" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-2">
                  {result.successFactors?.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 bg-gray-800 rounded-lg p-3">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-300">{f}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Similar Success Stories */}
              {result.similarSuccessStories?.length > 0 && (
                <CollapsibleSection title="Similar Success Stories" icon={Zap} iconColor="#f59e0b" defaultOpen={false}>
                  <div className="space-y-2">
                    {result.similarSuccessStories?.map((s, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-3">
                        <span className="text-sm font-semibold text-yellow-400">{s.company}</span>
                        <p className="text-xs text-gray-400 mt-1">{s.outcome}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Final Recommendation */}
              <div className="bg-gradient-to-r from-yellow-950/40 via-orange-950/20 to-yellow-950/40 border border-yellow-800/50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-400 uppercase tracking-wide">Strategic Recommendation</span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">{result.recommendation}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
