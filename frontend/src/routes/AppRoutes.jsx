import { Routes, Route, Navigate } from 'react-router-dom';
import OrderHistory from '../pages/OrderHistory/OrderHistory';
import Auth from '../pages/Auth/Auth';
import Dashboard from "../pages/Dashboard/dashboard";
import PaymentCallback from "../pages/payment/PaymentCallback";
import NotFound from "../pages/Notfound/notfound";

function AppRoutes() {
  return (
    <Routes>

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* Authentication */}
      <Route
        path="/auth/login"
        element={<Auth />}
      />

      <Route
        path="/auth/signup"
        element={<Auth />}
      />

      <Route
        path="/auth/forgot-password"
        element={<Auth />}
      />

      <Route
        path="/auth/otp"
        element={<Auth />}
      />

      <Route
        path="/auth/reset-password"
        element={<Auth />}
      />

      <Route
        path="/auth/success"
        element={<Auth />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/order-history"
        element={<OrderHistory />}
      />

      <Route
        path="/payment/callback"
        element={<PaymentCallback />}
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default AppRoutes;