import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryIcon from '../components/CategoryIcon';
import { services } from '../data/services';
import { getProducts } from '../services/productsService';
import { ArrowIcon, WhatsAppIcon } from '../components/PublicButtonIcons';
import { getCategories } from '../services/categoriesService';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';

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

const arrivalVideos = [
  {
    id: 'reposicao-cordas',
    title: 'Reposição de cordas para violão',
    description: 'Cordas de aço e nylon com reposição frequente para todos os níveis de músicos.',
    category: 'Cordas',
    videoUrl: '',
    thumbnailUrl: '',
    productLink: '/catalogo?categoria=Cordas',
    categoryLink: '/catalogo?categoria=Cordas',
  },
  {
    id: 'palhetas-acessorios',
    title: 'Palhetas e acessórios',
    description: 'Novas palhetas, correias, afinadores e itens essenciais para o dia a dia.',
    category: 'Acessórios',
    videoUrl: '',
    thumbnailUrl: '',
    productLink: '/catalogo?categoria=Acess%C3%B3rios',
    categoryLink: '/catalogo?categoria=Acess%C3%B3rios',
  },
  {
    id: 'cabos-conectores',
    title: 'Cabos e conectores',
    description: 'Cabos P10, XLR e conectores de alta durabilidade para ensaios e apresentações.',
    category: 'Áudio',
    videoUrl: '',
    thumbnailUrl: '',
    productLink: '/catalogo?categoria=%C3%81udio',
    categoryLink: '/catalogo?categoria=%C3%81udio',
  },
  {
    id: 'iniciante-musicos',
    title: 'Produtos para músicos iniciantes',
    description: 'Kits acessíveis para começar com qualidade no estudo de música.',
    category: 'Iniciante',
    videoUrl: '',
    thumbnailUrl: '',
    productLink: '/catalogo',
    categoryLink: '/catalogo',
  },
  {
    id: 'novidades-fisica-online',
    title: 'Novidades para loja física e online',
    description: 'Produtos recém-chegados com disponibilidade na loja física e no e-commerce.',
    category: 'Novidades',
    videoUrl: '',
    thumbnailUrl: '',
    productLink: '/catalogo',
    categoryLink: '/catalogo',
  },
];

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredCategories, setFeaturedCategories] = useState(fallbackFeaturedCategories);
  const whatsappNumber = useStoreWhatsappNumber();

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
              <a className="btn btn-whatsapp" href={buildWhatsAppLink(whatsappNumber, 'Olá! Quero consultoria para comprar equipamentos.')} target="_blank" rel="noreferrer"><WhatsAppIcon /><span>Atendimento via WhatsApp</span></a>
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

      <div className="container section arrived-section">
        <div className="section-heading">
          <h2>Chegou na Allegro</h2>
          <p className="subtitle">Novidades, reposições e produtos disponíveis na loja física e online.</p>
        </div>
        <div className="arrival-videos-row" aria-label="Vídeos de novidades da Allegro Music Store">
          {arrivalVideos.map((video) => (
            <article key={video.id} className="arrival-video-card">
              <Link className="arrival-video-cover" to={video.categoryLink} aria-label={`Ir para categoria ${video.category}`}>
                <span className="arrival-video-tag">{video.category}</span>
                <span className="arrival-video-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M8 6v12l10-6z" fill="currentColor" />
                  </svg>
                </span>
              </Link>
              <div className="arrival-video-content">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <div className="arrival-video-actions">
                  <Link className="btn btn-secondary" to={video.productLink}>Ver produtos</Link>
                  <a
                    className="btn btn-whatsapp"
                    href={buildWhatsAppLink(whatsappNumber, 'Olá, vi no site da Allegro Music Store que chegaram novidades e gostaria de saber mais sobre os produtos disponíveis.')}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <WhatsAppIcon />
                    <span>Falar no WhatsApp</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="container section">
        <div className="section-heading">
          <h2>Serviços da loja</h2>
          <p className="subtitle">Soluções técnicas para manter seu instrumento sempre pronto.</p>
        </div>
        <div className="services-grid">
          {services.slice(0, 3).map((service) => (
            <Link key={service.title} className="service-card service-card-link" to="/servicos">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomePage;
