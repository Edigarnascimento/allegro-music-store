import { Link } from 'react-router-dom';
import { ArrowIcon, WhatsAppIcon } from './PublicButtonIcons';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink, formatPriceBRL, resolveWhatsappNumber } from '../lib/whatsapp';
import { createInterest } from '../services/interessesService';

const PRODUCT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80';

function ProductCard({ product }) {
  const whatsappNumber = useStoreWhatsappNumber();

  const normalizedProduct = {
    id: product.id,
    nome: product.nome ?? product.name,
    descricao: product.descricao ?? product.shortDescription ?? product.description,
    preco: product.preco ?? product.price ?? 0,
    categoria: product.categoria ?? product.category,
    imagem_url: product.imagem_url ?? product.image,
  };

  const productLink = normalizedProduct.id
    ? `${window.location.origin}/produto/${normalizedProduct.id}`
    : window.location.href;

  const whatsappMessage = [
    `Olá! Tenho interesse no produto: ${normalizedProduct.nome}.`,
    `Categoria: ${normalizedProduct.categoria ?? 'Não informada'}.`,
    `Preço: ${formatPriceBRL(normalizedProduct.preco)}.`,
    `Link: ${productLink}`,
    'Gostaria de mais informações.',
  ].join('\n');

  const whatsappLink = buildWhatsAppLink(whatsappNumber, whatsappMessage);

  async function handleWhatsappClick(event) {
    event.preventDefault();

    try {
      await createInterest({
        produto_id: normalizedProduct.id ?? null,
        produto_nome: normalizedProduct.nome,
        categoria: normalizedProduct.categoria ?? '',
        preco: normalizedProduct.preco ?? 0,
        origem: 'catalogo',
        whatsapp_destino: resolveWhatsappNumber(whatsappNumber),
        mensagem: whatsappMessage,
      });
    } finally {
      window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <article className="product-card">
      <img
        src={normalizedProduct.imagem_url || PRODUCT_IMAGE_FALLBACK}
        alt={normalizedProduct.nome}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
        }}
      />
      <div className="product-content">
        <span className="badge">{normalizedProduct.categoria}</span>
        <h3>{normalizedProduct.nome}</h3>
        <p>{normalizedProduct.descricao}</p>
        <strong className="product-price">{formatPriceBRL(normalizedProduct.preco)}</strong>
        <div className="installments">até 12x sem juros no cartão</div>
        <div className="product-actions">
          <Link to={`/produto/${normalizedProduct.id}`} className="btn btn-main btn-compact"><span>Ver detalhes</span><ArrowIcon /></Link>
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-compact" onClick={handleWhatsappClick}><WhatsAppIcon /><span>WhatsApp</span></a>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
