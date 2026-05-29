import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addAdminProductImages,
  createAdminProduct,
  deleteAdminProductImage,
  getAdminCategories,
  getAdminProductById,
  getAdminProductImages,
  updateAdminProduct,
  updateAdminProductImagesOrder,
  uploadProductGalleryImage,
  uploadProductImage,
} from '../../services/adminService';

const initialForm = { nome: '', descricao: '', preco: 0, categoria: '', imagem_url: '', destaque: false, ativo: true, estoque: 0 };
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function isAcceptedImage(file) {
  return ACCEPTED_IMAGE_TYPES.includes(file?.type);
}

export default function AdminProductFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState([]);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [galleryError, setGalleryError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAdminCategories().then(setCategories);
    if (editing) {
      getAdminProductById(id).then((item) => item && setForm({ ...initialForm, ...item }));
      getAdminProductImages(id).then(setGalleryImages);
    }
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

  useEffect(() => {
    const urls = selectedGalleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedGalleryFiles]);

  const nextGalleryOrder = useMemo(
    () => galleryImages.reduce((highest, image) => Math.max(highest, Number(image.ordem) || 0), -1) + 1,
    [galleryImages],
  );

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

  function handleGalleryFileSelect(event) {
    const files = Array.from(event.target.files || []);
    setGalleryError('');

    const invalidFile = files.find((file) => !isAcceptedImage(file));
    if (invalidFile) {
      setSelectedGalleryFiles([]);
      setGalleryError('A galeria aceita apenas imagens PNG, JPG/JPEG ou WEBP.');
      return;
    }

    setSelectedGalleryFiles(files);
  }

  async function uploadGalleryFiles(productId) {
    if (!selectedGalleryFiles.length) return [];

    const uploadedRows = [];
    for (const [index, file] of selectedGalleryFiles.entries()) {
      const imageUrl = await uploadProductGalleryImage(file);
      uploadedRows.push({ image_url: imageUrl, ordem: nextGalleryOrder + index });
    }

    return addAdminProductImages(productId, uploadedRows);
  }

  async function handleGalleryUpload() {
    if (!editing || !selectedGalleryFiles.length) return;

    setGalleryError('');
    setIsUploadingGallery(true);

    try {
      const newImages = await uploadGalleryFiles(id);
      setGalleryImages((previous) => [...previous, ...newImages].sort((a, b) => Number(a.ordem ?? 0) - Number(b.ordem ?? 0)));
      setSelectedGalleryFiles([]);
    } catch (error) {
      setGalleryError(error.message || 'Falha ao enviar fotos adicionais. Tente novamente.');
    } finally {
      setIsUploadingGallery(false);
    }
  }

  async function handleRemoveGalleryImage(imageId) {
    if (!imageId) return;
    setGalleryError('');

    try {
      await deleteAdminProductImage(imageId);
      setGalleryImages((previous) => previous.filter((image) => String(image.id) !== String(imageId)));
    } catch (error) {
      setGalleryError(error.message || 'Falha ao remover foto adicional.');
    }
  }

  async function handleGalleryOrderChange(imageId, ordem) {
    const nextImages = galleryImages.map((image) => (String(image.id) === String(imageId) ? { ...image, ordem: Number(ordem) } : image));
    setGalleryImages(nextImages);

    try {
      await updateAdminProductImagesOrder(nextImages);
    } catch (error) {
      setGalleryError(error.message || 'Falha ao atualizar ordem da galeria.');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSavingProduct(true);
    setGalleryError('');

    try {
      if (editing) {
        await updateAdminProduct(id, form);
        if (selectedGalleryFiles.length) await uploadGalleryFiles(id);
      } else {
        const createdProduct = await createAdminProduct(form);
        if (selectedGalleryFiles.length) await uploadGalleryFiles(createdProduct.id);
      }
      navigate('/admin/produtos');
    } catch (error) {
      setGalleryError(error.message || 'Falha ao salvar produto.');
    } finally {
      setIsSavingProduct(false);
    }
  }

  const disableSave = isUploadingImage || isUploadingGallery || isSavingProduct;

  return (
    <div className="admin-page">
      <h1>{editing ? 'Editar produto' : 'Novo produto'}</h1>
      <p className="admin-page-subtitle">Preencha os dados com atenção para manter o catálogo organizado.</p>
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

        <label>Upload de imagem principal
          <input type="file" accept="image/*" onChange={handleFileSelect} />
        </label>
        <button className="btn" type="button" onClick={handleImageUpload} disabled={!selectedImage || isUploadingImage || isSavingProduct}>
          {isUploadingImage ? 'Enviando imagem...' : 'Enviar imagem principal'}
        </button>
        {uploadError ? <p style={{ color: '#c62828' }}>{uploadError}</p> : null}

        <label>Imagem URL<input value={form.imagem_url} onChange={(e) => setForm({ ...form, imagem_url: e.target.value })} /></label>

        {previewUrl ? (
          <div>
            <p>Preview da imagem principal atual:</p>
            <img src={previewUrl} alt="Preview do produto" style={{ maxWidth: '220px', borderRadius: '8px' }} />
          </div>
        ) : null}

        <section className="admin-gallery-section" aria-labelledby="product-gallery-title">
          <h2 id="product-gallery-title">Galeria de imagens do produto</h2>
          <p>Fotos adicionais são opcionais e não substituem a imagem principal usada nos cards do catálogo.</p>
          {!editing ? <p className="admin-help-text">Ao cadastrar um produto novo, as fotos selecionadas serão enviadas depois que o produto for salvo.</p> : null}

          <label>Adicionar fotos adicionais
            <input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={handleGalleryFileSelect} />
          </label>
          {editing ? (
            <button className="btn btn-secondary" type="button" onClick={handleGalleryUpload} disabled={!selectedGalleryFiles.length || isUploadingGallery || isSavingProduct}>
              {isUploadingGallery ? 'Enviando galeria...' : 'Enviar fotos adicionais'}
            </button>
          ) : null}
          {galleryError ? <p className="error-text">{galleryError}</p> : null}

          {galleryPreviewUrls.length ? (
            <div className="admin-gallery-grid" aria-label="Prévia das novas fotos adicionais">
              {galleryPreviewUrls.map((url, index) => (
                <figure className="admin-gallery-card" key={url}>
                  <img src={url} alt={`Prévia adicional ${index + 1}`} />
                  <figcaption>Nova foto {index + 1}</figcaption>
                </figure>
              ))}
            </div>
          ) : null}

          <div className="admin-gallery-grid" aria-label="Fotos adicionais cadastradas">
            {galleryImages.length ? galleryImages.map((image) => (
              <figure className="admin-gallery-card" key={image.id}>
                <img src={image.image_url} alt="Foto adicional do produto" />
                <figcaption>
                  <label>Ordem
                    <input type="number" min="0" value={image.ordem ?? 0} onChange={(event) => handleGalleryOrderChange(image.id, event.target.value)} />
                  </label>
                  <button className="admin-action-btn is-danger" type="button" onClick={() => handleRemoveGalleryImage(image.id)}>Remover</button>
                </figcaption>
              </figure>
            )) : <p className="admin-help-text">Nenhuma foto adicional cadastrada.</p>}
          </div>
        </section>

        <label>Estoque<input type="number" min="0" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: Number(e.target.value) })} /></label>
        <label><input type="checkbox" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} /> Destaque</label>
        <label><input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo</label>
        <button className="btn" type="submit" disabled={disableSave}>{isSavingProduct ? 'Salvando...' : 'Salvar'}</button>
      </form>
    </div>
  );
}
