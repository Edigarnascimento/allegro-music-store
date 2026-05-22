import { useEffect, useState } from 'react';
import { createAdminCategory, getAdminCategories, updateAdminCategory } from '../../services/adminService';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  async function load() { setCategories(await getAdminCategories()); }
  useEffect(() => { load(); }, []);

  async function addCategory(e) {
    e.preventDefault();
    if (!newCategory) return;
    await createAdminCategory({ nome: newCategory, slug: newCategory.toLowerCase().replace(/\s+/g, '-'), ativo: true });
    setNewCategory('');
    load();
  }

  return <div><h1>Categorias</h1><form className="admin-inline-form" onSubmit={addCategory}><input value={newCategory} onChange={(e)=>setNewCategory(e.target.value)} placeholder="Nova categoria"/><button className="btn" type="submit">Adicionar</button></form>{categories.map((cat)=><div key={cat.id||cat.slug} className="admin-row"><span>{cat.nome||cat.name}</span><button className="btn-link" onClick={()=>updateAdminCategory(cat.id,{ativo: !(cat.ativo ?? true)}).then(load)}>{(cat.ativo ?? true)?'Inativar':'Ativar'}</button></div>)}</div>;
}
