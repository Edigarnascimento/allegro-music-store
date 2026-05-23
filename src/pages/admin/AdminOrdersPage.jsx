import { useEffect, useState } from 'react';
import { formatPriceBRL } from '../../lib/whatsapp';
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

const getValueOrFallback = (value) => {
  if (value === null || value === undefined) return 'Não informado';
  if (typeof value === 'string' && value.trim() === '') return 'Não informado';
  return value;
};

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
                <td>{o.cliente_nome}</td>
                <td>{o.cliente_whatsapp}</td>
                <td>{formatPriceBRL(o.total || 0)}</td>
                <td>
                  <select
                    value={o.status || 'novo'}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{o.forma_pagamento}</td>
                <td>{o.forma_entrega}</td>
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
        <div className="admin-page" style={{ marginTop: '1rem' }}>
          <h2>Pedido {selected.id.slice(0, 8)}</h2>

          <p>
            <strong>Nome do cliente:</strong>{' '}
            {getValueOrFallback(selected.cliente_nome)}
          </p>
          <p>
            <strong>WhatsApp:</strong>{' '}
            {getValueOrFallback(selected.cliente_whatsapp)}
          </p>
          <p>
            <strong>E-mail:</strong> {getValueOrFallback(selected.cliente_email)}
          </p>
          <p>
            <strong>Endereço de entrega:</strong>{' '}
            {getValueOrFallback(selected.endereco_entrega)}
          </p>
          <p>
            <strong>Forma de entrega:</strong>{' '}
            {getValueOrFallback(selected.forma_entrega)}
          </p>
          <p>
            <strong>Forma de pagamento:</strong>{' '}
            {getValueOrFallback(selected.forma_pagamento)}
          </p>
          <p>
            <strong>Observações:</strong> {getValueOrFallback(selected.observacoes)}
          </p>

          <p>
            <strong>Itens do pedido:</strong>
          </p>
          {items.length ? (
            <ul>
              {items.map((it) => (
                <li key={it.id}>
                  {getValueOrFallback(it.produto_nome)} · {it.quantidade} x{' '}
                  {formatPriceBRL(it.preco_unitario)} ={' '}
                  {formatPriceBRL(it.subtotal)}
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
