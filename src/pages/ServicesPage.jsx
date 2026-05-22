import { services } from '../data/services';

function ServicesPage() {
  return (
    <section className="container section">
      <h1>Serviços</h1>
      <p className="subtitle">Soluções especializadas para manter sua música sempre em alta performance.</p>
      <div className="services-grid">
        {services.map((service) => (
          <article key={service.title} className="service-card">
            <h2>{service.title}</h2>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ServicesPage;
