import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryIcon from '../components/CategoryIcon';
import { services } from '../data/services';
import { getProducts } from '../services/productsService';
import { ArrowIcon, WhatsAppIcon } from '../components/PublicButtonIcons';
import { getCategories } from '../services/categoriesService';

const fallbackFeaturedCategories = [
  { icon: 'strings', title: 'Guitarras e baixos', category: 'Cordas', description: 'Modelos para palco, estúdio e estudo.' },
  { icon: 'keys', title: 'Teclados e pianos', category: 'Teclas', description: 'Sons expressivos e recursos modernos.' },
  { icon: 'drums', title: 'Baterias e percussão', category: 'Bateria', description: 'Kits completos e peças de reposição.' },
  { icon: 'audio', title: 'Áudio e gravação', category: 'Áudio', description: 'Microfones, interfaces e monitoramento.' },
];

const iconByCategoryName = {
  cordas: 'strings',
  teclas: 'keys',
  bateria: 'drums',
  áudio: 'audio',
  audio: 'audio',
  acessórios: 'accessories',
  acessorios: 'accessories',
};

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredCategories, setFeaturedCategories] = useState(fallbackFeaturedCategories);

  useEffect(() => {
    let isMounted = true;

    async function loadFeaturedProducts() {
      try {
        const data = await getProducts();

        if (!isMounted) return;

        const activeProducts = data.filter((product) => product.ativo === true || typeof product.ativo === 'undefined');
        const featured = activeProducts.filter((product) => product.destaque === true);
        setFeaturedProducts(featured.length ? featured.slice(0, 6) : activeProducts.slice(0, 6));
      } finally {
        if (isMounted) {
          setLoadingFeatured(false);
        }
      }
    }

    loadFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      const data = await getCategories();
      if (!isMounted || !data.length) return;

      const mapped = data.slice(0, 4).map((category) => {
        const name = category.nome ?? category.name;
        const normalizedName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        return {
          icon: iconByCategoryName[normalizedName] ?? 'generic',
          title: name,
          category: name,
          description: category.descricao || 'Explore os melhores produtos desta categoria.',
        };
      });

      setFeaturedCategories(mapped.length ? mapped : fallbackFeaturedCategories);
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section>
      <div className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">E-commerce profissional de instrumentos musicais</p>
            <h1>Compre instrumentos e áudio profissional com confiança.</h1>
            <p>Catálogo com produtos selecionados, atendimento especializado e suporte completo para músicos, igrejas e estúdios.</p>
            <div className="hero-actions">
              <Link className="btn btn-main" to="/catalogo"><span>Ver catálogo completo</span><ArrowIcon /></Link>
              <a className="btn btn-whatsapp" href="https://wa.me/5511999999999?text=Olá!%20Quero%20consultoria%20para%20comprar%20equipamentos." target="_blank" rel="noreferrer"><WhatsAppIcon /><span>Atendimento via WhatsApp</span></a>
            </div>
          </div>
          <aside className="hero-panel">
            <h2>Vantagens da Allegro</h2>
            <ul>
              <li>Entrega para todo o Brasil com rastreamento</li>
              <li>Parcelamento em até 12x</li>
              <li>Suporte técnico pré e pós-venda</li>
            </ul>
          </aside>
        </div>
      </div>

      <div className="container section">
        <div className="section-heading">
          <h2>Categorias em destaque</h2>
          <p className="subtitle">Navegue pelas principais seções da loja e encontre seu próximo setup.</p>
        </div>
        <div className="features-grid">
          {featuredCategories.map((item) => (
            <Link key={item.title} className="feature-card" to={`/catalogo?categoria=${encodeURIComponent(item.category)}`}>
              <h3><CategoryIcon type={item.icon} /><span>{item.title}</span></h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="container section">
        <div className="section-heading with-action">
          <div>
            <h2>Produtos em destaque</h2>
            <p className="subtitle">Ofertas selecionadas para equipar seu som com qualidade.</p>
          </div>
          <Link to="/catalogo" className="btn btn-secondary">Ver todos os produtos</Link>
        </div>
        {loadingFeatured ? <p>Carregando produtos em destaque...</p> : <div className="products-grid">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
      </div>

      <div className="container section">
        <div className="section-heading">
          <h2>Serviços da loja</h2>
          <p className="subtitle">Soluções técnicas para manter seu instrumento sempre pronto.</p>
        </div>
        <div className="services-grid">
          {services.slice(0, 3).map((service) => (
            <article key={service.title} className="service-card">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomePage;
