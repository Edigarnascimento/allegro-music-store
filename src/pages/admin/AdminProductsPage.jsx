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
    <div>
      <div className="section-heading with-action">
        <h1>Produtos</h1>
        <Link className="btn" to="/admin/produtos/novo">Novo produto</Link>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Ativo</th><th>Ações</th></tr></thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id}>
                <td>{item.nome}</td><td>{item.categoria}</td><td>R$ {Number(item.preco || 0).toFixed(2)}</td><td>{item.ativo ? 'Sim' : 'Não'}</td>
                <td><Link to={`/admin/produtos/editar/${item.id}`}>Editar</Link> · <button type="button" className="btn-link" onClick={() => onDeactivate(item.id)}>Inativar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
