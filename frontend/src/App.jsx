import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Welcome        from './pages/Welcome';
import Pricing        from './pages/Pricing';
import About          from './pages/About';
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import Dashboard  from './pages/Dashboard';
import Bills      from './pages/Bills';
import Payments   from './pages/Payments';
import Savings    from './pages/Savings';
import Reports    from './pages/Reports';
import Settings   from './pages/Settings';
import Onboarding from './pages/Onboarding';

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

// Tracks page views in Google Analytics 4 on every route change.
// Requires VITE_GA_ID to be set. Lazy-loads the gtag script on first render.
function Analytics() {
  const location = useLocation();

  useEffect(() => {
    const GA_ID = import.meta.env.VITE_GA_ID;
    if (!GA_ID) return;

    // Inject gtag script once
    if (!document.getElementById('ga-script')) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());

      const script = document.createElement('script');
      script.id    = 'ga-script';
      script.async = true;
      script.src   = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
    }

    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}

export default function App() {
  return (
    <>
      <Analytics />
      <Routes>
        {/* Public pages */}
        <Route path="/"        element={<Welcome />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about"   element={<About />} />

        {/* Public auth routes */}
        <Route path="/auth/login"           element={<Login />} />
        <Route path="/auth/register"        element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />

        {/* Onboarding (protected, no sidebar layout) */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        {/* Protected app routes */}
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/bills"     element={<Protected><Bills /></Protected>} />
        <Route path="/payments"  element={<Protected><Payments /></Protected>} />
        <Route path="/savings"   element={<Protected><Savings /></Protected>} />
        <Route path="/reports"   element={<Protected><Reports /></Protected>} />
        <Route path="/settings"  element={<Protected><Settings /></Protected>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
