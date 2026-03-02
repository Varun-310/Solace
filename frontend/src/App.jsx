import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { SettingsProvider } from "./hooks/useSettings";
import Home from "./pages/Home";

// Lazy-loaded pages — only downloaded when navigated to
const About = React.lazy(() => import("./pages/About"));
const Settings = React.lazy(() => import("./pages/Settings"));
const AuthPage = React.lazy(() => import("./pages/Auth"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));

// Loading fallback for lazy routes
const PageLoader = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-bg, #F0EDE8)',
    color: 'var(--color-text-muted, #9A9A9A)',
    fontFamily: 'var(--font-body, Inter, sans-serif)',
    fontSize: '14px'
  }}>
    Loading...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              {/* Hidden admin route — no links point here */}
              <Route path="/s0lace-ctrl" element={<AdminDashboard />} />
            </Routes>
          </Suspense>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
