import { Link, useNavigate } from 'react-router-dom';
import { ArrowIcon, CartIcon, WhatsAppIcon } from './PublicButtonIcons';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink, formatPriceBRL, resolveWhatsappNumber } from '../lib/whatsapp';
import { createInterest } from '../services/interessesService';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { trackEvent } from '../services/analyticsService';

const PRODUCT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const whatsappNumber = useStoreWhatsappNumber();
  const { addToCart } = useCart();
  const [cartFeedback, setCartFeedback] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const normalizedProduct = {
    id: product.id,
    nome: product.nome ?? product.name,
    descricao: product.descricao ?? product.shortDescription ?? product.description,
    preco: product.preco ?? product.price ?? 0,
    categoria: product.categoria ?? product.category,
    imagem_url: product.imagem_url ?? product.image,
    estoque: Number.isFinite(Number(product.estoque)) ? Number(product.estoque) : null,
  };

  const detailsPath = `/produto/${normalizedProduct.id}`;
  const productLink = normalizedProduct.id
    ? `${window.location.origin}${detailsPath}`
    : window.location.href;

  const whatsappMessage = [
    `Olá! Tenho interesse no produto: ${normalizedProduct.nome}.`,
    `Categoria: ${normalizedProduct.categoria ?? 'Não informada'}.`,
    `Preço: ${formatPriceBRL(normalizedProduct.preco)}.`,
    `Link: ${productLink}`,
    'Gostaria de mais informações.',
  ].join('\n');

  const whatsappLink = buildWhatsAppLink(whatsappNumber, whatsappMessage);
  const estoque = normalizedProduct.estoque;
  const estoqueInformado = Number.isFinite(estoque);
  const indisponivel = estoqueInformado && estoque <= 0;
  const estoqueBaixo = estoqueInformado && estoque > 0 && estoque <= 3;
  const estoqueStatus = indisponivel ? 'Indisponível' : estoqueBaixo ? `Últimas unidades (${estoque})` : 'Em estoque';

  async function handleWhatsappClick(event) {
    event.preventDefault();
    trackEvent('click_whatsapp', {
      origem: 'product_card',
      produto_id: normalizedProduct.id,
      produto_nome: normalizedProduct.nome,
      categoria: normalizedProduct.categoria ?? '',
    });

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

  function handleAddToCart(goToCheckout = false) {
    trackEvent(goToCheckout ? 'click_checkout' : 'click_cart', {
      origem: goToCheckout ? 'product_card_buy_now' : 'product_card_add_to_cart',
      produto_id: normalizedProduct.id,
      produto_nome: normalizedProduct.nome,
      categoria: normalizedProduct.categoria ?? '',
    });
    setAddingToCart(true);
    const result = addToCart(normalizedProduct);
    setAddingToCart(false);
    if (!result?.ok) {
      setCartFeedback(result.message);
      return;
    }

    setCartFeedback('');
    setAddedToCart(true);
    window.dispatchEvent(new CustomEvent('cart:item-added'));
    window.setTimeout(() => setAddedToCart(false), 2600);
    if (goToCheckout) navigate('/checkout');
  }

  return (
    <article className="product-card">
      <Link to={detailsPath} className="product-image-link" aria-label={`Ver detalhes de ${normalizedProduct.nome}`}>
        <img
          src={normalizedProduct.imagem_url || PRODUCT_IMAGE_FALLBACK}
          alt={normalizedProduct.nome}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
          }}
        />
      </Link>
      <div className="product-content">
        <span className="badge">{normalizedProduct.categoria}</span>
        <h3>
          <Link to={detailsPath} className="product-name-link">{normalizedProduct.nome}</Link>
        </h3>
        <p>{normalizedProduct.descricao}</p>
        <strong className="product-price">{formatPriceBRL(normalizedProduct.preco)}</strong>
        <div className="installments">até 12x sem juros no cartão</div>
        <div className={`stock-status ${indisponivel ? 'out' : estoqueBaixo ? 'low' : 'ok'}`}>{estoqueStatus}</div>
        {cartFeedback ? <p className="error-text">{cartFeedback}</p> : null}
        {addedToCart ? (
          <div className="cart-added-banner" role="status" aria-live="polite">
            <strong>Produto adicionado ao carrinho.</strong>
            <div className="cart-added-actions">
              <Link to="/carrinho" className="btn btn-secondary btn-compact" onClick={() => trackEvent('click_cart', { origem: 'product_card_added_banner' })}>Ver carrinho</Link>
              <Link to="/checkout" className="btn btn-secondary btn-compact" onClick={() => trackEvent('click_checkout', { origem: 'product_card_added_banner' })}>Finalizar compra</Link>
              <button type="button" className="btn btn-secondary btn-compact" onClick={() => setAddedToCart(false)}>Continuar</button>
            </div>
          </div>
        ) : null}
        <div className="product-actions">
          <button type="button" className={`btn btn-cart btn-compact ${addedToCart ? 'is-added' : ''}`} disabled={indisponivel || addingToCart} onClick={() => handleAddToCart(false)}><CartIcon /><span>{indisponivel ? 'Indisponível' : addingToCart ? 'Adicionando...' : addedToCart ? 'Adicionado!' : 'Adicionar'}</span></button>
          <button type="button" className="btn btn-main btn-compact" disabled={indisponivel || addingToCart} onClick={() => handleAddToCart(true)}>{addingToCart ? 'Processando...' : 'Comprar agora'}</button>
          <Link to={detailsPath} className="btn btn-main btn-compact"><span>Detalhes</span><ArrowIcon /></Link>
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-compact" onClick={handleWhatsappClick}><WhatsAppIcon /><span>WhatsApp</span></a>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
