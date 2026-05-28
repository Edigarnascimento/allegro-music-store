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
    email: '',
    logo_url: '',
    chave_pix: '',
    nome_recebedor_pix: '',
    banco_pix: '',
    instrucoes_pix: '',
    footer_text: '',
    atendimento_linha_1: '',
    atendimento_linha_2: '',
    footer_payment_notice: '',
    footer_whatsapp_label: '',
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
    <div className="admin-page">
      <h1>Configurações da loja</h1>
      <p className="admin-page-subtitle">Atualize informações institucionais exibidas no site e no atendimento.</p>
      {status.message ? (
        <p role="alert" className={`admin-alert ${status.type === 'error' ? 'error' : 'success'}`}>
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
        <label>E-mail de contato<input type="email" placeholder="contato@allegromusicstore.com.br" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>URL da logo<input value={form.logo_url || ''} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} /></label>
        <label>Chave PIX<input value={form.chave_pix || ''} onChange={(e) => setForm({ ...form, chave_pix: e.target.value })} /></label>
        <label>Nome do recebedor PIX<input value={form.nome_recebedor_pix || ''} onChange={(e) => setForm({ ...form, nome_recebedor_pix: e.target.value })} /></label>
        <label>Banco PIX (opcional)<input value={form.banco_pix || ''} onChange={(e) => setForm({ ...form, banco_pix: e.target.value })} /></label>
        <label>Instruções PIX<textarea value={form.instrucoes_pix || ''} onChange={(e) => setForm({ ...form, instrucoes_pix: e.target.value })} /></label>
        <label>Texto do rodapé<textarea value={form.footer_text || ''} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} /></label>
        <label>Horário de atendimento - linha 1<input value={form.atendimento_linha_1 || ''} onChange={(e) => setForm({ ...form, atendimento_linha_1: e.target.value })} /></label>
        <label>Horário de atendimento - linha 2<input value={form.atendimento_linha_2 || ''} onChange={(e) => setForm({ ...form, atendimento_linha_2: e.target.value })} /></label>
        <label>Aviso de pagamento no rodapé<textarea value={form.footer_payment_notice || ''} onChange={(e) => setForm({ ...form, footer_payment_notice: e.target.value })} /></label>
        <label>Texto do link WhatsApp<input value={form.footer_whatsapp_label || ''} onChange={(e) => setForm({ ...form, footer_whatsapp_label: e.target.value })} /></label>
        <button className="btn" type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</button>
      </form>
    </div>
  );
}
