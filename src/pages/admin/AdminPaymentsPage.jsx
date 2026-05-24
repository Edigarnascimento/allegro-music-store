import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrencyBRL } from '../../lib/orderFormatters';
import { getAdminPayments } from '../../services/paymentsService';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    getAdminPayments().then(setPayments);
  }, []);

  const filtered = useMemo(() => payments.filter((p) => statusFilter === 'todos' || p.status === statusFilter), [payments, statusFilter]);

  return (
    <section className="admin-page">
      <h1>Pagamentos</h1>
      <div className="admin-filters">
        <label>
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="expirado">Expirado</option>
            <option value="cancelado">Cancelado</option>
            <option value="erro">Erro</option>
          </select>
        </label>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Data</th><th>Pedido</th><th>Cliente</th><th>Valor</th><th>Método</th><th>Gateway</th><th>Status</th><th>Pago em</th><th /></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.created_at).toLocaleString('pt-BR')}</td>
                <td>#{String(p.pedido_id || '').slice(0, 8)}</td>
                <td>{p.music_pedidos?.cliente_nome || 'Não informado'}</td>
                <td>{formatCurrencyBRL(Number(p.valor || 0))}</td>
                <td>{(p.metodo || 'pix').toUpperCase()}</td>
                <td>{p.gateway || 'asaas'}</td>
                <td><span className={`admin-order-status-badge status-${p.status || 'pendente'}`}>{p.status || 'pendente'}</span></td>
                <td>{p.paid_at ? new Date(p.paid_at).toLocaleString('pt-BR') : '-'}</td>
                <td><Link className="btn-link" to="/admin/pedidos">Abrir pedido</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length ? <p>Nenhum pagamento encontrado para os filtros selecionados.</p> : null}
    </section>
  );
}
