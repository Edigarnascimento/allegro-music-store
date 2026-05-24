import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTES_TO_RESET = ['/carrinho', '/checkout', '/produto/', '/acompanhar-pedido'];

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (ROUTES_TO_RESET.some((route) => pathname === route || pathname.startsWith(route))) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname]);

  return null;
}
