import { Link } from 'react-router-dom';

const WHATSAPP_NUMBER = '5511999999999';

function ProductCard({ product }) {
  const normalizedProduct = {
    id: product.id,
    nome: product.nome ?? product.name,
    descricao: product.descricao ?? product.shortDescription ?? product.description,
    preco: product.preco ?? product.price ?? 0,
    categoria: product.categoria ?? product.category,
    imagem_url: product.imagem_url ?? product.image,
  };

  const whatsappMessage = encodeURIComponent(`Olá! Tenho interesse no produto ${normalizedProduct.nome}.`);
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <article className="product-card">
      <img src={normalizedProduct.imagem_url} alt={normalizedProduct.nome} />
      <div className="product-content">
        <span className="badge">{normalizedProduct.categoria}</span>
        <h3>{normalizedProduct.nome}</h3>
        <p>{normalizedProduct.descricao}</p>
        <strong className="product-price">R$ {Number(normalizedProduct.preco).toLocaleString('pt-BR')}</strong>
        <div className="installments">até 12x sem juros no cartão</div>
        <div className="product-actions">
          <Link to={`/produto/${normalizedProduct.id}`} className="btn">Ver detalhes</Link>
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp">WhatsApp</a>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
