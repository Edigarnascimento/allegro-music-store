import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAdminProduct, getAdminCategories, getAdminProductById, updateAdminProduct } from '../../services/adminService';

const initialForm = { nome: '', descricao: '', preco: 0, categoria: '', imagem_url: '', destaque: false, ativo: true, estoque: 0 };

export default function AdminProductFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAdminCategories().then(setCategories);
    if (editing) getAdminProductById(id).then((item) => item && setForm({ ...initialForm, ...item }));
  }, [editing, id]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (editing) await updateAdminProduct(id, form);
    else await createAdminProduct(form);
    navigate('/admin/produtos');
  }

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
        <label>Imagem URL<input value={form.imagem_url} onChange={(e) => setForm({ ...form, imagem_url: e.target.value })} /></label>
        <label>Estoque<input type="number" min="0" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: Number(e.target.value) })} /></label>
        <label><input type="checkbox" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} /> Destaque</label>
        <label><input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo</label>
        <button className="btn" type="submit">Salvar</button>
      </form>
    </div>
  );
}
