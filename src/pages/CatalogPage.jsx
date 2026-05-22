import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

function CatalogPage() {
  return (
    <section className="container section">
      <h1>Catálogo de Produtos</h1>
      <p className="subtitle">Seleção de instrumentos com qualidade de palco e estúdio.</p>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default CatalogPage;
