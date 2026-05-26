import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAdminSession, onAdminAuthStateChange, signInAdmin, signOutAdmin } from '../services/adminService';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getAdminSession()
      .then((session) => {
        if (mounted) setUser(session.user ?? null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const unsubscribe = onAdminAuthStateChange((nextUser) => {
      if (mounted) {
        setUser(nextUser ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    signInAdmin,
    signOutAdmin,
  }), [user, loading]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider.');
  }
  return context;
}
