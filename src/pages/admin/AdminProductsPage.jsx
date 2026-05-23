import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { deleteOrDeactivateProduct, getAdminProducts } from '../../services/adminService';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);

  async function load() {
    const data = await getAdminProducts();
    setProducts(data);
  }

  useEffect(() => { load(); }, []);

  async function onDeactivate(id) {
    await deleteOrDeactivateProduct(id, false);
    load();
  }

  return (
    <div className="admin-page">
      <div className="section-heading with-action">
        <h1>Produtos</h1>
        <Link className="btn" to="/admin/produtos/novo">Novo produto</Link>
      </div>
      <p className="admin-page-subtitle">Gerencie catálogo, disponibilidade e visibilidade dos produtos.</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th>Destaque</th><th>Ações</th></tr></thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id}>
                <td>{item.nome}</td><td>{item.categoria}</td><td>R$ {Number(item.preco || 0).toFixed(2)}</td><td>{item.estoque ?? 0}</td>
                <td><span className={`admin-pill ${item.ativo ? 'is-success' : 'is-muted'}`}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td><span className={`admin-pill ${(item.destaque ? 'is-danger' : 'is-muted')}`}>{item.destaque ? 'Destaque' : 'Normal'}</span></td>
                <td className="admin-table-actions"><Link to={`/admin/produtos/editar/${item.id}`}>Editar</Link><button type="button" className="btn-link" onClick={() => onDeactivate(item.id)}>Inativar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
