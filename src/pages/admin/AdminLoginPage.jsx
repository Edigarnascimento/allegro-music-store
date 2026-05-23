import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInAdmin } from '../../services/adminService';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await signInAdmin(form);
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section container admin-login">
      <div className="admin-login-card">
        <p className="admin-sidebar-kicker">Acesso seguro</p>
        <h1>Login administrativo</h1>
        <p className="subtitle">Use sua conta Supabase Auth para acessar o painel.</p>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>E-mail<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Senha<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" className="btn" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
      </div>
    </section>
  );
}
