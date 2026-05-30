import { useEffect, useMemo, useState } from 'react';
import {
  createAdminServiceWork,
  deleteAdminServiceWork,
  getAdminServiceWorks,
  updateAdminServiceWork,
  uploadServiceWorkImage,
} from '../../services/serviceWorksService';

const emptyForm = {
  titulo: '',
  descricao: '',
  categoria: '',
  imagem_url: '',
  ordem: 0,
  ativo: true,
};

const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];

function toFormValues(work = emptyForm) {
  return {
    titulo: work.titulo || '',
    descricao: work.descricao || '',
    categoria: work.categoria || '',
    imagem_url: work.imagem_url || '',
    ordem: Number.isFinite(Number(work.ordem)) ? Number(work.ordem) : 0,
    ativo: work.ativo ?? true,
  };
}

export default function AdminServiceWorksPage() {
  const [works, setWorks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const editingWork = useMemo(() => works.find((work) => String(work.id) === String(editingId)), [works, editingId]);
  const previewUrl = localPreviewUrl || form.imagem_url;

  async function loadWorks() {
    setIsLoading(true);
    try {
      setWorks(await getAdminServiceWorks());
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível carregar os trabalhos realizados.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWorks();
  }, []);

  useEffect(() => {
    if (!selectedImage) {
      setLocalPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setLocalPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setEditingId('');
    setForm(emptyForm);
    setSelectedImage(null);
  }

  function startCreate() {
    resetForm();
    setStatus({ type: '', message: '' });
  }

  function startEdit(work) {
    setEditingId(work.id);
    setForm(toFormValues(work));
    setSelectedImage(null);
    setStatus({ type: '', message: '' });
  }

  function handleImageSelect(event) {
    const file = event.target.files?.[0];
    setStatus({ type: '', message: '' });

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!acceptedImageTypes.includes(file.type)) {
      setSelectedImage(null);
      setStatus({ type: 'error', message: 'Envie imagens nos formatos PNG, JPG/JPEG ou WEBP.' });
      return;
    }

    setSelectedImage(file);
  }

  async function handleImageUpload() {
    if (!selectedImage || isUploading) return;

    try {
      setIsUploading(true);
      setStatus({ type: '', message: '' });
      const imageUrl = await uploadServiceWorkImage(selectedImage);
      updateForm('imagem_url', imageUrl);
      setSelectedImage(null);
      setStatus({ type: 'success', message: 'Imagem enviada com sucesso.' });
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível enviar a imagem.' });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaving || isUploading) return;

    try {
      setIsSaving(true);
      setStatus({ type: '', message: '' });
      let payload = form;

      if (selectedImage) {
        const imageUrl = await uploadServiceWorkImage(selectedImage);
        payload = { ...form, imagem_url: imageUrl };
      }

      if (editingId) {
        await updateAdminServiceWork(editingId, payload);
        setStatus({ type: 'success', message: 'Trabalho atualizado com sucesso.' });
      } else {
        await createAdminServiceWork(payload);
        setStatus({ type: 'success', message: 'Trabalho criado com sucesso.' });
      }

      resetForm();
      await loadWorks();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível salvar o trabalho.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(work) {
    try {
      setStatus({ type: '', message: '' });
      await updateAdminServiceWork(work.id, { ...work, ativo: !(work.ativo ?? true) });
      await loadWorks();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível alterar o status do trabalho.' });
    }
  }

  async function updateOrder(work, ordem) {
    try {
      setStatus({ type: '', message: '' });
      await updateAdminServiceWork(work.id, { ...work, ordem: Number(ordem) });
      await loadWorks();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível alterar a ordem do trabalho.' });
    }
  }

  async function removeWork(work) {
    if (!window.confirm(`Excluir o trabalho "${work.titulo}"?`)) return;

    try {
      setStatus({ type: '', message: '' });
      await deleteAdminServiceWork(work.id);
      if (String(editingId) === String(work.id)) resetForm();
      setStatus({ type: 'success', message: 'Trabalho excluído com sucesso.' });
      await loadWorks();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Não foi possível excluir o trabalho.' });
    }
  }

  const saveDisabled = isSaving || isUploading;

  return (
    <div className="admin-page admin-service-works-page">
      <div className="admin-page-title-row">
        <div>
          <h1>Trabalhos realizados</h1>
          <p className="admin-page-subtitle">Gerencie as fotos reais exibidas na galeria da página de serviços.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={startCreate}>Novo trabalho</button>
      </div>

      {status.message ? (
        <p role="alert" className={`admin-alert ${status.type === 'error' ? 'error' : 'success'}`}>
          {status.message}
        </p>
      ) : null}

      <div className="admin-service-works-layout">
        <form className="admin-form admin-service-work-form" onSubmit={handleSubmit}>
          <h2>{editingId ? `Editando: ${editingWork?.titulo || 'trabalho'}` : 'Novo trabalho'}</h2>
          <label>Título<input value={form.titulo} onChange={(e) => updateForm('titulo', e.target.value)} required /></label>
          <label>Descrição<textarea value={form.descricao} onChange={(e) => updateForm('descricao', e.target.value)} rows="3" /></label>
          <div className="admin-form-grid-two">
            <label>Categoria<input value={form.categoria} onChange={(e) => updateForm('categoria', e.target.value)} placeholder="Luteria, Partituras, Aulas..." /></label>
            <label>Ordem<input type="number" value={form.ordem} onChange={(e) => updateForm('ordem', Number(e.target.value))} /></label>
          </div>
          <label>Upload de imagem
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageSelect} />
          </label>
          <button className="btn btn-secondary" type="button" onClick={handleImageUpload} disabled={!selectedImage || saveDisabled}>
            {isUploading ? 'Enviando imagem...' : 'Enviar imagem'}
          </button>
          <label>Imagem URL<input value={form.imagem_url} onChange={(e) => updateForm('imagem_url', e.target.value)} placeholder="https://..." /></label>
          <label className="admin-checkbox-label"><input type="checkbox" checked={form.ativo} onChange={(e) => updateForm('ativo', e.target.checked)} /> Ativo</label>
          <div className="admin-form-actions">
            <button className="btn" type="submit" disabled={saveDisabled}>{isSaving ? 'Salvando...' : 'Salvar trabalho'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancelar edição</button> : null}
          </div>
        </form>

        <aside className="admin-service-work-preview" aria-label="Prévia do trabalho realizado">
          <h2>Prévia</h2>
          <article className="work-gallery-card">
            {previewUrl ? (
              <img className="work-gallery-photo" src={previewUrl} alt={form.titulo || 'Prévia do trabalho realizado'} />
            ) : (
              <div className="work-gallery-image" aria-hidden="true">Imagem</div>
            )}
            {form.categoria ? <span className="work-gallery-category">{form.categoria}</span> : null}
            <h3>{form.titulo || 'Título do trabalho'}</h3>
            <p>{form.descricao || 'Descrição resumida do trabalho realizado pela Allegro Music Store.'}</p>
          </article>
        </aside>
      </div>

      <section className="admin-service-works-list">
        <h2>Trabalhos cadastrados</h2>
        {isLoading ? <p>Carregando trabalhos...</p> : null}
        {!isLoading && !works.length ? <p className="admin-empty-state">Nenhum trabalho cadastrado ainda.</p> : null}
        {works.map((work) => (
          <article key={work.id} className="admin-service-work-row">
            <div className="admin-service-work-row-main">
              {work.imagem_url ? <img src={work.imagem_url} alt={work.titulo} /> : <span className="admin-service-work-thumb-placeholder">Sem imagem</span>}
              <div>
                <span className={`admin-pill ${work.ativo ? 'is-success' : 'is-muted'}`}>{work.ativo ? 'Ativo' : 'Inativo'}</span>
                <h3>{work.titulo}</h3>
                <p>{work.categoria ? `${work.categoria} · ` : ''}{work.descricao || 'Sem descrição cadastrada.'}</p>
              </div>
            </div>
            <div className="admin-service-work-row-actions">
              <label>Ordem<input type="number" value={work.ordem} onChange={(e) => updateOrder(work, e.target.value)} /></label>
              <button className="btn-link" type="button" onClick={() => toggleActive(work)}>{work.ativo ? 'Inativar' : 'Ativar'}</button>
              <button className="btn-link" type="button" onClick={() => startEdit(work)}>Editar</button>
              <button className="btn-link danger" type="button" onClick={() => removeWork(work)}>Excluir</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
