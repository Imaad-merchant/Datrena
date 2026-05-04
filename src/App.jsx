import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter, HashRouter, Route, Routes, Navigate } from 'react-router-dom';

// Use HashRouter inside Electron (file:// protocol), BrowserRouter on the web
const Router = (typeof window !== 'undefined' && window.datrena?.isElectron) ? HashRouter : BrowserRouter;
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { PlanProvider } from '@/lib/PlanContext';
import { useSecretAccess } from '@/hooks/useSecretAccess';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import QuantHome from './pages/QuantHome';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import ForgeLabs from './pages/ForgeLabs';
import GithubPRs from './pages/GithubPRs';
import DataLayer from './pages/DataLayer';
import Checkout from './pages/Checkout';
import SignIn from './pages/SignIn';
import Backtesting from './pages/Backtesting';
import Download from './pages/Download';
import Activation from './pages/Activation';
import { LicenseProvider, useLicense } from '@/lib/LicenseContext';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Inside Electron, the very first thing the user sees is the Activation screen
// (email-based sign-in). Once they've signed in, the email persists via
// localStorage and they go straight to the app on subsequent launches.
const ElectronGate = ({ children }) => {
  const { email, isElectron } = useLicense();
  if (isElectron && !email) return <Activation />;
  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user } = useAuth();
  const { isAdmin } = useSecretAccess();

  // Treat admin as authenticated
  const isAuthenticated = !!user || isAdmin;

  // Show loading spinner while checking app public settings or auth
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
      <Route path="/" element={<Landing />} />
      <Route path="/Home" element={<Landing />} />
      <Route path="/Pricing" element={<Pricing />} />
      <Route path="/Features" element={<Features />} />
      <Route path="/ForgeLabs" element={<ForgeLabs />} />
      <Route path="/GithubPRs" element={<GithubPRs />} />
      <Route path="/DataLayer" element={<DataLayer />} />
      <Route path="/Checkout" element={<Checkout />} />
      <Route path="/SignIn" element={<SignIn />} />
      <Route path="/Backtesting" element={<Backtesting />} />
      <Route path="/Download" element={<Download />} />

      {/* Authenticated routes — accessible via login OR Shift+Z */}
      {isAuthenticated ? (
        <>
          <Route path="/QuantHome" element={<QuantHome />} />
          <Route path="/Pricing" element={<Pricing />} />
          {Object.entries(Pages).map(([path, Page]) => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              }
            />
          ))}
        </>
      ) : (
        <>
          <Route path="/QuantHome" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}

      {/* Handle user not registered error */}
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
        <LicenseProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ElectronGate>
              <AuthenticatedApp />
            </ElectronGate>
          </Router>
          <Toaster />
        </QueryClientProvider>
        </LicenseProvider>
      </PlanProvider>
    </AuthProvider>
  )
}

export default App