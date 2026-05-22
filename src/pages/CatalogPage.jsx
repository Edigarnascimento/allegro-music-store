import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

function CatalogPage() {
  return (
    <section className="container section">
      <div className="section-heading">
        <h1>Catálogo de Produtos</h1>
        <p className="subtitle">Instrumentos selecionados para quem busca performance, timbre e confiabilidade.</p>
      </div>
      <div className="catalog-highlight">
        <p>Precisa de ajuda para escolher? Nossa equipe recomenda o melhor setup para seu estilo.</p>
        <a className="btn btn-whatsapp" href="https://wa.me/5511999999999?text=Olá!%20Preciso%20de%20ajuda%20para%20escolher%20um%20instrumento." target="_blank" rel="noreferrer">Atendimento no WhatsApp</a>
      </div>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default CatalogPage;
