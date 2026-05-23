import { useEffect, useState } from 'react';
import {
  formatCurrencyBRL,
  formatDeliveryMethod,
  formatOrderStatus,
  formatPaymentMethod,
  getFormattedValueOrFallback,
} from '../../lib/orderFormatters';
import {
  getAdminOrders,
  getOrderItems,
  updateOrderStatus,
} from '../../services/ordersService';

const statuses = [
  'novo',
  'em_atendimento',
  'aguardando_pagamento',
  'pago',
  'enviado',
  'concluido',
  'cancelado',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    getAdminOrders().then(setOrders);
  }, []);

  async function open(order) {
    setSelected(order);
    setItems(await getOrderItems(order.id));
  }

  async function changeStatus(orderId, status) {
    await updateOrderStatus(orderId, status);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    if (selected?.id === orderId) setSelected((p) => ({ ...p, status }));
  }

  return (
    <section className="admin-page">
      <h1>Pedidos</h1>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>WhatsApp</th>
              <th>Total</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Entrega</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{new Date(o.created_at).toLocaleString('pt-BR')}</td>
                <td>{getFormattedValueOrFallback(o.cliente_nome)}</td>
                <td>{getFormattedValueOrFallback(o.cliente_whatsapp)}</td>
                <td>{formatCurrencyBRL(o.total || 0)}</td>
                <td>
                  <div className={`admin-order-status-badge status-${o.status || 'novo'}`}>
                    {formatOrderStatus(o.status)}
                  </div>
                  <select
                    value={o.status || 'novo'}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {formatOrderStatus(s)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{formatPaymentMethod(o.forma_pagamento)}</td>
                <td>{formatDeliveryMethod(o.forma_entrega)}</td>
                <td>
                  <button className="btn-link" onClick={() => open(o)}>
                    Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="admin-page admin-order-details" style={{ marginTop: '1rem' }}>
          <h2>Pedido {selected.id.slice(0, 8)}</h2>

          <div className={`admin-order-status-badge status-${selected.status || 'novo'}`}>
            {formatOrderStatus(selected.status)}
          </div>

          <p>
            <strong>Nome do cliente:</strong>{' '}
            {getFormattedValueOrFallback(selected.cliente_nome)}
          </p>
          <p>
            <strong>WhatsApp:</strong>{' '}
            {getFormattedValueOrFallback(selected.cliente_whatsapp)}
          </p>
          <p>
            <strong>E-mail:</strong> {getFormattedValueOrFallback(selected.cliente_email)}
          </p>
          <p>
            <strong>Endereço de entrega:</strong>{' '}
            {getFormattedValueOrFallback(selected.endereco_entrega)}
          </p>
          <p>
            <strong>Forma de entrega:</strong>{' '}
            {formatDeliveryMethod(selected.forma_entrega)}
          </p>
          <p>
            <strong>Forma de pagamento:</strong>{' '}
            {formatPaymentMethod(selected.forma_pagamento)}
          </p>
          <p>
            <strong>Observações:</strong> {getFormattedValueOrFallback(selected.observacoes)}
          </p>

          <p>
            <strong>Itens do pedido:</strong>
          </p>
          {items.length ? (
            <ul>
              {items.map((it) => (
                <li key={it.id}>
                  {getFormattedValueOrFallback(it.produto_nome)} · {it.quantidade} x{' '}
                  {formatCurrencyBRL(it.preco_unitario)} ={' '}
                  {formatCurrencyBRL(it.subtotal)}
                </li>
              ))}
            </ul>
          ) : (
            <p>Não informado</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
