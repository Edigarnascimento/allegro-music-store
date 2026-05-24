import { useEffect, useState } from 'react';
import { getAuditLogsByType } from '../../services/auditService';

const filterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Produto', value: 'produto' },
  { label: 'Pedido', value: 'pedido' },
  { label: 'Estoque', value: 'estoque' },
  { label: 'Configurações', value: 'configuracoes' },
];

export default function AdminAuditPage() {
  const [tipo, setTipo] = useState('all');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      const data = await getAuditLogsByType(tipo);
      setLogs(data);
      setLoading(false);
    }

    loadLogs();
  }, [tipo]);

  return (
    <section className="admin-page">
      <div className="section-heading with-action">
        <h1>Auditoria</h1>
      </div>
      <p className="admin-page-subtitle">Acompanhe alterações importantes do sistema e painel administrativo.</p>

      <div className="admin-audit-filters">
        <label>
          Tipo
          <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Usuário</th>
              <th>Tipo</th>
              <th>Ação</th>
              <th>Descrição</th>
              <th>Origem</th>
            </tr>
          </thead>
          <tbody>
            {!loading && logs.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="admin-empty-state">Nenhum evento de auditoria encontrado para este filtro.</div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                  <td>{log.usuario_email || 'Sistema'}</td>
                  <td>{log.tipo || '-'}</td>
                  <td>{log.acao || '-'}</td>
                  <td>{log.descricao || '-'}</td>
                  <td>{log.origem || 'admin'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
