import { Link, useParams } from 'react-router-dom';
import { products } from '../data/products';

const WHATSAPP_NUMBER = '5511999999999';

function ProductDetailsPage() {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return (
      <section className="container section">
        <h1>Produto não encontrado</h1>
        <Link to="/catalogo" className="btn">
          Voltar ao catálogo
        </Link>
      </section>
    );
  }

  const whatsappMessage = encodeURIComponent(`Olá! Gostaria de mais detalhes sobre ${product.name}.`);

  return (
    <section className="container section product-details">
      <img src={product.image} alt={product.name} className="details-image" />
      <div>
        <span className="badge">{product.category}</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <strong className="price">R$ {product.price.toLocaleString('pt-BR')}</strong>
        <div className="product-actions">
          <a className="btn btn-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
            Falar no WhatsApp
          </a>
          <Link to="/catalogo" className="btn btn-secondary">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
