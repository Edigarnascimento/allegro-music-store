import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { CartIcon, WhatsAppIcon } from '../components/PublicButtonIcons';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink, formatPriceBRL, resolveWhatsappNumber } from '../lib/whatsapp';
import { getProductById } from '../services/productsService';
import { createInterest } from '../services/interessesService';
import { useCart } from '../context/CartContext';

const PRODUCT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80';

function ProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const whatsappNumber = useStoreWhatsappNumber();
  const { addToCart } = useCart();
  const [cartFeedback, setCartFeedback] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        const data = await getProductById(productId);
        if (!isMounted) return;

        if (data) {
          setProduct({
            ...data,
            nome: data.nome ?? data.name,
            descricao: data.descricao ?? data.description ?? data.shortDescription,
            preco: data.preco ?? data.price ?? 0,
            categoria: data.categoria ?? data.category,
            imagem_url: data.imagem_url ?? data.image,
            imagens: Array.isArray(data.imagens) ? data.imagens : [],
            estoque: Number.isFinite(Number(data.estoque)) ? Number(data.estoque) : null,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();
    return () => { isMounted = false; };
  }, [productId]);

  useEffect(() => {
    setSelectedImageUrl(product?.imagem_url || PRODUCT_IMAGE_FALLBACK);
  }, [product?.id, product?.imagem_url]);

  if (loading) return <section className="container section"><h1>Carregando produto...</h1></section>;
  if (!product) return <section className="container section"><h1>Produto não encontrado</h1><Link to="/catalogo" className="btn">Voltar ao catálogo</Link></section>;

  const currentPageLink = window.location.href;
  const whatsappMessage = [
    `Olá! Tenho interesse no produto: ${product.nome}.`,
    `Categoria: ${product.categoria ?? 'Não informada'}.`,
    `Preço: ${formatPriceBRL(product.preco)}.`,
    `Link: ${currentPageLink}`,
    'Gostaria de mais informações.',
  ].join('\n');
  const whatsappLink = buildWhatsAppLink(whatsappNumber, whatsappMessage);
  const estoqueInformado = Number.isFinite(Number(product.estoque));
  const indisponivel = estoqueInformado && Number(product.estoque) <= 0;
  const estoqueBaixo = estoqueInformado && Number(product.estoque) > 0 && Number(product.estoque) <= 3;
  const estoqueStatus = indisponivel ? 'Indisponível' : estoqueBaixo ? `Últimas unidades (${product.estoque})` : 'Em estoque';
  const galleryImages = [
    { id: 'principal', image_url: product.imagem_url || PRODUCT_IMAGE_FALLBACK, label: 'Imagem principal' },
    ...(product.imagens || []).map((image, index) => ({ ...image, label: `Foto adicional ${index + 1}` })),
  ].filter((image) => image.image_url);
  const currentImageUrl = selectedImageUrl || product.imagem_url || PRODUCT_IMAGE_FALLBACK;

  async function handleWhatsappClick(event) {
    event.preventDefault();

    try {
      await createInterest({
        produto_id: product.id ?? null,
        produto_nome: product.nome,
        categoria: product.categoria ?? '',
        preco: product.preco ?? 0,
        origem: 'detalhes',
        whatsapp_destino: resolveWhatsappNumber(whatsappNumber),
        mensagem: whatsappMessage,
      });
    } finally {
      window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <section className="container section">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Catálogo', to: '/catalogo' }, { label: product.nome }]} />
      <div className="product-details">
        <div className="product-gallery">
          <img
            src={currentImageUrl}
            alt={product.nome}
            className="details-image"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
            }}
          />
          {galleryImages.length > 1 ? (
            <div className="product-gallery-thumbs" aria-label="Galeria de imagens do produto">
              {galleryImages.map((image) => (
                <button
                  className={`product-gallery-thumb ${currentImageUrl === image.image_url ? 'is-active' : ''}`}
                  type="button"
                  key={image.id || image.image_url}
                  onClick={() => setSelectedImageUrl(image.image_url)}
                  aria-label={`Ver ${image.label}`}
                >
                  <img src={image.image_url} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="details-content">
          <span className="badge">{product.categoria}</span>
          <h1>{product.nome}</h1>
          <strong className="price">{formatPriceBRL(product.preco)}</strong>
          <div className={`stock-status ${indisponivel ? 'out' : estoqueBaixo ? 'low' : 'ok'}`}>{estoqueStatus}</div>
          {cartFeedback ? <p className="error-text">{cartFeedback}</p> : null}
          <p>{product.descricao}</p>
          <h3>Informações adicionais</h3>
          <ul className="details-benefits">
            <li>Garantia de fábrica e nota fiscal</li>
            <li>Suporte técnico especializado</li>
            <li>Opções de upgrade com acessórios</li>
          </ul>
          <div className="product-actions">
            <a className="btn btn-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" onClick={handleWhatsappClick}><WhatsAppIcon /><span>Falar no WhatsApp</span></a>
            <button className="btn btn-cart" type="button" disabled={indisponivel} onClick={() => { const result = addToCart(product); if (!result?.ok) setCartFeedback(result.message); else setCartFeedback(''); }}><CartIcon /><span>{indisponivel ? 'Indisponível' : 'Adicionar ao carrinho'}</span></button>
            <Link to="/catalogo" className="btn btn-secondary">Voltar ao catálogo</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
