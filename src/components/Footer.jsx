function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>Allegro Music Store</h3>
          <p>Instrumentos, acessórios e serviços com padrão profissional para músicos exigentes.</p>
        </div>
        <div>
          <h4>Atendimento</h4>
          <p>Seg a Sex: 9h às 19h</p>
          <p>Sáb: 9h às 15h</p>
        </div>
        <div>
          <h4>Contato rápido</h4>
          <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">WhatsApp: (11) 99999-9999</a>
          <p>contato@allegromusicstore.com</p>
        </div>
      </div>
      <div className="container footer-copy">© {new Date().getFullYear()} Allegro Music Store — Todos os direitos reservados.</div>
    </footer>
  );
}

export default Footer;
