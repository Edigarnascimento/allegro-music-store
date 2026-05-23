import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOutAdmin } from '../../services/adminService';

export default function AdminLayout() {
  const navigate = useNavigate();

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
        </nav>
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
