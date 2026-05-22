import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { getProductById } from '../services/productsService';

const WHATSAPP_NUMBER = '5511999999999';

function ProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const whatsappMessage = encodeURIComponent(`Olá! Gostaria de mais detalhes sobre ${product.nome}.`);

  return (
    <section className="container section">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Catálogo', to: '/catalogo' }, { label: product.nome }]} />
      <div className="product-details">
        <img src={product.imagem_url} alt={product.nome} className="details-image" />
        <div className="details-content">
          <span className="badge">{product.categoria}</span>
          <h1>{product.nome}</h1>
          <strong className="price">R$ {Number(product.preco).toLocaleString('pt-BR')}</strong>
          <p>{product.descricao}</p>
          <h3>Informações adicionais</h3>
          <ul className="details-benefits">
            <li>Garantia de fábrica e nota fiscal</li>
            <li>Suporte técnico especializado</li>
            <li>Opções de upgrade com acessórios</li>
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
