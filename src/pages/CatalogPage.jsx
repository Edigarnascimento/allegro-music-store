import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/productsService';
import Breadcrumbs from '../components/Breadcrumbs';
import { WhatsAppIcon } from '../components/PublicButtonIcons';

function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q')?.trim() ?? '';

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const data = await getProducts();

        if (!isMounted) return;

        const activeProducts = data.filter((product) => product.ativo === true || typeof product.ativo === 'undefined');
        setProducts(activeProducts);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query) return products;

    const normalizedQuery = query.toLowerCase();

    return products.filter((product) => {
      const searchableFields = [product.nome, product.descricao, product.categoria]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableFields.includes(normalizedQuery);
    });
  }, [products, query]);

  function handleClearSearch() {
    navigate('/catalogo');
  }

  return (
    <section className="container section">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Catálogo' }]} />
      <div className="section-heading">
        <h1>Catálogo de Produtos</h1>
        <p className="subtitle">Instrumentos selecionados para quem busca performance, timbre e confiabilidade.</p>
        {query ? (
          <div className="catalog-search-info">
            <p className="subtitle">Resultados para “{query}”</p>
            <button type="button" className="btn btn-secondary btn-compact" onClick={handleClearSearch}>Limpar busca</button>
          </div>
        ) : null}
      </div>
      <div className="catalog-highlight">
        <p>Precisa de ajuda para escolher? Nossa equipe recomenda o melhor setup para seu estilo.</p>
        <a className="btn btn-whatsapp" href="https://wa.me/5511999999999?text=Olá!%20Preciso%20de%20ajuda%20para%20escolher%20um%20instrumento." target="_blank" rel="noreferrer"><WhatsAppIcon /><span>Atendimento no WhatsApp</span></a>
      </div>
      {loading ? (
        <p>Carregando produtos...</p>
      ) : filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="catalog-empty-state">Nenhum produto encontrado para sua busca.</p>
      )}
    </section>
  );
}

export default CatalogPage;
