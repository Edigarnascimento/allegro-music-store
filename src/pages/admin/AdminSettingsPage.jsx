import { useEffect, useRef, useState } from 'react';
import { getAdminStoreSettings, updateAdminStoreSettings, uploadStoreLogo } from '../../services/adminService';

const acceptedLogoTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

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
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

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

  async function handleLogoSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setStatus({ type: '', message: '' });

    if (!acceptedLogoTypes.includes(file.type)) {
      setStatus({ type: 'error', message: 'Selecione uma logo em PNG, JPG/JPEG, WEBP ou SVG.' });
      return;
    }

    setIsUploadingLogo(true);

    try {
      const logoUrl = await uploadStoreLogo(file);
      setForm((current) => ({ ...current, logo_url: logoUrl }));
      setStatus({ type: 'success', message: 'Logo enviada. Salve as configurações para publicar a alteração.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Falha ao enviar logo. Tente novamente.' });
    } finally {
      setIsUploadingLogo(false);
    }
  }

  function handleRemoveLogo() {
    setForm((current) => ({ ...current, logo_url: '' }));
    setStatus({ type: 'success', message: 'Logo removida do formulário. Salve as configurações para voltar ao ícone musical padrão.' });
  }

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
        message: `Falha ao salvar configurações da loja. ${(error && error.message) || 'Tente novamente em instantes.'}`,
      });
    } finally {
      setIsSaving(false);
    }
  }

  const hasLogo = Boolean(form.logo_url);
  const disableSave = isSaving || isUploadingLogo;

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

        <section className="admin-logo-field" aria-labelledby="store-logo-title">
          <div>
            <h2 id="store-logo-title">Logo da loja</h2>
            <p>Prefira PNG com fundo transparente. Tamanho ideal: quadrado ou horizontal pequeno.</p>
          </div>

          <div className="admin-logo-actions">
            <input
              ref={fileInputRef}
              className="admin-logo-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoSelect}
            />
            <button className="btn" type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingLogo || isSaving}>
              {isUploadingLogo ? 'Enviando logo...' : 'Escolher logo'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={handleRemoveLogo} disabled={!hasLogo || isUploadingLogo || isSaving}>
              Remover logo
            </button>
          </div>

          <label>URL da logo (opcional)
            <input
              value={form.logo_url || ''}
              placeholder="https://..."
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            />
          </label>

          {hasLogo ? (
            <div className="admin-logo-preview">
              <p>Pré-visualização da logo atual:</p>
              <img src={form.logo_url} alt="Pré-visualização da logo da loja" />
            </div>
          ) : (
            <div className="admin-logo-empty-preview" aria-label="Sem logo configurada">
              <span aria-hidden="true">♫</span>
              <p>Sem logo configurada. O site usará o ícone musical padrão.</p>
            </div>
          )}
        </section>

        <label>Chave PIX<input value={form.chave_pix || ''} onChange={(e) => setForm({ ...form, chave_pix: e.target.value })} /></label>
        <label>Nome do recebedor PIX<input value={form.nome_recebedor_pix || ''} onChange={(e) => setForm({ ...form, nome_recebedor_pix: e.target.value })} /></label>
        <label>Banco PIX (opcional)<input value={form.banco_pix || ''} onChange={(e) => setForm({ ...form, banco_pix: e.target.value })} /></label>
        <label>Instruções PIX<textarea value={form.instrucoes_pix || ''} onChange={(e) => setForm({ ...form, instrucoes_pix: e.target.value })} /></label>
        <label>Texto do rodapé<textarea value={form.footer_text || ''} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} /></label>
        <label>Horário de atendimento - linha 1<input value={form.atendimento_linha_1 || ''} onChange={(e) => setForm({ ...form, atendimento_linha_1: e.target.value })} /></label>
        <label>Horário de atendimento - linha 2<input value={form.atendimento_linha_2 || ''} onChange={(e) => setForm({ ...form, atendimento_linha_2: e.target.value })} /></label>
        <label>Aviso de pagamento no rodapé<textarea value={form.footer_payment_notice || ''} onChange={(e) => setForm({ ...form, footer_payment_notice: e.target.value })} /></label>
        <label>Texto do link WhatsApp<input value={form.footer_whatsapp_label || ''} onChange={(e) => setForm({ ...form, footer_whatsapp_label: e.target.value })} /></label>
        <button className="btn" type="submit" disabled={disableSave}>{isSaving ? 'Salvando...' : 'Salvar'}</button>
      </form>
    </div>
  );
}
