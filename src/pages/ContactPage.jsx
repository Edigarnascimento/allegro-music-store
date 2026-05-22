function ContactPage() {
  return (
    <section className="container section">
      <h1>Contato</h1>
      <p className="subtitle">Fale com nossa equipe e receba atendimento personalizado.</p>
      <div className="contact-card">
        <p><strong>Telefone:</strong> (11) 99999-9999</p>
        <p><strong>E-mail:</strong> contato@allegromusicstore.com</p>
        <p><strong>Endereço:</strong> Av. da Música, 1000 - São Paulo, SP</p>
        <a className="btn btn-whatsapp" href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20informações%20sobre%20a%20Allegro%20Music%20Store." target="_blank" rel="noreferrer">
          Chamar no WhatsApp
        </a>
      </div>
    </section>
  );
}

export default ContactPage;
