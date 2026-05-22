import { useEffect, useState } from 'react';
import { getAdminStoreSettings, updateAdminStoreSettings } from '../../services/adminService';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    nome_loja: '',
    whatsapp: '',
    instagram: '',
    endereco: '',
    horario_funcionamento: '',
    sobre: '',
    logo_url: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    getAdminStoreSettings()
      .then((data) => {
        setForm((current) => ({
          ...current,
          ...(data || {}),
        }));
      })
      .catch((error) => {
        setStatus({ type: 'error', message: error.message || 'Erro ao carregar configurações.' });
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const saved = await updateAdminStoreSettings(form);
      setForm((current) => ({ ...current, ...(saved || {}) }));
      setStatus({ type: 'success', message: 'Configurações salvas com sucesso.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Falha ao salvar configurações da loja. ${(error && error.message) || 'Tente novamente em instantes.'}` ,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h1>Configurações da loja</h1>
      {status.message ? (
        <p role="alert" style={{ color: status.type === 'error' ? '#dc2626' : '#16a34a', marginBottom: '1rem' }}>
          {status.message}
        </p>
      ) : null}
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>Nome da loja<input value={form.nome_loja || ''} onChange={(e) => setForm({ ...form, nome_loja: e.target.value })} /></label>
        <label>WhatsApp<input value={form.whatsapp || ''} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></label>
        <label>Instagram<input value={form.instagram || ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></label>
        <label>Endereço<input value={form.endereco || ''} onChange={(e) => setForm({ ...form, endereco: e.target.value })} /></label>
        <label>Horário de funcionamento<input value={form.horario_funcionamento || ''} onChange={(e) => setForm({ ...form, horario_funcionamento: e.target.value })} /></label>
        <label>Sobre<textarea value={form.sobre || ''} onChange={(e) => setForm({ ...form, sobre: e.target.value })} /></label>
        <label>URL da logo<input value={form.logo_url || ''} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} /></label>
        <button className="btn" type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</button>
      </form>
    </div>
  );
}
