import Breadcrumbs from '../components/Breadcrumbs';
function ContactPage() {
  return (
    <section className="container section">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Contato' }]} />
      <div className="section-heading">
        <h1>Contato</h1>
        <p className="subtitle">Atendimento consultivo para compras, serviços e pós-venda.</p>
      </div>
      <div className="contact-layout">
        <div className="contact-card">
          <h2>Fale com um especialista</h2>
          <p><strong>Telefone:</strong> (11) 99999-9999</p>
          <p><strong>E-mail:</strong> contato@allegromusicstore.com</p>
          <p><strong>Endereço:</strong> Av. da Música, 1000 - São Paulo, SP</p>
          <a className="btn btn-whatsapp" href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20informações%20sobre%20a%20Allegro%20Music%20Store." target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
        </div>
        <div className="contact-card">
          <h2>Por que nosso atendimento é diferente?</h2>
          <ul className="details-benefits">
            <li>Orientação por perfil musical e orçamento</li>
            <li>Suporte técnico com linguagem simples</li>
            <li>Acompanhamento até a entrega do produto</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
