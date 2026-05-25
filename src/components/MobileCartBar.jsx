import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function MobileCartBar() {
  const { totalItems } = useCart();

  if (!totalItems) return null;

  return (
    <div className="mobile-cart-bar" role="status" aria-live="polite">
      <p>Você tem {totalItems} item(ns) no carrinho</p>
      <Link to="/carrinho" className="btn">Ver carrinho</Link>
      <Link to="/checkout" className="btn btn-secondary">Finalizar compra</Link>
    </div>
  );
}
