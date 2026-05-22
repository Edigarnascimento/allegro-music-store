import { useEffect, useState } from 'react';
import { getAdminStoreSettings, updateAdminStoreSettings } from '../../services/adminService';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({});

  useEffect(() => { getAdminStoreSettings().then((data) => setForm(data || {})); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await updateAdminStoreSettings(form);
    alert('Configurações salvas com sucesso.');
  }

  return (
    <div>
      <h1>Configurações da loja</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>Nome da loja<input value={form.storeName || form.nome_loja || ''} onChange={(e) => setForm({ ...form, storeName: e.target.value })} /></label>
        <label>WhatsApp<input value={form.whatsappNumber || ''} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} /></label>
        <label>E-mail de suporte<input type="email" value={form.supportEmail || ''} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} /></label>
        <button className="btn" type="submit">Salvar</button>
      </form>
    </div>
  );
}
