import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { deleteOrDeactivateProduct, getAdminProducts } from '../../services/adminService';

function toCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  async function load() {
    const data = await getAdminProducts();
    setProducts(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function onDeactivate(id) {
    await deleteOrDeactivateProduct(id, false);
    load();
  }

  const categories = useMemo(() => {
    const unique = new Set(products.map((item) => item.categoria).filter(Boolean));
    return [...unique].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return products.filter((item) => {
      const byName = !search || item.nome?.toLowerCase().includes(search);
      const byCategory = categoryFilter === 'all' || item.categoria === categoryFilter;
      const byStatus = statusFilter === 'all' || (statusFilter === 'active' ? item.ativo : !item.ativo);
      const byFeatured = featuredFilter === 'all' || (featuredFilter === 'featured' ? item.destaque : !item.destaque);
      return byName && byCategory && byStatus && byFeatured;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, featuredFilter]);

  return (
    <div className="admin-page">
      <div className="section-heading with-action admin-products-header">
        <h1>Produtos</h1>
        <Link className="btn admin-btn-primary" to="/admin/produtos/novo">+ Novo produto</Link>
      </div>
      <p className="admin-page-subtitle">Gerencie catálogo, disponibilidade e visibilidade dos produtos.</p>

      <div className="admin-products-filters">
        <label>
          Buscar produto
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome do produto"
          />
        </label>
        <label>
          Categoria
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Todas</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </label>
        <label>
          Destaque
          <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="featured">Com destaque</option>
            <option value="normal">Sem destaque</option>
          </select>
        </label>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-products-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Ativo</th>
              <th>Destaque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="admin-empty-state">Nenhum produto encontrado para os filtros selecionados.</div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-product-cell">
                      {item.imagem_url ? (
                        <img
                          src={item.imagem_url}
                          alt={item.nome}
                          className="admin-product-thumb"
                        />
                      ) : (
                        <span className="admin-product-thumb is-placeholder" aria-hidden="true">Sem imagem</span>
                      )}
                      <span>{item.nome}</span>
                    </div>
                  </td>
                  <td>{item.categoria || 'Sem categoria'}</td>
                  <td>{toCurrency(item.preco)}</td>
                  <td>{item.estoque ?? 0}</td>
                  <td><span className={`admin-pill ${item.ativo ? 'is-success' : 'is-muted'}`}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                  <td><span className={`admin-pill ${item.destaque ? 'is-danger' : 'is-muted'}`}>{item.destaque ? 'Destaque' : 'Normal'}</span></td>
                  <td className="admin-table-actions">
                    <Link className="admin-action-btn" to={`/admin/produtos/editar/${item.id}`}>Editar</Link>
                    <button type="button" className="admin-action-btn is-danger" onClick={() => onDeactivate(item.id)}>Inativar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
