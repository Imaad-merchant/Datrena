import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useSecretAccess } from "@/hooks/useSecretAccess";
import { Database, TrendingUp, Lightbulb, CheckCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "DATA", full: "Data Layer", icon: Database, color: "#3B82F6", page: "DataLayer" },
  { label: "ANLYS", full: "Analysis Layer", icon: TrendingUp, color: "#8B5CF6", page: "AnalysisLayer" },
  { label: "INSGT", full: "Insight Layer", icon: Lightbulb, color: "#F59E0B", page: "InsightLayer" },
  { label: "VALID", full: "Validation Layer", icon: CheckCircle, color: "#10B981", page: "ValidationLayer" }
];

export default function MainNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, clearAccess } = useSecretAccess();
  const currentPage = location.pathname.split('/').pop() || 'QuantHome';

  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed left-0 top-0 h-full w-16 border-r border-border bg-card flex flex-col items-center py-4 gap-1 z-50">
        {/* DT Monogram */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl("QuantHome"))}
              className="w-10 h-10 rounded-none p-0"
            >
              <span className="text-dt-green text-sm font-bold">DT</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[10px] tracking-wider rounded-none">
            WORKSPACE
          </TooltipContent>
        </Tooltip>

        <Separator className="w-8 my-1" />

        {/* Layer Nav */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => navigate(createPageUrl(item.page))}
                  className={`relative w-full flex flex-col items-center gap-0.5 py-2.5 h-auto rounded-none ${
                    isActive ? "bg-secondary" : ""
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-dt-green" />
                  )}
                  <Icon className="w-4 h-4" style={{ color: isActive ? item.color : "hsl(var(--muted-foreground))" }} />
                  <span className="text-[8px] tracking-wider" style={{ color: isActive ? item.color : "hsl(var(--border))" }}>
                    {item.label}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-[10px] tracking-wider rounded-none">
                {item.full}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Bottom */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-dt-green animate-pulse-green" />
            <span className="text-[7px] text-dt-green tracking-wider">LIVE</span>
          </div>

          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { clearAccess(); navigate("/"); }}
                  className="w-8 h-8 text-border hover:text-dt-red rounded-none"
                >
                  <LogOut className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-[10px] tracking-wider rounded-none">
                EXIT ADMIN
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}