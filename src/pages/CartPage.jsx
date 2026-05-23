import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatPriceBRL } from '../lib/whatsapp';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

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
          <strong>Total: {formatPriceBRL(subtotal)}</strong>
          <div className="cart-cta-group">
            <Link className="btn btn-secondary" to="/catalogo">Continuar comprando</Link>
            <button className="btn" onClick={() => navigate('/checkout')}>Finalizar pedido</button>
          </div>
        </div>
      </div>
    </section>
  );
}
