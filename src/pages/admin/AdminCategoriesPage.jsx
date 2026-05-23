import { useEffect, useState } from 'react';
import { createAdminCategory, getAdminCategories, updateAdminCategory } from '../../services/adminService';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function load() {
    setCategories(await getAdminCategories());
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(e) {
    e.preventDefault();
    if (!newCategory.trim() || isSaving) return;

    try {
      setIsSaving(true);
      setSuccessMessage('');
      setErrorMessage('');
      await createAdminCategory({ nome: newCategory.trim(), ativo: true });
      setNewCategory('');
      setSuccessMessage('Categoria adicionada com sucesso.');
      await load();
    } catch (error) {
      setErrorMessage(error?.message || 'Não foi possível adicionar a categoria.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <h1>Categorias</h1>
      <p className="admin-page-subtitle">Crie e controle categorias para facilitar a navegação do cliente.</p>
      <form className="admin-inline-form" onSubmit={addCategory}>
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nova categoria"
        />
        <button className="btn" type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Adicionar'}
        </button>
      </form>

      {successMessage ? <p className="admin-alert success">{successMessage}</p> : null}
      {errorMessage ? <p className="admin-alert error" role="alert">{errorMessage}</p> : null}

      {categories.map((cat, index) => (
        <div key={cat.id || cat.slug} className="admin-row">
          <span>{index + 1}. {cat.nome || cat.name}</span>
          <button
            className="btn-link"
            onClick={() => updateAdminCategory(cat.id, { ativo: !(cat.ativo ?? true) }).then(load)}
          >
            {(cat.ativo ?? true) ? 'Inativar' : 'Ativar'}
          </button>
        </div>
      ))}
    </div>
  );
}
