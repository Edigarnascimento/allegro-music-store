import { useEffect, useRef, useState } from 'react';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { formatCurrencyBRL, formatDeliveryMethod, formatOrderStatus, formatPaymentMethod, getFormattedValueOrFallback } from '../lib/orderFormatters';
import { getPublicOrderStatus } from '../services/ordersService';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';

export default function TrackOrderPage() {
  const storeWhatsappNumber = useStoreWhatsappNumber();
  const [orderCode, setOrderCode] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [error]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await getPublicOrderStatus(orderCode, customerWhatsapp);
      if (!data) {
        setError('Pedido não encontrado. Confira o número do pedido e o WhatsApp informado.');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Pedido não encontrado. Confira o número do pedido e o WhatsApp informado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container section">
      <h1>Acompanhar pedido</h1>
      <p className="subtitle">Informe o número do pedido (curto ou completo) e o WhatsApp usado na compra.</p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <input required value={orderCode} onChange={(e) => setOrderCode(e.target.value)} placeholder="Número do pedido" />
        <input required value={customerWhatsapp} onChange={(e) => setCustomerWhatsapp(e.target.value)} placeholder="WhatsApp usado no pedido" />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Consultando...' : 'Consultar pedido'}</button>
      </form>

      {error ? <p ref={errorRef} className="admin-alert error" style={{ marginTop: '1rem' }}>{error}</p> : null}

      {result ? (
        <div ref={resultRef} className="hero-panel" style={{ marginTop: '1rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '.2rem' }}>Resultado do pedido</h2>
          <p style={{ marginTop: 0 }}><strong>Pedido:</strong> #{result.short_id || result.id?.slice(0, 8)}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span style={{ fontWeight: 700, color: '#134e4a', backgroundColor: '#ccfbf1', padding: '.15rem .5rem', borderRadius: '999px' }}>
              {formatOrderStatus(result.status)}
            </span>
          </p>
          <p><strong>Cliente:</strong> {getFormattedValueOrFallback(result.cliente_nome)}</p>
          <p><strong>Forma de pagamento:</strong> {formatPaymentMethod(result.forma_pagamento)}</p>
          <p><strong>Forma de entrega:</strong> {formatDeliveryMethod(result.forma_entrega)}</p>
          <p><strong>Total:</strong> {formatCurrencyBRL(result.total)}</p>
          <p><strong>Data do pedido:</strong> {new Date(result.created_at).toLocaleString('pt-BR')}</p>
          <p><strong>Observações:</strong> {getFormattedValueOrFallback(result.observacoes)}</p>

          <p><strong>Itens do pedido:</strong></p>
          {Array.isArray(result.items) && result.items.length ? (
            <ul>
              {result.items.map((item, index) => (
                <li key={`${item.produto_id || item.produto_nome}-${index}`}>
                  {item.quantidade}x {item.produto_nome} · {formatCurrencyBRL(item.preco_unitario)}
                </li>
              ))}
            </ul>
          ) : <p>Não informado.</p>}

          <p className="admin-alert" style={{ marginTop: '.8rem' }}>
            Se o pagamento foi via PIX, envie o comprovante pelo WhatsApp da loja para validação.
          </p>

          <a className="btn btn-whatsapp" href={buildWhatsAppLink(storeWhatsappNumber, `Olá! Quero ajuda com o pedido #${result.short_id || result.id?.slice(0, 8)}.`)} target="_blank" rel="noreferrer">
            Falar com a loja no WhatsApp
          </a>
        </div>
      ) : null}
    </section>
  );
}
