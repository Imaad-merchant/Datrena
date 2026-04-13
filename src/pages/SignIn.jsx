import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSecretAccess } from "@/hooks/useSecretAccess";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";
import { useEffect } from "react";

export default function SignIn() {
  const navigate = useNavigate();
  const { isAdmin } = useSecretAccess();

  useEffect(() => {
    if (isAdmin) {
      navigate("/QuantHome");
    }
  }, [isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <LandingNav activePage="/SignIn" />

      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <Card className="bg-gray-900/40 border-gray-800/40 max-w-md w-full">
          <CardContent className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-800/60 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>

            <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Datrena is currently in private beta and accessible to approved testers only. Public access is coming soon.
            </p>

            <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg px-5 py-4 mb-8">
              <p className="text-gray-300 text-sm font-medium mb-1">Beta Access</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                If you have been invited to the beta program, use your admin credentials to sign in. Contact us if you need assistance.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full text-sm text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white rounded-lg h-11">
                <a href="mailto:support@datrena.com">Request Beta Access</a>
              </Button>
              <Button asChild variant="ghost" className="w-full text-sm text-gray-500 hover:text-white rounded-lg h-11 gap-2">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <LandingFooter />
    </div>
  );
}
