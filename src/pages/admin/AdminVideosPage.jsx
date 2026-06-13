import { useEffect, useMemo, useState } from 'react';
import {
  createAdminSiteVideo,
  deleteAdminSiteVideo,
  getAdminSiteVideos,
  updateAdminSiteVideo,
} from '../../services/adminService';
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../../services/siteVideosService';

const emptyForm = {
  titulo: '',
  descricao: '',
  categoria: '',
  video_url: '',
  thumbnail_url: '',
  ordem: 0,
  ativo: true,
};

function toFormValues(video = emptyForm) {
  return {
    titulo: video.titulo || '',
    descricao: video.descricao || '',
    categoria: video.categoria || '',
    video_url: video.video_url || '',
    thumbnail_url: video.thumbnail_url || '',
    ordem: Number.isFinite(Number(video.ordem)) ? Number(video.ordem) : 0,
    ativo: video.ativo ?? true,
  };
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const editingVideo = useMemo(() => videos.find((video) => String(video.id) === String(editingId)), [videos, editingId]);
  const previewThumbnail = form.thumbnail_url || getYouTubeThumbnailUrl(form.video_url);
  const canEmbedPreview = Boolean(getYouTubeEmbedUrl(form.video_url));

  async function loadVideos() {
    setIsLoading(true);
    try {
      setVideos(await getAdminSiteVideos());
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível carregar os vídeos.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
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

  function startEdit(video) {
    setEditingId(video.id);
    setForm(toFormValues(video));
    setStatus({ type: '', message: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      setStatus({ type: '', message: '' });
      if (editingId) {
        await updateAdminSiteVideo(editingId, form);
        setStatus({ type: 'success', message: 'Vídeo atualizado com sucesso.' });
      } else {
        await createAdminSiteVideo(form);
        setStatus({ type: 'success', message: 'Vídeo criado com sucesso.' });
      }
      resetForm();
      await loadVideos();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível salvar o vídeo.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(video) {
    try {
      setStatus({ type: '', message: '' });
      await updateAdminSiteVideo(video.id, { ...video, ativo: !(video.ativo ?? true) });
      await loadVideos();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível alterar o status do vídeo.' });
    }
  }

  async function updateOrder(video, ordem) {
    try {
      setStatus({ type: '', message: '' });
      await updateAdminSiteVideo(video.id, { ...video, ordem });
      await loadVideos();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível alterar a ordem do vídeo.' });
    }
  }

  async function removeVideo(video) {
    if (!window.confirm(`Excluir o vídeo "${video.titulo}"?`)) return;

    try {
      setStatus({ type: '', message: '' });
      await deleteAdminSiteVideo(video.id);
      if (String(editingId) === String(video.id)) resetForm();
      setStatus({ type: 'success', message: 'Vídeo excluído com sucesso.' });
      await loadVideos();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível excluir o vídeo.' });
    }
  }

  return (
    <div className="admin-page admin-site-videos-page">
      <div className="admin-page-title-row">
        <div>
          <h1>Vídeos</h1>
          <p className="admin-page-subtitle">Cadastre vídeos curtos do YouTube para a seção “Vídeos da Allegro” na Home.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={startCreate}>Novo vídeo</button>
      </div>

      {status.message ? <p role="alert" className={`admin-alert ${status.type === 'error' ? 'error' : 'success'}`}>{status.message}</p> : null}

      <div className="admin-home-videos-layout">
        <form className="admin-form admin-home-video-form" onSubmit={handleSubmit}>
          <h2>{editingId ? `Editando: ${editingVideo?.titulo || 'vídeo'}` : 'Novo vídeo'}</h2>
          <label>Título<input value={form.titulo} onChange={(event) => updateForm('titulo', event.target.value)} required /></label>
          <label>Descrição curta<textarea value={form.descricao} onChange={(event) => updateForm('descricao', event.target.value)} rows="3" /></label>
          <label>Categoria<input value={form.categoria} onChange={(event) => updateForm('categoria', event.target.value)} placeholder="Produtos, Bastidores, Serviços..." /></label>
          <label>Link do vídeo<input type="url" value={form.video_url} onChange={(event) => updateForm('video_url', event.target.value)} placeholder="https://www.youtube.com/shorts/..." required /></label>
          <label>URL da capa/thumbnail<input type="url" value={form.thumbnail_url} onChange={(event) => updateForm('thumbnail_url', event.target.value)} placeholder="Opcional: capa externa do card" /></label>
          <div className="admin-form-grid-two">
            <label>Ordem<input type="number" value={form.ordem} onChange={(event) => updateForm('ordem', Number(event.target.value))} /></label>
            <label className="admin-checkbox-field"><input type="checkbox" checked={Boolean(form.ativo)} onChange={(event) => updateForm('ativo', event.target.checked)} /> Ativo</label>
          </div>
          <p className="admin-help-text">Links normais, youtu.be e Shorts do YouTube serão incorporados. Links não YouTube abrem em nova aba na Home.</p>
          <div className="admin-table-actions">
            <button className="btn" type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar vídeo'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={startCreate}>Cancelar edição</button> : null}
          </div>
        </form>

        <aside className="admin-home-video-preview" aria-label="Pré-visualizar card">
          <p className="admin-sidebar-kicker">Pré-visualizar card</p>
          <article className="site-video-card">
            <div className="site-video-cover">
              {previewThumbnail ? <img src={previewThumbnail} alt="" /> : null}
              <span className="site-video-gradient" aria-hidden="true" />
              <span className="site-video-tag">{form.categoria || 'Allegro'}</span>
              <span className="site-video-play" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M8 6v12l10-6z" fill="currentColor" /></svg></span>
            </div>
            <div className="site-video-content">
              <h3>{form.titulo || 'Título do vídeo'}</h3>
              <p>{form.descricao || 'Descrição curta do vídeo.'}</p>
              <span className="admin-help-text">{canEmbedPreview ? 'Embed do YouTube disponível.' : 'Fallback: abrir em nova aba.'}</span>
            </div>
          </article>
        </aside>
      </div>

      <section className="admin-home-videos-list">
        <h2>Vídeos cadastrados</h2>
        {isLoading ? <p>Carregando vídeos...</p> : null}
        {!isLoading && !videos.length ? <p className="admin-empty-state">Nenhum vídeo cadastrado ainda.</p> : null}
        {videos.map((video) => (
          <article key={video.id} className="admin-home-video-row">
            <div>
              <span className={`admin-pill ${video.ativo ? 'is-success' : 'is-muted'}`}>{video.ativo ? 'Ativo' : 'Inativo'}</span>
              <h3>{video.titulo}</h3>
              <p>{video.categoria ? `${video.categoria} · ` : ''}{video.descricao}</p>
              <a href={video.video_url} target="_blank" rel="noopener noreferrer">Abrir link cadastrado</a>
            </div>
            <div className="admin-home-video-row-actions">
              <label>Ordem<input type="number" value={video.ordem} onChange={(event) => updateOrder(video, Number(event.target.value))} /></label>
              <button className="btn-link" type="button" onClick={() => toggleActive(video)}>{video.ativo ? 'Inativar' : 'Ativar'}</button>
              <button className="btn-link" type="button" onClick={() => startEdit(video)}>Editar</button>
              <button className="btn-link danger" type="button" onClick={() => removeVideo(video)}>Excluir</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
