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
        <h2>Painel Allegro</h2>
        <nav>
          <NavLink to="/admin" end className="admin-link">Dashboard</NavLink>
          <NavLink to="/admin/produtos" className="admin-link">Produtos</NavLink>
          <NavLink to="/admin/categorias" className="admin-link">Categorias</NavLink>
          <NavLink to="/admin/configuracoes" className="admin-link">Configurações</NavLink>
        </nav>
        <button className="btn btn-secondary" type="button" onClick={handleLogout}>Sair</button>
      </aside>
      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  );
}
