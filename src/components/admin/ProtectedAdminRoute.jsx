import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAdminSession } from '../../services/adminService';

export default function ProtectedAdminRoute() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    getAdminSession()
      .then((session) => setIsAuthenticated(Boolean(session.user)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="container section">Validando sessão...</p>;
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <Outlet />;
}
