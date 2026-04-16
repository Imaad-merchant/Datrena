import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSecretAccess } from "@/hooks/useSecretAccess";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";

const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";

export default function SignIn() {
  const navigate = useNavigate();
  const { isAdmin } = useSecretAccess();
  const wasAdminOnMount = React.useRef(isAdmin);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin && !wasAdminOnMount.current) {
      navigate("/QuantHome");
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem("datrena_admin", "true");
      // Full page nav so useSecretAccess re-reads localStorage
      window.location.href = "/QuantHome";
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <LandingNav activePage="/SignIn" />

      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <Card className="bg-gray-900/40 border-gray-800/40 max-w-md w-full">
          <CardContent className="p-10">
            <div className="w-14 h-14 rounded-full bg-gray-800/60 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>

            <h1 className="text-xl font-bold text-white mb-2 text-center">Admin Sign In</h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed text-center">
              Datrena is currently in private beta. Admin credentials required.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-wider">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="bg-gray-800/40 border-gray-700/60 text-white placeholder-gray-600 h-11"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-wider">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="bg-gray-800/40 border-gray-700/60 text-white placeholder-gray-600 h-11"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200 rounded-lg h-11 font-semibold">
                Sign In
              </Button>

              <Button asChild variant="ghost" className="w-full text-sm text-gray-500 hover:text-white rounded-lg h-11 gap-2">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <LandingFooter />
    </div>
  );
}
