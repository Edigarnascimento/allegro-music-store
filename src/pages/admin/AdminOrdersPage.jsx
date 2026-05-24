import { useEffect, useRef, useState } from 'react';
import { WhatsAppIcon } from '../../components/PublicButtonIcons';
import { buildWhatsAppLink } from '../../lib/whatsapp';
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

const statusMessages = {
  novo: 'Olá, recebemos seu pedido #{orderCode}. Em breve nossa equipe fará a conferência.',
  aguardando_pagamento: 'Olá, seu pedido #{orderCode} está aguardando confirmação de pagamento. Caso tenha pago via PIX, envie o comprovante por aqui.',
  pago: 'Olá, pagamento do pedido #{orderCode} confirmado. Vamos dar andamento à separação do produto.',
  em_atendimento: 'Olá, seu pedido #{orderCode} está em atendimento.',
  enviado: 'Olá, seu pedido #{orderCode} saiu para entrega.',
  concluido: 'Olá, seu pedido #{orderCode} foi concluído. Agradecemos pela preferência.',
  cancelado: 'Olá, seu pedido #{orderCode} foi cancelado. Em caso de dúvida, fale conosco por aqui.',
};

function buildStatusMessage(order) {
  const orderCode = order.id.slice(0, 8);
  const template = statusMessages[order.status || 'novo'] || statusMessages.novo;
  return template.replace('#{orderCode}', orderCode);
}

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
  const detailsRef = useRef(null);

  useEffect(() => {
    getAdminOrders().then(setOrders);
  }, []);

  async function open(order) {
    setSelected(order);
    setItems(await getOrderItems(order.id));
  }

  useEffect(() => {
    if (!selected || !detailsRef.current) return;

    requestAnimationFrame(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [selected]);

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
              <th>PIX auto</th>
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
                <td>
                  {o.music_pagamentos?.length ? (
                    <div>
                      <div className={`admin-order-status-badge status-${o.music_pagamentos[0]?.status || 'pendente'}`}>
                        {o.music_pagamentos[0]?.status || 'pendente'}
                      </div>
                      <small>{o.music_pagamentos[0]?.gateway || 'asaas'}</small>
                    </div>
                  ) : 'Sem vínculo'}
                </td>
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
        <div
          ref={detailsRef}
          className="admin-page admin-order-details"
          style={{ marginTop: '1rem' }}
        >
          <h2>Pedido #{selected.id.slice(0, 8)}</h2>

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
            <strong>CPF/CNPJ:</strong> {getFormattedValueOrFallback(selected.cliente_documento)}
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
          <a
            className="btn btn-whatsapp"
            href={buildWhatsAppLink(selected.cliente_whatsapp, buildStatusMessage(selected))}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon />
            <span>Enviar atualização pelo WhatsApp</span>
          </a>
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
