import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useSecretAccess } from "@/hooks/useSecretAccess";
import { Database, Bot, BarChart3, FlaskConical, Home, LogOut, Layout, Wifi, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// Quantower-style Control Center sidebar — each icon launches a panel.
const navItems = [
  { label: "Workspace", icon: Layout, page: "Workspace" },
  { label: "Connections", icon: Wifi, page: "Connections" },
  { label: "Chart", icon: Database, page: "DataLayer" },
  { label: "AI Analysis", icon: Bot, page: "AnalysisLayer" },
  { label: "Backtesting", icon: BarChart3, page: "Backtesting" },
  { label: "Research", icon: FlaskConical, page: "ValidationLayer" },
  { label: "Pricing", icon: ShoppingBag, page: "Pricing" },
];

export default function MainNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, clearAccess } = useSecretAccess();
  const currentPage = location.pathname.split('/').pop() || 'QuantHome';

  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed left-0 top-0 h-full w-16 border-r border-gray-800 bg-gray-900/95 backdrop-blur flex flex-col items-center py-6 gap-4 z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`w-12 h-12 mb-2 ${currentPage === 'QuantHome' || location.pathname === '/' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              onClick={() => navigate(createPageUrl("QuantHome"))}
            >
              <Home className="w-6 h-6 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Home</TooltipContent>
        </Tooltip>

        <Separator className="w-10" />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-12 h-12 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                  onClick={() => navigate(createPageUrl(item.page))}
                >
                  <Icon className="w-6 h-6 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}

        {isAdmin && (
          <div className="mt-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { clearAccess(); navigate("/"); }}
                  className="w-10 h-10 text-gray-500 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Exit Admin</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
