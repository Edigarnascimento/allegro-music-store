import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { useStoreWhatsappNumber } from '../hooks/useStoreWhatsappNumber';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { getActiveServiceWorks, getPlaceholderServiceWorks } from '../services/serviceWorksService';

const servicesSections = [
  {
    id: 'luteria',
    title: 'Luteria e manutenção de instrumentos',
    description: 'Cuidados técnicos para manter seu instrumento regulado, confortável e pronto para tocar.',
    tone: 'maintenance',
    services: [
      { name: 'Regulagem básica de instrumentos de cordas', price: 'R$ 180,00' },
      { name: 'Regulagem básica para violão 12 cordas', price: 'R$ 230,00' },
      { name: 'Retífica de trastes', price: 'R$ 180,00' },
      { name: 'Troca de cordas', price: 'Sob consulta' },
      { name: 'Ajuste de oitavas', price: 'Conforme avaliação' },
      { name: 'Limpeza e manutenção preventiva', price: 'Sob consulta' },
      { name: 'Avaliação técnica do instrumento', price: 'Sob consulta' },
    ],
  },
  {
    id: 'partituras',
    title: 'Partituras, transcrições e arranjos',
    description: 'Produção de material musical personalizado para estudos, ensaios, apresentações, grupos e projetos musicais.',
    tone: 'production',
    services: [
      { name: 'Escrita de partituras', price: 'Sob orçamento' },
      { name: 'Transcrição musical', price: 'Sob orçamento' },
      { name: 'Elaboração de arranjos musicais', price: 'Sob orçamento' },
      { name: 'Arranjos para grupos diversos: igrejas, bandas, corais, orquestras e projetos musicais', price: 'Sob orçamento' },
      { name: 'Preparação de material musical para ensaios e apresentações', price: 'Sob orçamento' },
    ],
  },
  {
    id: 'aulas',
    title: 'Aulas de música',
    description: 'Aulas para iniciantes e estudantes que desejam desenvolver sua musicalidade com orientação prática e objetiva.',
    tone: 'teaching',
    services: [
      { name: 'Aulas de violão', price: 'Sob consulta' },
      { name: 'Aulas de teclado', price: 'Sob consulta' },
      { name: 'Aulas de flauta doce', price: 'Sob consulta' },
    ],
  },
];

const fallbackGalleryItems = getPlaceholderServiceWorks();

const faqs = [
  {
    question: 'Preciso levar o instrumento para avaliação?',
    answer: 'Sim, alguns serviços dependem de avaliação para confirmar o estado do instrumento e o serviço necessário.',
  },
  {
    question: 'O orçamento é feito pelo WhatsApp?',
    answer: 'Sim, você pode solicitar orçamento pelo WhatsApp informando o serviço desejado.',
  },
  {
    question: 'As aulas são presenciais ou online?',
    answer: 'As condições podem ser combinadas conforme disponibilidade.',
  },
  {
    question: 'Os arranjos são feitos para quais grupos?',
    answer: 'Podem ser elaborados para igrejas, bandas, corais, orquestras, grupos escolares e projetos musicais.',
  },
];

function ServicesPage() {
  const whatsappNumber = useStoreWhatsappNumber();
  const [serviceWorks, setServiceWorks] = useState([]);

  useEffect(() => {
    let isMounted = true;

    getActiveServiceWorks().then((works) => {
      if (isMounted) setServiceWorks(works);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const galleryItems = serviceWorks.length ? serviceWorks : fallbackGalleryItems;
  const hasRealWorks = serviceWorks.length > 0;

  return (
    <section className="container section services-page">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Serviços' }]} />
      <div className="section-heading">
        <h1>Serviços de Luteria, Partituras e Aulas de Música</h1>
        <p className="subtitle">Conheça nossos serviços especializados e solicite seu orçamento de forma rápida pelo WhatsApp.</p>
      </div>

      {servicesSections.map((section) => (
        <div key={section.id} className={`services-section-card tone-${section.tone}`}>
          <div className="services-section-head">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </div>
          <div className="services-list-grid">
            {section.services.map((service) => {
              const text = `Olá, vim pelo site da Allegro Music Store e gostaria de solicitar orçamento para ${service.name}.`;
              return (
                <article key={service.name} className="service-detail-card">
                  <h3>{service.name}</h3>
                  <p className="service-price">{service.price}</p>
                  <a className="btn btn-whatsapp" href={buildWhatsAppLink(whatsappNumber, text)} target="_blank" rel="noreferrer">Solicitar orçamento</a>
                </article>
              );
            })}
          </div>
        </div>
      ))}

      <div className="services-section-card">
        <div className="services-section-head">
          <h2>Trabalhos realizados</h2>
          <p>{hasRealWorks ? 'Fotos reais dos serviços e resultados entregues pela Allegro Music Store.' : 'Exemplos de serviços e resultados. Em breve, esta galeria receberá fotos reais dos trabalhos da Allegro Music Store.'}</p>
        </div>
        <div className="work-gallery-grid">
          {galleryItems.map((item) => {
            const title = item.titulo || item.title;
            const description = item.descricao || item.description;
            const imageUrl = item.imagem_url;

            return (
              <article key={item.id || title} className="work-gallery-card">
                {imageUrl ? (
                  <img className="work-gallery-photo" src={imageUrl} alt={title} loading="lazy" />
                ) : (
                  <div className="work-gallery-image" aria-hidden="true">Imagem</div>
                )}
                {item.categoria ? <span className="work-gallery-category">{item.categoria}</span> : null}
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="services-section-card">
        <div className="services-section-head">
          <h2>Dúvidas frequentes</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((faq) => (
            <article key={faq.question} className="faq-card">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="services-cta">
        <h2>Precisa de um serviço musical personalizado?</h2>
        <p>Fale com a Allegro Music Store pelo WhatsApp e receba orientação para o serviço ideal.</p>
        <a className="btn btn-whatsapp" href={buildWhatsAppLink(whatsappNumber, 'Olá! Vim pelo site da Allegro Music Store e quero orientação sobre os serviços musicais.')} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
      </div>

      <div className="catalog-highlight">
        <p>Quer continuar comprando equipamentos? Acesse nosso catálogo completo.</p>
        <Link className="btn" to="/catalogo">Ir para o catálogo</Link>
      </div>
    </section>
  );
}

export default ServicesPage;
