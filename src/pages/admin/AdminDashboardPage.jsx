import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardStats } from '../../services/adminService';
import { formatOrderStatus } from '../../lib/orderFormatters';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatCurrency(value) {
  return currency.format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return 'Data não informada';
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getShortOrderId(orderId) {
  if (!orderId) return '--------';
  return String(orderId).slice(0, 8);
}

function EmptyState({ message }) {
  return <p className="admin-empty-state">{message}</p>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminDashboardStats().then(setStats);
  }, []);

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Total em pedidos', value: formatCurrency(stats.cards.totalEmPedidos) },
      { label: 'Pedidos novos', value: stats.cards.pedidosNovos },
      { label: 'Pedidos pagos', value: stats.cards.pedidosPagos },
      { label: 'Pedidos concluídos', value: stats.cards.pedidosConcluidos },
      { label: 'Ticket médio', value: formatCurrency(stats.cards.ticketMedio) },
      { label: 'Total de produtos ativos', value: stats.cards.totalProdutosAtivos },
      { label: 'Produtos com estoque baixo', value: stats.cards.produtosEstoqueBaixo },
      { label: 'Produtos indisponíveis', value: stats.cards.produtosIndisponiveis },
    ];
  }, [stats]);

  if (!stats) return <p>Carregando dashboard...</p>;

  return (
    <div className="admin-page">
      <h1>Dashboard Financeiro e Comercial</h1>
      <p className="admin-page-subtitle">Métricas em tempo real de pedidos, faturamento, estoque e interesses.</p>

      <section className="admin-stats-grid admin-stats-grid-highlight">
        {cards.map((card) => (
          <article key={card.label} className="admin-stat-card admin-stat-card-dark">
            <h3>{card.label}</h3>
            <p>{card.value}</p>
          </article>
        ))}
      </section>

      <section className="admin-page admin-dashboard-quick-actions" aria-label="Ações rápidas">
        <h2>Ações rápidas</h2>
        <div className="admin-dashboard-quick-actions-grid">
          <Link className="admin-dashboard-quick-link" to="/admin/pedidos">Ver pedidos</Link>
          <Link className="admin-dashboard-quick-link" to="/admin/produtos">Ver produtos</Link>
          <Link className="admin-dashboard-quick-link" to="/admin/interesses">Ver interesses</Link>
        </div>
      </section>

      <section className="admin-kpi-grid">
        <article className="admin-page">
          <h2>Indicadores comerciais</h2>
          <div className="admin-kpi-list">
            <div><strong>Produto mais vendido:</strong> {stats.comerciais.produtoMaisVendido}</div>
            <div><strong>Produto mais procurado:</strong> {stats.comerciais.produtoMaisProcurado}</div>
            <div><strong>Total de interesses/WhatsApp:</strong> {stats.comerciais.totalInteressesWhatsapp}</div>
            <div><strong>Pedidos do dia:</strong> {stats.comerciais.pedidosDoDia}</div>
            <div><strong>Faturamento do dia:</strong> {formatCurrency(stats.comerciais.faturamentoDoDia)}</div>
          </div>
        </article>

        <article className="admin-page">
          <h2>Últimos pedidos</h2>
          {stats.listas.ultimosPedidos.length ? (
            <ul className="admin-list admin-orders-preview-list">
              {stats.listas.ultimosPedidos.map((pedido) => (
                <li key={pedido.id} className="admin-orders-preview-item">
                  <div>
                    <p className="admin-orders-preview-title">#{getShortOrderId(pedido.id)} · {pedido.cliente_nome || 'Cliente não informado'}</p>
                    <p className="admin-orders-preview-meta">{formatOrderStatus(pedido.status)} · {formatDate(pedido.created_at)}</p>
                  </div>
                  <div className="admin-orders-preview-side">
                    <strong>{formatCurrency(pedido.total)}</strong>
                    <Link className="admin-action-btn" to="/admin/pedidos">Ver pedido</Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : <EmptyState message="Nenhum pedido registrado até o momento." />}
        </article>
      </section>

      <section className="admin-kpi-grid">
        <article className="admin-page">
          <h2>Produtos com estoque baixo</h2>
          {stats.listas.produtosEstoqueBaixo.length ? (
            <ul className="admin-list">
              {stats.listas.produtosEstoqueBaixo.map((produto) => (
                <li key={produto.id}><span>{produto.nome}</span><strong>{produto.estoque} un.</strong></li>
              ))}
            </ul>
          ) : <EmptyState message="Nenhum produto com estoque baixo." />}
        </article>

        <article className="admin-page">
          <h2>Produtos indisponíveis</h2>
          {stats.listas.produtosIndisponiveis.length ? (
            <ul className="admin-list">
              {stats.listas.produtosIndisponiveis.map((produto) => (
                <li key={produto.id}><span>{produto.nome}</span><strong>Indisponível</strong></li>
              ))}
            </ul>
          ) : <EmptyState message="Nenhum produto indisponível no momento." />}
        </article>
      </section>

      <section className="admin-kpi-grid">
        <article className="admin-page">
          <h2>Produtos mais vendidos</h2>
          {stats.listas.produtosMaisVendidos.length ? (
            <ul className="admin-list">
              {stats.listas.produtosMaisVendidos.map((item) => (
                <li key={item.produto}><span>{item.produto}</span><strong>{item.quantidade} vendas</strong></li>
              ))}
            </ul>
          ) : <EmptyState message="Sem vendas registradas para gerar ranking." />}
        </article>

        <article className="admin-page">
          <h2>Produtos mais clicados/interessados</h2>
          {stats.listas.produtosMaisInteressados.length ? (
            <ul className="admin-list">
              {stats.listas.produtosMaisInteressados.map((item) => (
                <li key={item.produto}><span>{item.produto}</span><strong>{item.interesses} interesses</strong></li>
              ))}
            </ul>
          ) : <EmptyState message="Sem interesses registrados para ranking." />}
        </article>
      </section>
    </div>
  );
}
