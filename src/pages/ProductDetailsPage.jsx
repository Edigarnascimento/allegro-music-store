import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { WhatsAppIcon } from '../components/PublicButtonIcons';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink, formatPriceBRL, resolveWhatsappNumber } from '../lib/whatsapp';
import { getProductById } from '../services/productsService';
import { createInterest } from '../services/interessesService';

const PRODUCT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80';

function ProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const whatsappNumber = useStoreWhatsappNumber();

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
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();
    return () => { isMounted = false; };
  }, [productId]);

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
        <img
          src={product.imagem_url || PRODUCT_IMAGE_FALLBACK}
          alt={product.nome}
          className="details-image"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
          }}
        />
        <div className="details-content">
          <span className="badge">{product.categoria}</span>
          <h1>{product.nome}</h1>
          <strong className="price">{formatPriceBRL(product.preco)}</strong>
          <p>{product.descricao}</p>
          <h3>Informações adicionais</h3>
          <ul className="details-benefits">
            <li>Garantia de fábrica e nota fiscal</li>
            <li>Suporte técnico especializado</li>
            <li>Opções de upgrade com acessórios</li>
          </ul>
          <div className="product-actions">
            <a className="btn btn-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" onClick={handleWhatsappClick}><WhatsAppIcon /><span>Falar no WhatsApp</span></a>
            <Link to="/catalogo" className="btn btn-secondary">Voltar ao catálogo</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
