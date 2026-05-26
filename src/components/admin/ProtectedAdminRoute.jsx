import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function ProtectedAdminRoute() {
  const { loading, isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (loading) return <p className="container section">Validando sessão...</p>;
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <Outlet />;
}
