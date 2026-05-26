import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { signOutAdmin, user } = useAdminAuth();

  async function handleLogout() {
    await signOutAdmin();
    navigate('/admin/login');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-sidebar-kicker">Allegro Music Store</p>
          <h2>Painel Admin</h2>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end className="admin-link">Dashboard</NavLink>
          <NavLink to="/admin/produtos" className="admin-link">Produtos</NavLink>
          <NavLink to="/admin/categorias" className="admin-link">Categorias</NavLink>
          <NavLink to="/admin/configuracoes" className="admin-link">Configurações</NavLink>
          <NavLink to="/admin/interesses" className="admin-link">Interesses</NavLink>
          <NavLink to="/admin/pedidos" className="admin-link">Pedidos</NavLink>
          <NavLink to="/admin/pagamentos" className="admin-link">Pagamentos</NavLink>
          <NavLink to="/admin/auditoria" className="admin-link">Auditoria</NavLink>
        </nav>
        {user ? (
          <p className="admin-user-badge" title={user.email || 'Usuário autenticado'}>
            Logado como: {user.user_metadata?.name || user.user_metadata?.full_name || user.email}
          </p>
        ) : null}
        <button className="btn btn-secondary" type="button" onClick={handleLogout}>Sair</button>
      </aside>
      <section className="admin-content">
        <header className="admin-header-panel">
          <strong>Gestão da loja</strong>
          <span>Visual moderno, operações seguras.</span>
        </header>
        <Outlet />
      </section>
    </div>
  );
}
