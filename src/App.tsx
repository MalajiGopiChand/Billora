import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Products } from './pages/Products';
import { Customers } from './pages/Customers';
import { CustomerProfile } from './pages/CustomerProfile';
import { CreateBill } from './pages/CreateBill';
import { AllBills } from './pages/AllBills';
import { Landing } from './pages/Landing';
import { Demo } from './pages/Demo';
import { Subscription } from './pages/Subscription';
import { useSubscription } from './context/SubscriptionContext';
import { Admin } from './pages/Admin';
import { ContactUs } from './pages/ContactUs';

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const { loading: subscriptionLoading, hasAccess } = useSubscription();
  if (loading) return <div className="page-loader">Loading your workspace...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (subscriptionLoading) return <div className="page-loader">Checking your subscription...</div>;
  if (!hasAccess) return <Navigate to="/subscription" replace />;
  return <AppLayout />;
}

function AuthenticatedOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/" replace />;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const { hasAccess, loading: subLoading } = useSubscription();
  if (loading || subLoading) return <div className="page-loader">Loading...</div>;
  if (user) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (hasAccess) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/subscription" replace />;
  }
  return <>{children}</>;
}

function PublicOrUnsubscribed({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const { hasAccess, loading: subLoading } = useSubscription();
  if (loading || subLoading) return <div className="page-loader">Loading...</div>;
  return user && hasAccess ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <>{children}</>;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
    <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
    <Route path="/subscription" element={<AuthenticatedOnly><Subscription /></AuthenticatedOnly>} />
    <Route path="/demo" element={<Demo />} />
    <Route element={<ProtectedRoutes />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-bill" element={<CreateBill />} />
      <Route path="/all-bills" element={<AllBills />} />
      <Route path="/products" element={<Products />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:customerId" element={<CustomerProfile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} />
    </Route>
    <Route path="/" element={<PublicOrUnsubscribed><Landing /></PublicOrUnsubscribed>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
