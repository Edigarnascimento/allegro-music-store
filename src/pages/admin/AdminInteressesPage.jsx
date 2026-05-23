import { useEffect, useMemo, useState } from 'react';
import { getAdminInterests } from '../../services/interessesService';

function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
}

function toCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

export default function AdminInteressesPage() {
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    getAdminInterests().then(setInterests);
  }, []);

  const summary = useMemo(() => {
    const total = interests.length;
    const byProduct = interests.reduce((acc, item) => {
      const key = item.produto_nome || 'Produto não informado';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const produtoMaisClicado = Object.entries(byProduct).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
    const today = new Date().toISOString().slice(0, 10);
    const interessesHoje = interests.filter((item) => item.created_at?.slice(0, 10) === today).length;

    return { total, produtoMaisClicado, interessesHoje };
  }, [interests]);

  return (
    <div className="admin-page">
      <h1>Interesses</h1>
      <p className="admin-page-subtitle">Acompanhe os cliques em WhatsApp por produto e origem.</p>

      <div className="admin-stats-grid">
        <article className="admin-stat-card"><h3>Total de interesses</h3><p>{summary.total}</p></article>
        <article className="admin-stat-card"><h3>Produto mais clicado</h3><p style={{ fontSize: '1rem' }}>{summary.produtoMaisClicado}</p></article>
        <article className="admin-stat-card"><h3>Interesses de hoje</h3><p>{summary.interessesHoje}</p></article>
      </div>

      <div className="admin-table-wrap" style={{ marginTop: '1rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Data/hora</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Origem</th>
              <th>WhatsApp destino</th>
            </tr>
          </thead>
          <tbody>
            {interests.length === 0 ? (
              <tr>
                <td colSpan={6}><div className="admin-empty-state">Nenhum interesse registrado até o momento.</div></td>
              </tr>
            ) : (
              interests.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.created_at)}</td>
                  <td>{item.produto_nome || '-'}</td>
                  <td>{item.categoria || '-'}</td>
                  <td>{toCurrency(item.preco)}</td>
                  <td><span className="admin-pill is-muted">{item.origem || '-'}</span></td>
                  <td>{item.whatsapp_destino || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
