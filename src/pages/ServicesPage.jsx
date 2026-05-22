import { services } from '../data/services';

function ServicesPage() {
  return (
    <section className="container section">
      <div className="section-heading">
        <h1>Serviços especializados</h1>
        <p className="subtitle">Equipe técnica preparada para cuidar do seu instrumento antes e depois da compra.</p>
      </div>
      <div className="services-grid">
        {services.map((service) => (
          <article key={service.title} className="service-card">
            <h2>{service.title}</h2>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
      <div className="catalog-highlight">
        <p>Agende avaliação técnica e receba uma proposta sob medida para seu setup.</p>
        <a className="btn" href="/contato">Solicitar orçamento</a>
      </div>
    </section>
  );
}

export default ServicesPage;
