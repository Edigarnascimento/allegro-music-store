import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { services } from '../data/services';
import { getProducts } from '../services/productsService';

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFeaturedProducts() {
      try {
        const data = await getProducts();

        if (!isMounted) return;

        const activeProducts = data.filter((product) => product.ativo === true || typeof product.ativo === 'undefined');
        const featured = activeProducts.filter((product) => product.destaque === true);
        setFeaturedProducts(featured.length ? featured.slice(0, 3) : activeProducts.slice(0, 3));
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

  return (
    <section>
      <div className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Loja profissional de instrumentos musicais</p>
            <h1>Seu próximo instrumento de palco está na Allegro Music Store.</h1>
            <p>
              Trabalhamos com curadoria premium, suporte técnico especializado e atendimento consultivo para elevar seu som com segurança.
            </p>
            <div className="hero-actions">
              <Link className="btn" to="/catalogo">Explorar catálogo</Link>
              <a className="btn btn-whatsapp" href="https://wa.me/5511999999999?text=Olá!%20Quero%20uma%20consultoria%20para%20escolher%20meu%20instrumento." target="_blank" rel="noreferrer">Falar no WhatsApp</a>
            </div>
          </div>
          <aside className="hero-panel">
            <h2>Condição especial da semana</h2>
            <p>Frete grátis para capitais do Sudeste em compras acima de R$ 1.500 + setup inicial incluso.</p>
            <ul>
              <li>Parcelamento em até 12x</li>
              <li>Garantia estendida opcional</li>
              <li>Atendimento de segunda a sábado</li>
            </ul>
          </aside>
        </div>
      </div>

      <div className="container section">
        <div className="section-heading">
          <h2>Por que escolher a Allegro?</h2>
          <p className="subtitle">Mais que uma loja, um parceiro técnico para sua evolução musical.</p>
        </div>
        <div className="features-grid">
          {['Curadoria com marcas reconhecidas no mercado', 'Luthiers e técnicos especializados na equipe', 'Suporte rápido em pré e pós-venda', 'Entrega segura e acompanhamento em tempo real'].map((item) => (
            <article key={item} className="feature-card"><p>{item}</p></article>
          ))}
        </div>
      </div>

      <div className="container section">
        <div className="section-heading with-action">
          <div>
            <h2>Produtos em destaque</h2>
            <p className="subtitle">Seleção com melhor custo-benefício para estúdio, igreja e palco.</p>
          </div>
          <Link to="/catalogo" className="btn btn-secondary">Ver todos</Link>
        </div>
        {loadingFeatured ? (
          <p>Carregando produtos em destaque...</p>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>

      <div className="container section">
        <div className="section-heading">
          <h2>Serviços da loja</h2>
          <p className="subtitle">Tudo para seu instrumento performar no nível máximo.</p>
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
