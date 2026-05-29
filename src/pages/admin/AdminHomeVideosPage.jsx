import { useEffect, useMemo, useState } from 'react';
import {
  createAdminHomeVideo,
  deleteAdminHomeVideo,
  getAdminHomeVideos,
  seedDefaultAdminHomeVideos,
  updateAdminHomeVideo,
} from '../../services/adminService';

const emptyForm = {
  titulo: '',
  categoria: '',
  descricao: '',
  video_url: '',
  botao_texto: 'Ver produtos',
  botao_link: '/catalogo',
  whatsapp_mensagem: '',
  ordem: 0,
  ativo: true,
};

function toFormValues(card = emptyForm) {
  return {
    titulo: card.titulo || '',
    categoria: card.categoria || '',
    descricao: card.descricao || '',
    video_url: card.video_url || '',
    botao_texto: card.botao_texto || 'Ver produtos',
    botao_link: card.botao_link || '/catalogo',
    whatsapp_mensagem: card.whatsapp_mensagem || '',
    ordem: Number.isFinite(Number(card.ordem)) ? Number(card.ordem) : 0,
    ativo: card.ativo ?? true,
  };
}

export default function AdminHomeVideosPage() {
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const editingCard = useMemo(() => cards.find((card) => String(card.id) === String(editingId)), [cards, editingId]);

  async function loadCards() {
    setIsLoading(true);
    try {
      setCards(await getAdminHomeVideos());
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível carregar os cards.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCards();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setEditingId('');
    setForm(emptyForm);
  }

  function startCreate() {
    resetForm();
    setStatus({ type: '', message: '' });
  }

  function startEdit(card) {
    setEditingId(card.id);
    setForm(toFormValues(card));
    setStatus({ type: '', message: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      setStatus({ type: '', message: '' });
      if (editingId) {
        await updateAdminHomeVideo(editingId, form);
        setStatus({ type: 'success', message: 'Card atualizado com sucesso.' });
      } else {
        await createAdminHomeVideo(form);
        setStatus({ type: 'success', message: 'Card criado com sucesso.' });
      }
      resetForm();
      await loadCards();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível salvar o card.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(card) {
    try {
      setStatus({ type: '', message: '' });
      await updateAdminHomeVideo(card.id, { ...card, ativo: !(card.ativo ?? true) });
      await loadCards();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível alterar o status do card.' });
    }
  }

  async function updateOrder(card, ordem) {
    try {
      setStatus({ type: '', message: '' });
      await updateAdminHomeVideo(card.id, { ...card, ordem });
      await loadCards();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível alterar a ordem do card.' });
    }
  }

  async function removeCard(card) {
    if (!window.confirm(`Excluir o card "${card.titulo}"?`)) return;

    try {
      setStatus({ type: '', message: '' });
      await deleteAdminHomeVideo(card.id);
      if (String(editingId) === String(card.id)) resetForm();
      setStatus({ type: 'success', message: 'Card excluído com sucesso.' });
      await loadCards();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível excluir o card.' });
    }
  }

  async function seedDefaults() {
    try {
      setIsSaving(true);
      setStatus({ type: '', message: '' });
      await seedDefaultAdminHomeVideos();
      setStatus({ type: 'success', message: 'Cards iniciais criados com sucesso.' });
      await loadCards();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível criar os cards iniciais.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-page admin-home-videos-page">
      <div className="admin-page-title-row">
        <div>
          <h1>Chegou na Allegro</h1>
          <p className="admin-page-subtitle">Cadastre os cards exibidos na seção de novidades da página inicial.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={startCreate}>Novo card</button>
      </div>

      {status.message ? (
        <p role="alert" className={`admin-alert ${status.type === 'error' ? 'error' : 'success'}`}>
          {status.message}
        </p>
      ) : null}

      <div className="admin-home-videos-layout">
        <form className="admin-form admin-home-video-form" onSubmit={handleSubmit}>
          <h2>{editingId ? `Editando: ${editingCard?.titulo || 'card'}` : 'Novo card'}</h2>
          <label>Título<input value={form.titulo} onChange={(e) => updateForm('titulo', e.target.value)} required /></label>
          <label>Categoria/etiqueta<input value={form.categoria} onChange={(e) => updateForm('categoria', e.target.value)} placeholder="Cordas, Acessórios, Luteria..." /></label>
          <label>Descrição<textarea value={form.descricao} onChange={(e) => updateForm('descricao', e.target.value)} rows="3" /></label>
          <label>Link do vídeo<input type="url" value={form.video_url} onChange={(e) => updateForm('video_url', e.target.value)} placeholder="https://www.instagram.com/reel/..." /></label>
          <div className="admin-form-grid-two">
            <label>Texto do botão principal<input value={form.botao_texto} onChange={(e) => updateForm('botao_texto', e.target.value)} placeholder="Ver produtos" /></label>
            <label>Link do botão principal<input value={form.botao_link} onChange={(e) => updateForm('botao_link', e.target.value)} placeholder="/catalogo" /></label>
          </div>
          <label>Mensagem personalizada do WhatsApp<textarea value={form.whatsapp_mensagem} onChange={(e) => updateForm('whatsapp_mensagem', e.target.value)} rows="3" /></label>
          <div className="admin-form-grid-two">
            <label>Ordem<input type="number" value={form.ordem} onChange={(e) => updateForm('ordem', Number(e.target.value))} /></label>
            <label className="admin-checkbox-field"><input type="checkbox" checked={Boolean(form.ativo)} onChange={(e) => updateForm('ativo', e.target.checked)} /> Ativo</label>
          </div>
          <div className="admin-table-actions">
            <button className="btn" type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar card'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={startCreate}>Cancelar edição</button> : null}
          </div>
        </form>

        <aside className="admin-home-video-preview" aria-label="Prévia simples do card">
          <p className="admin-sidebar-kicker">Prévia</p>
          <article className="arrival-video-card">
            <div className="arrival-video-cover">
              <span className="arrival-video-tag">{form.categoria || 'Categoria'}</span>
              <span className="arrival-video-play" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false"><path d="M8 6v12l10-6z" fill="currentColor" /></svg>
              </span>
            </div>
            <div className="arrival-video-content">
              <h3>{form.titulo || 'Título do card'}</h3>
              <p>{form.descricao || 'Descrição do card exibida na página inicial.'}</p>
              <div className="arrival-video-actions">
                {form.video_url ? <a className="btn btn-secondary" href={form.video_url} target="_blank" rel="noopener noreferrer">Assistir vídeo</a> : null}
                <a className="btn btn-secondary" href={form.botao_link || '/catalogo'}>{form.botao_texto || 'Ver produtos'}</a>
                <span className="btn btn-whatsapp">Falar no WhatsApp</span>
              </div>
            </div>
          </article>
        </aside>
      </div>

      <section className="admin-home-videos-list">
        <div className="admin-page-title-row">
          <h2>Cards cadastrados</h2>
          {!cards.length && !isLoading ? <button className="btn" type="button" onClick={seedDefaults} disabled={isSaving}>Popular cards iniciais</button> : null}
        </div>
        {isLoading ? <p>Carregando cards...</p> : null}
        {!isLoading && !cards.length ? <p className="admin-empty-state">Nenhum card cadastrado ainda.</p> : null}
        {cards.map((card) => (
          <article key={card.id} className="admin-home-video-row">
            <div>
              <span className={`admin-pill ${card.ativo ? 'is-success' : 'is-muted'}`}>{card.ativo ? 'Ativo' : 'Inativo'}</span>
              <h3>{card.titulo}</h3>
              <p>{card.categoria ? `${card.categoria} · ` : ''}{card.descricao}</p>
              {card.video_url ? <a href={card.video_url} target="_blank" rel="noopener noreferrer">Abrir vídeo cadastrado</a> : <span className="admin-help-text">Sem vídeo cadastrado</span>}
            </div>
            <div className="admin-home-video-row-actions">
              <label>Ordem<input type="number" value={card.ordem} onChange={(e) => updateOrder(card, Number(e.target.value))} /></label>
              <button className="btn-link" type="button" onClick={() => toggleActive(card)}>{card.ativo ? 'Inativar' : 'Ativar'}</button>
              <button className="btn-link" type="button" onClick={() => startEdit(card)}>Editar</button>
              <button className="btn-link danger" type="button" onClick={() => removeCard(card)}>Excluir</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
