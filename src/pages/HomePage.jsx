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
import { trackEvent } from '../services/analyticsService';

const fallbackFeaturedCategories = [
  { icon: 'accessories', title: 'Acessórios', category: 'Acessórios', description: 'Acessórios musicais, cabos, palhetas e itens essenciais para estudo, palco e igreja.' },
  { icon: 'audio', title: 'Áudio', category: 'Áudio', description: 'Áudio profissional, microfones, caixas e equipamentos de som para diferentes usos.' },
  { icon: 'strings', title: 'Cordas', category: 'Cordas', description: 'Cordas para violão, guitarra, baixo e instrumentos acústicos, com orientação na escolha.' },
  { icon: 'guitar', title: 'Violões', category: 'Violões', description: 'Modelos para estudo, palco, igreja e apresentações.' },
  { icon: 'wind', title: 'Sopro', category: 'Sopro', description: 'Instrumentos de sopro e acessórios para performance.' },
  { icon: 'guitar', title: 'Guitarras', category: 'Guitarras', description: 'Timbres, caps e modelos para diferentes estilos.' },
  { icon: 'drums', title: 'Percussão', category: 'Percussão', description: 'Peças, acessórios e instrumentos para ritmo e palco.' },
  { icon: 'services', title: 'Luteria/Serviços', category: 'Serviços', description: 'Luteria em Paragominas, regulagem, troca de cordas, partituras, arranjos e aulas.', isService: true },
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


const homeTrustCards = [
  { title: 'Loja física em Paragominas', description: 'Atendimento presencial para conhecer produtos, tirar dúvidas e comprar com mais segurança.' },
  { title: 'Atendimento especializado', description: 'Orientação para músicos, estudantes, igrejas, bandas e profissionais de áudio.' },
  { title: 'Pagamento online seguro', description: 'Compra online com fluxo protegido e opções pensadas para facilitar sua decisão.' },
  { title: 'Produtos selecionados', description: 'Instrumentos, acessórios e áudio profissional escolhidos para estudo, palco e rotina musical.' },
  { title: 'Suporte pelo WhatsApp', description: 'Converse com a equipe para receber indicação, disponibilidade e detalhes antes de comprar.' },
  { title: 'Serviços musicais', description: 'Luteria, regulagem, troca de cordas, partituras, arranjos e aulas em Paragominas/PA.' },
];

const HOME_SPECIALIST_WHATSAPP_MESSAGE = 'Olá, acessei o site da Allegro Music Store e gostaria de ajuda para escolher um produto.';

const worldCupCampaignCards = [
  'Instrumentos para animar a torcida',
  'Acessórios musicais para a festa',
  'Som e áudio para reunir a galera',
  'Serviços musicais e luteria para deixar tudo pronto',
];

const WORLD_CUP_CAMPAIGN_WHATSAPP_MESSAGE = 'Olá, vi a campanha Esquenta da Copa no site da Allegro Music Store e gostaria de atendimento.';

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredCategories, setFeaturedCategories] = useState(fallbackFeaturedCategories);
  const [arrivalVideos, setArrivalVideos] = useState([]);
  const [loadingArrivalVideos, setLoadingArrivalVideos] = useState(true);
  const whatsappNumber = useStoreWhatsappNumber();
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_view_home');
  }, []);

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
      <div className="hero home-hero">
        <div className="container hero-grid home-hero-grid">
          <div className="home-hero-copy">
            <p className="eyebrow home-hero-eyebrow">Loja física e online em Paragominas/PA</p>
            <h1>Loja física e online para quem vive a música</h1>
            <p className="home-hero-lead">Instrumentos musicais, acessórios, áudio profissional, luteria, partituras, arranjos e aulas em Paragominas/PA.</p>
            <p className="home-hero-support">Na Allegro Music Store, você encontra curadoria de produtos, atendimento próximo e suporte pelo WhatsApp para comprar com confiança — seja para estudo, igreja, palco, banda ou produção musical.</p>
            <div className="hero-actions home-hero-actions">
              <Link className="btn btn-main" to="/catalogo"><span>Ver catálogo</span><ArrowIcon /></Link>
              <a className="btn btn-whatsapp" href={buildWhatsAppLink(whatsappNumber, HOME_SPECIALIST_WHATSAPP_MESSAGE)} target="_blank" rel="noreferrer" onClick={() => trackEvent('click_whatsapp', { origem: 'home_hero' })}><WhatsAppIcon /><span>Falar no WhatsApp</span></a>
              <Link className="btn btn-secondary home-hero-service-btn" to="/servicos" onClick={() => trackEvent('click_services', { origem: 'home_hero' })}><span>Ver serviços</span></Link>
            </div>
          </div>
          <aside className="hero-panel home-hero-panel" aria-label="Diferenciais da Allegro Music Store">
            <span className="home-hero-panel-tag">Compra orientada</span>
            <h2>Produtos, serviços e atendimento musical no mesmo lugar</h2>
            <ul>
              <li>Loja física em Paragominas/PA com venda online</li>
              <li>Instrumentos, acessórios, cordas, áudio e equipamentos de som</li>
              <li>Luteria, partituras, arranjos, aulas e suporte pelo WhatsApp</li>
            </ul>
          </aside>
        </div>
      </div>

      <div className="container section trust-section" aria-labelledby="trust-title">
        <div className="section-heading">
          <p className="eyebrow">Confiança para comprar</p>
          <h2 id="trust-title">Por que comprar na Allegro?</h2>
          <p className="subtitle">Uma loja local, física e online, com atendimento especializado para ajudar você a escolher melhor antes, durante e depois da compra.</p>
        </div>
        <div className="trust-grid" aria-label="Diferenciais da Allegro Music Store">
          {homeTrustCards.map((card, index) => (
            <article key={card.title} className="trust-card">
              <span className="trust-card-icon" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="world-cup-campaign" aria-labelledby="world-cup-campaign-title">
        <div className="container world-cup-campaign-grid">
          <div className="world-cup-campaign-copy">
            <p className="world-cup-campaign-kicker">Oferta da semana · Copa, Brasil, música e comemoração</p>
            <h2 id="world-cup-campaign-title">Esquenta da Copa na Allegro</h2>
            <p className="world-cup-campaign-subtitle">Prepare sua torcida com música, acessórios e atendimento especial na loja física e online.</p>
            <p className="world-cup-campaign-text">Produtos para começar hoje: opções musicais, acessórios, serviços e atendimento pelo WhatsApp para entrar no clima da maior festa do futebol.</p>
            <div className="world-cup-campaign-actions">
              <Link className="btn btn-main world-cup-campaign-products" to="/catalogo" onClick={() => trackEvent('click_campaign_products', { campanha: 'esquenta_copa' })}>
                <span>Ver produtos</span>
                <ArrowIcon />
              </Link>
              <a
                className="btn btn-whatsapp world-cup-campaign-whatsapp"
                href={buildWhatsAppLink(whatsappNumber, WORLD_CUP_CAMPAIGN_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('click_whatsapp', { origem: 'home_esquenta_copa' })}
              >
                <WhatsAppIcon />
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>
          <div className="world-cup-campaign-panel" aria-label="Destaques da campanha">
            {worldCupCampaignCards.map((card, index) => (
              <article key={card} className="world-cup-campaign-card">
                <span className="world-cup-campaign-card-number">0{index + 1}</span>
                <h3>{card}</h3>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="container section" id="categorias">
        <div className="section-heading">
          <p className="eyebrow">Compre por departamento</p>
          <h2>Categorias em destaque</h2>
          <p className="subtitle">Navegue por instrumentos musicais, acessórios, áudio profissional e serviços para estudo, igreja, palco e uso profissional.</p>
        </div>
        <div className="features-grid marketplace-categories" aria-label="Categorias em destaque">
          {featuredCategories.map((item) => (
            <Link key={item.title} className="feature-card category-card" to={item.isService ? '/servicos' : `/catalogo?categoria=${encodeURIComponent(item.category)}`} onClick={() => { if (item.isService) trackEvent('click_services', { origem: 'home_categorias' }); }}>
              <span className="category-card-icon"><CategoryIcon type={item.icon} /></span>
              <span className="category-card-title">{item.title}</span>
              <span className="category-card-description">{item.description}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="container section home-products-section" id="produtos">
        <div className="section-heading with-action">
          <div>
            <h2>Produtos em destaque</h2>
            <p className="subtitle">Produtos selecionados pela equipe para equipar seu som com qualidade, visual valorizado, preço em destaque e compra rápida quando disponível.</p>
          </div>
          <Link to="/catalogo" className="btn btn-secondary">Ver todos os produtos</Link>
        </div>
        {loadingFeatured ? <p>Carregando produtos em destaque...</p> : <div className="products-grid">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
      </div>

      <div className="container section whatsapp-choice-section" aria-labelledby="whatsapp-choice-title">
        <div className="whatsapp-choice-cta">
          <div>
            <p className="eyebrow">Atendimento especializado</p>
            <h2 id="whatsapp-choice-title">Precisa de ajuda para escolher seu instrumento ou acessório?</h2>
            <p>Fale com a equipe da Allegro Music Store e receba orientação para encontrar o produto certo para sua necessidade.</p>
          </div>
          <a
            className="btn btn-whatsapp"
            href={buildWhatsAppLink(whatsappNumber, HOME_SPECIALIST_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('click_whatsapp', { origem: 'home_cta_especialista' })}
          >
            <WhatsAppIcon />
            <span>Falar com especialista no WhatsApp</span>
          </a>
        </div>
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
                    onClick={() => trackEvent('click_whatsapp', { origem: 'home_chegou_na_allegro' })}
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
          <p className="subtitle">Luteria, regulagem, troca de cordas, partituras, arranjos musicais e aulas para apoiar sua rotina musical.</p>
        </div>
        <div className="services-grid">
          {services.slice(0, 3).map((service) => (
            <Link key={service.title} className="service-card service-card-link" to="/servicos" onClick={() => trackEvent('click_services', { origem: 'home_servicos' })}>
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
