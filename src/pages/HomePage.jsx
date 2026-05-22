import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <section>
      <div className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Excelência em instrumentos e atendimento</p>
            <h1>Som profissional para sua melhor performance.</h1>
            <p>
              A Allegro Music Store oferece instrumentos selecionados, consultoria especializada e serviços para músicos
              de todos os níveis.
            </p>
            <div className="hero-actions">
              <Link className="btn" to="/catalogo">
                Explorar catálogo
              </Link>
              <Link className="btn btn-secondary" to="/servicos">
                Conhecer serviços
              </Link>
            </div>
          </div>
          <div className="hero-panel">
            <h2>Por que escolher a Allegro?</h2>
            <ul>
              <li>Curadoria premium de instrumentos</li>
              <li>Equipe técnica especializada</li>
              <li>Atendimento rápido via WhatsApp</li>
              <li>Suporte pós-venda dedicado</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
