import { useEffect, useState } from 'react';
import { getAdminDashboardStats } from '../../services/adminService';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => { getAdminDashboardStats().then(setStats); }, []);

  if (!stats) return <p>Carregando dashboard...</p>;

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>
      <p className="admin-page-subtitle">Visão geral da operação da loja em tempo real.</p>
      <div className="admin-stats-grid">
        <article className="admin-stat-card"><h3>Total de produtos</h3><p>{stats.totalProdutos}</p></article>
        <article className="admin-stat-card"><h3>Produtos ativos</h3><p>{stats.produtosAtivos}</p></article>
        <article className="admin-stat-card"><h3>Em destaque</h3><p>{stats.produtosDestaque}</p></article>
        <article className="admin-stat-card"><h3>Categorias</h3><p>{stats.totalCategorias}</p></article>
      </div>
    </div>
  );
}
