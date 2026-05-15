import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { PlanProvider } from '@/lib/PlanContext';
import { useSecretAccess } from '@/hooks/useSecretAccess';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import ForgeLabs from './pages/ForgeLabs';
import GithubPRs from './pages/GithubPRs';
import DataLayer from './pages/DataLayer';
import Checkout from './pages/Checkout';
import Backtesting from './pages/Backtesting';
import Download from './pages/Download';
import AdminWaitlist from './pages/AdminWaitlist';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user } = useAuth();
  const { isAdmin } = useSecretAccess();

  // Treat admin as authenticated
  const isAuthenticated = !!user || isAdmin;

  if (isLoadingPublicSettings || (isLoadingAuth && !isAdmin)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-700 border-t-white rounded-full animate-spin"></div>
          <span className="text-xs text-gray-400">Connecting...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public marketing routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/Home" element={<Landing />} />
      <Route path="/Pricing" element={<Pricing />} />
      <Route path="/Features" element={<Features />} />
      <Route path="/ForgeLabs" element={<ForgeLabs />} />
      <Route path="/Download" element={<Download />} />
      <Route path="/Waitlist" element={<Download />} />
      <Route path="/Checkout" element={<Checkout />} />
      <Route path="/GithubPRs" element={<GithubPRs />} />

      {/* Auth-only: chart, backtesting, admin */}
      {isAuthenticated ? (
        <>
          <Route path="/DataLayer" element={<DataLayer />} />
          <Route path="/QuantHome" element={<Navigate to="/DataLayer" replace />} />
          <Route path="/Backtesting" element={<Backtesting />} />
          <Route path="/Admin/Waitlist" element={<AdminWaitlist />} />
        </>
      ) : (
        <>
          <Route path="/DataLayer" element={<Navigate to="/" replace />} />
          <Route path="/QuantHome" element={<Navigate to="/" replace />} />
        </>
      )}

      {authError?.type === 'user_not_registered' && (
        <Route path="*" element={<UserNotRegisteredError />} />
      )}

      <Route path="*" element={isAuthenticated ? <PageNotFound /> : <Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </PlanProvider>
    </AuthProvider>
  )
}

export default App
