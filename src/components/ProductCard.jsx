import { Link } from 'react-router-dom';

const WHATSAPP_NUMBER = '5511999999999';

function ProductCard({ product }) {
  const whatsappMessage = encodeURIComponent(`Olá! Tenho interesse no produto ${product.name}.`);
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <article className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-content">
        <span className="badge">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.shortDescription}</p>
        <strong>R$ {product.price.toLocaleString('pt-BR')}</strong>
        <div className="product-actions">
          <Link to={`/produto/${product.id}`} className="btn btn-secondary">
            Ver detalhes
          </Link>
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
