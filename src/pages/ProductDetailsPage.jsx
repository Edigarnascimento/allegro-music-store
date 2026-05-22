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
        <Link to="/catalogo" className="btn">Voltar ao catálogo</Link>
      </section>
    );
  }

  const whatsappMessage = encodeURIComponent(`Olá! Gostaria de mais detalhes sobre ${product.name}.`);

  return (
    <section className="container section">
      <div className="product-details">
        <img src={product.image} alt={product.name} className="details-image" />
        <div className="details-content">
          <span className="badge">{product.category}</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <strong className="price">R$ {product.price.toLocaleString('pt-BR')}</strong>
          <ul className="details-benefits">
            <li>Garantia de fábrica</li>
            <li>Suporte técnico especializado</li>
            <li>Possibilidade de upgrade com acessórios</li>
          </ul>
          <div className="product-actions">
            <a className="btn btn-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
            <Link to="/catalogo" className="btn btn-secondary">Voltar ao catálogo</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
