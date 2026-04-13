import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/api/firebase";
import { Lock, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LandingNav from "../components/landing/LandingNav";
import LandingFooter from "../components/landing/LandingFooter";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/QuantHome");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Email and password required");
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/QuantHome");
    } catch (err) {
      const msg = err.code === "auth/invalid-credential" ? "Invalid email or password"
        : err.code === "auth/email-already-in-use" ? "Email already in use"
        : err.code === "auth/weak-password" ? "Password must be at least 6 characters"
        : err.message;
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <LandingNav activePage="/SignIn" />

      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl max-w-sm w-full p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-white mb-1">{isSignUp ? "Create Account" : "Sign In"}</h1>
            <p className="text-gray-500 text-sm">Access your Datrena workspace</p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium rounded-lg h-11 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 mb-4"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">OR</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 h-11"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 h-11"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full h-11 bg-white text-black hover:bg-gray-200 font-medium">
              {loading ? "..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-4">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="text-white hover:underline">
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          <div className="mt-6 pt-4 border-t border-gray-800/40">
            <Button asChild variant="ghost" className="w-full text-sm text-gray-500 hover:text-white rounded-lg h-9 gap-2">
              <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </a>
            </Button>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
