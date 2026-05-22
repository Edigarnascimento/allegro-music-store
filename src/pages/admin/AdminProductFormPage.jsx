import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createAdminProduct,
  getAdminCategories,
  getAdminProductById,
  updateAdminProduct,
  uploadProductImage,
} from '../../services/adminService';

const initialForm = { nome: '', descricao: '', preco: 0, categoria: '', imagem_url: '', destaque: false, ativo: true, estoque: 0 };

export default function AdminProductFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAdminCategories().then(setCategories);
    if (editing) getAdminProductById(id).then((item) => item && setForm({ ...initialForm, ...item }));
  }, [editing, id]);

  useEffect(() => {
    if (selectedImage) {
      const localPreview = URL.createObjectURL(selectedImage);
      setPreviewUrl(localPreview);
      return () => URL.revokeObjectURL(localPreview);
    }

    setPreviewUrl(form.imagem_url || '');
    return undefined;
  }, [selectedImage, form.imagem_url]);

  async function handleImageUpload() {
    if (!selectedImage) return;

    setUploadError('');
    setIsUploadingImage(true);

    try {
      const imageUrl = await uploadProductImage(selectedImage);
      setForm((previous) => ({ ...previous, imagem_url: imageUrl }));
      setSelectedImage(null);
    } catch (error) {
      setUploadError(error.message || 'Falha ao enviar imagem. Tente novamente.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files?.[0];
    setUploadError('');

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSelectedImage(null);
      setUploadError('Selecione apenas arquivos de imagem.');
      return;
    }

    setSelectedImage(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSavingProduct(true);

    try {
      if (editing) await updateAdminProduct(id, form);
      else await createAdminProduct(form);
      navigate('/admin/produtos');
    } finally {
      setIsSavingProduct(false);
    }
  }

  const disableSave = isUploadingImage || isSavingProduct;

  return (
    <div>
      <h1>{editing ? 'Editar produto' : 'Novo produto'}</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>Nome<input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></label>
        <label>Descrição<textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></label>
        <label>Preço<input type="number" min="0" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })} /></label>
        <label>Categoria
          <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
            <option value="">Selecione</option>
            {categories.map((cat) => <option key={cat.id || cat.slug} value={cat.nome || cat.name}>{cat.nome || cat.name}</option>)}
          </select>
        </label>

        <label>Upload de imagem
          <input type="file" accept="image/*" onChange={handleFileSelect} />
        </label>
        <button className="btn" type="button" onClick={handleImageUpload} disabled={!selectedImage || isUploadingImage || isSavingProduct}>
          {isUploadingImage ? 'Enviando imagem...' : 'Enviar imagem'}
        </button>
        {uploadError ? <p style={{ color: '#c62828' }}>{uploadError}</p> : null}

        <label>Imagem URL<input value={form.imagem_url} onChange={(e) => setForm({ ...form, imagem_url: e.target.value })} /></label>

        {previewUrl ? (
          <div>
            <p>Preview da imagem:</p>
            <img src={previewUrl} alt="Preview do produto" style={{ maxWidth: '220px', borderRadius: '8px' }} />
          </div>
        ) : null}

        <label>Estoque<input type="number" min="0" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: Number(e.target.value) })} /></label>
        <label><input type="checkbox" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} /> Destaque</label>
        <label><input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo</label>
        <button className="btn" type="submit" disabled={disableSave}>{isSavingProduct ? 'Salvando...' : 'Salvar'}</button>
      </form>
    </div>
  );
}
