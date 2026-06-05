import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/productsService';
import Breadcrumbs from '../components/Breadcrumbs';
import { WhatsAppIcon } from '../components/PublicButtonIcons';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';

function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const whatsappNumber = useStoreWhatsappNumber();

  const query = searchParams.get('q')?.trim() ?? '';
  const category = searchParams.get('categoria')?.trim() ?? '';

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
    const normalizedQuery = query.toLowerCase();
    const normalizedCategory = category.toLowerCase();

    return products.filter((product) => {
      const searchableFields = [product.nome, product.descricao, product.categoria]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesQuery = !query || searchableFields.includes(normalizedQuery);
      const matchesCategory = !category || (product.categoria ?? '').toLowerCase() === normalizedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  function handleClearFilters() {
    navigate('/catalogo');
  }

  return (
    <section className="container section">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Catálogo' }]} />
      <div className="section-heading">
        <h1>Catálogo de instrumentos musicais e acessórios</h1>
        <p className="subtitle">Encontre instrumentos musicais, cordas, acessórios, equipamentos de áudio, violões, guitarras e produtos selecionados para estudo, igreja, palco e uso profissional.</p>
        {query || category ? (
          <div className="catalog-search-info">
            {query ? <p className="subtitle">Resultados para “{query}”</p> : null}
            {category ? <p className="subtitle">Categoria: “{category}”</p> : null}
            <button type="button" className="btn btn-secondary btn-compact" onClick={handleClearFilters}>Limpar filtros</button>
          </div>
        ) : null}
      </div>
      <div className="catalog-highlight">
        <p>Precisa de ajuda para escolher cordas para violão, acessórios musicais, equipamentos de som ou seu próximo instrumento? Nossa equipe orienta pelo WhatsApp de acordo com seu estilo e necessidade.</p>
        <a
          className="btn btn-whatsapp"
          href={buildWhatsAppLink(whatsappNumber, 'Olá! Preciso de ajuda para escolher instrumentos musicais, acessórios ou equipamentos de áudio.')}
          target="_blank"
          rel="noreferrer"
        ><WhatsAppIcon /><span>Atendimento no WhatsApp</span></a>
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
        <p className="catalog-empty-state">Nenhum produto encontrado para os filtros selecionados.</p>
      )}
    </section>
  );
}

export default CatalogPage;
