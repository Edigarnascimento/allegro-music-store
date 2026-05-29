import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryIcon from '../components/CategoryIcon';
import { services } from '../data/services';
import { getProducts } from '../services/productsService';
import { ArrowIcon, WhatsAppIcon } from '../components/PublicButtonIcons';
import { getCategories } from '../services/categoriesService';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { DEFAULT_HOME_VIDEO_WHATSAPP_MESSAGE, getHomeVideos } from '../services/homeVideosService';

const fallbackFeaturedCategories = [
  { icon: 'accessories', title: 'Acessórios', category: 'Acessórios', description: 'Palhetas, correias, cabos e itens essenciais para o dia a dia.' },
  { icon: 'audio', title: 'Áudio', category: 'Áudio', description: 'Microfones, interfaces, caixas e equipamentos para seu som.' },
  { icon: 'strings', title: 'Cordas', category: 'Cordas', description: 'Cordas para violão, guitarra, baixo e instrumentos acústicos.' },
  { icon: 'guitar', title: 'Violões', category: 'Violões', description: 'Modelos para estudo, palco, igreja e apresentações.' },
  { icon: 'wind', title: 'Sopro', category: 'Sopro', description: 'Instrumentos de sopro e acessórios para performance.' },
  { icon: 'guitar', title: 'Guitarras', category: 'Guitarras', description: 'Timbres, caps e modelos para diferentes estilos.' },
  { icon: 'drums', title: 'Percussão', category: 'Percussão', description: 'Peças, acessórios e instrumentos para ritmo e palco.' },
  { icon: 'services', title: 'Luteria/Serviços', category: 'Serviços', description: 'Regulagem, manutenção e soluções técnicas da Allegro.', isService: true },
];

const iconByCategoryName = {
  cordas: 'strings',
  teclas: 'keys',
  bateria: 'drums',
  baterias: 'drums',
  percussao: 'drums',
  percussão: 'drums',
  áudio: 'audio',
  audio: 'audio',
  acessórios: 'accessories',
  acessorios: 'accessories',
  violões: 'guitar',
  violoes: 'guitar',
  guitarras: 'guitar',
  guitarra: 'guitar',
  sopro: 'wind',
  luteria: 'services',
  serviços: 'services',
  servicos: 'services',
};

function normalizeCategoryName(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}


function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredCategories, setFeaturedCategories] = useState(fallbackFeaturedCategories);
  const [arrivalVideos, setArrivalVideos] = useState([]);
  const [loadingArrivalVideos, setLoadingArrivalVideos] = useState(true);
  const whatsappNumber = useStoreWhatsappNumber();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const target = document.querySelector(location.hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

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

      const categoriesByName = new Map(
        data
          .map((category) => {
            const name = category.nome ?? category.name;
            return name ? [normalizeCategoryName(name), category] : null;
          })
          .filter(Boolean),
      );

      const mapped = fallbackFeaturedCategories.map((featuredCategory) => {
        const categoryData = categoriesByName.get(normalizeCategoryName(featuredCategory.category));
        const name = categoryData?.nome ?? categoryData?.name ?? featuredCategory.category;

        return {
          ...featuredCategory,
          icon: iconByCategoryName[normalizeCategoryName(name)] ?? featuredCategory.icon,
          title: featuredCategory.isService ? featuredCategory.title : name,
          category: name,
          description: categoryData?.descricao || featuredCategory.description,
        };
      });

      setFeaturedCategories(mapped);
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    let isMounted = true;

    async function loadArrivalVideos() {
      try {
        const data = await getHomeVideos();
        if (isMounted) setArrivalVideos(data);
      } finally {
        if (isMounted) setLoadingArrivalVideos(false);
      }
    }

    loadArrivalVideos();

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

      <div className="container section" id="categorias">
        <div className="section-heading">
          <p className="eyebrow">Compre por departamento</p>
          <h2>Categorias em destaque</h2>
          <p className="subtitle">Navegue pelas principais seções da loja e encontre seu próximo setup.</p>
        </div>
        <div className="features-grid marketplace-categories" aria-label="Categorias em destaque">
          {featuredCategories.map((item) => (
            <Link key={item.title} className="feature-card category-card" to={item.isService ? '/servicos' : `/catalogo?categoria=${encodeURIComponent(item.category)}`}>
              <span className="category-card-icon"><CategoryIcon type={item.icon} /></span>
              <span className="category-card-title">{item.title}</span>
              <span className="category-card-description">{item.description}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="container section" id="produtos">
        <div className="section-heading with-action">
          <div>
            <h2>Produtos em destaque</h2>
            <p className="subtitle">Ofertas selecionadas para equipar seu som com qualidade.</p>
          </div>
          <Link to="/catalogo" className="btn btn-secondary">Ver todos os produtos</Link>
        </div>
        {loadingFeatured ? <p>Carregando produtos em destaque...</p> : <div className="products-grid">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
      </div>

      <div className="container section arrived-section" id="chegou-na-allegro">
        <div className="section-heading">
          <h2>Chegou na Allegro</h2>
          <p className="subtitle">Novidades, reposições e produtos disponíveis na loja física e online.</p>
        </div>
        <div className="arrival-videos-row" aria-label="Vídeos de novidades da Allegro Music Store">
          {loadingArrivalVideos ? <p>Carregando novidades...</p> : null}
          {!loadingArrivalVideos && !arrivalVideos.length ? <p>Nenhuma novidade ativa no momento.</p> : null}
          {!loadingArrivalVideos ? arrivalVideos.map((video) => (
            <article key={video.id} className="arrival-video-card">
              <Link
                className="arrival-video-cover"
                to={video.botao_link || '/catalogo'}
                aria-label={`Ir para ${video.titulo}`}
              >
                <span className="arrival-video-tag">{video.categoria || 'Novidade'}</span>
                <span className="arrival-video-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M8 6v12l10-6z" fill="currentColor" />
                  </svg>
                </span>
              </Link>
              <div className="arrival-video-content">
                <h3>{video.titulo}</h3>
                <p>{video.descricao}</p>
                <div className="arrival-video-actions">
                  {video.video_url ? (
                    <a className="btn btn-secondary" href={video.video_url} target="_blank" rel="noopener noreferrer">Assistir vídeo</a>
                  ) : null}
                  <Link className="btn btn-secondary" to={video.botao_link || '/catalogo'}>{video.botao_texto || 'Ver produtos'}</Link>
                  <a
                    className="btn btn-whatsapp"
                    href={buildWhatsAppLink(
                      whatsappNumber,
                      video.whatsapp_mensagem || DEFAULT_HOME_VIDEO_WHATSAPP_MESSAGE,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon />
                    <span>Falar no WhatsApp</span>
                  </a>
                </div>
              </div>
            </article>
          )) : null}
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
