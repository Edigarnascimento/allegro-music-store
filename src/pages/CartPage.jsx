import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatPriceBRL } from '../lib/whatsapp';
import { trackEvent } from '../services/analyticsService';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('click_cart', { origem: 'cart_page_access' });
  }, []);

  function goToCheckout(source) {
    trackEvent('click_checkout', { origem: source });
    navigate('/checkout');
  }

  if (!items.length) {
    return (
      <section className="container section">
        <div className="cart-shell cart-empty-state">
          <h1>Carrinho vazio</h1>
          <p className="subtitle">Você ainda não adicionou itens. Explore o catálogo para montar seu pedido.</p>
          <Link className="btn" to="/catalogo">Ver produtos</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container section">
      <div className="cart-shell">
        <h1>Seu carrinho</h1>
        <p className="subtitle">Revise os itens, ajuste quantidades e finalize quando quiser.</p>
        <div className="cart-cta-group cart-cta-top">
          <button className="btn" onClick={() => goToCheckout('cart_top')}>Finalizar compra</button>
          <Link className="btn btn-secondary" to="/catalogo">Continuar comprando</Link>
        </div>
        {feedback ? <p className="admin-alert error">{feedback}</p> : null}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produto</th><th>Preço</th><th>Qtd</th><th>Subtotal</th><th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{formatPriceBRL(item.preco)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max={Number.isFinite(Number(item.estoque)) ? Number(item.estoque) : undefined}
                      value={item.quantidade}
                      onChange={(e) => {
                        const result = updateQuantity(item.id, e.target.value);
                        if (!result?.ok) setFeedback(result.message);
                        else setFeedback('');
                      }}
                      style={{ width: 70 }}
                    />
                  </td>
                  <td>{formatPriceBRL(item.preco * item.quantidade)}</td>
                  <td><button className="btn-link" onClick={() => removeFromCart(item.id)}>Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="catalog-highlight cart-summary-actions">
          <div>
            <strong>Total: {formatPriceBRL(subtotal)}</strong>
            <p className="subtitle">Itens: {items.length} • Quantidade total: {items.reduce((acc, item) => acc + item.quantidade, 0)} • Próximo passo: finalizar compra.</p>
          </div>
          <div className="cart-cta-group">
            <Link className="btn btn-secondary" to="/catalogo">Continuar comprando</Link>
            <button className="btn" onClick={() => goToCheckout('cart_top')}>Finalizar compra</button>
          </div>
        </div>
      </div>
    </section>
  );
}
