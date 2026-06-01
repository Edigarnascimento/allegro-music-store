import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { trackEvent } from '../services/analyticsService';

export default function MobileCartBar() {
  const { totalItems } = useCart();

  if (!totalItems) return null;

  return (
    <div className="mobile-cart-bar" role="status" aria-live="polite">
      <p>Você tem {totalItems} item(ns) no carrinho</p>
      <Link to="/carrinho" className="btn" onClick={() => trackEvent('click_cart', { origem: 'mobile_cart_bar' })}>Ver carrinho</Link>
      <Link to="/checkout" className="btn btn-secondary" onClick={() => trackEvent('click_checkout', { origem: 'mobile_cart_bar' })}>Finalizar compra</Link>
    </div>
  );
}
