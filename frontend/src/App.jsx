import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Welcome        from './pages/Welcome';
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import Dashboard from './pages/Dashboard';
import Bills     from './pages/Bills';
import Payments  from './pages/Payments';
import Savings   from './pages/Savings';
import Reports   from './pages/Reports';
import Settings  from './pages/Settings';

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public welcome / landing page */}
      <Route path="/"                     element={<Welcome />} />

      {/* Public auth routes */}
      <Route path="/auth/login"           element={<Login />} />
      <Route path="/auth/register"        element={<Register />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />

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
  );
}
