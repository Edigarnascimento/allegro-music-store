import { useEffect, useState } from 'react';
import { getAdminDashboardStats } from '../../services/adminService';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => { getAdminDashboardStats().then(setStats); }, []);

  if (!stats) return <p>Carregando dashboard...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="admin-stats-grid">
        <article className="feature-card"><h3>Produtos</h3><p>{stats.totalProdutos}</p></article>
        <article className="feature-card"><h3>Ativos</h3><p>{stats.produtosAtivos}</p></article>
        <article className="feature-card"><h3>Destaques</h3><p>{stats.produtosDestaque}</p></article>
        <article className="feature-card"><h3>Categorias</h3><p>{stats.totalCategorias}</p></article>
      </div>
    </div>
  );
}
