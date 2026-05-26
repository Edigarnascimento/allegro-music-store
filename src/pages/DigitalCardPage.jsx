const storeName = 'Allegro Music Store';
const storeSite = 'https://www.allegromusicstore.com.br';
const whatsappNumber = '5591985284572';
const whatsappLink = `https://wa.me/${whatsappNumber}`;
const services = 'instrumentos, acessórios, luteria, partituras, arranjos e aulas';

function DigitalCardPage() {
  return (
    <section className="digital-card-page section">
      <div className="container">
        <div className="digital-card" role="region" aria-label="Cartão digital Allegro Music Store">
          <p className="digital-card-kicker">Cartão digital</p>
          <h1>{storeName}</h1>

          <div className="digital-card-info-grid">
            <div className="digital-card-info">
              <h2>Contato e localização</h2>
              <ul>
                <li>
                  <strong>Site:</strong>{' '}
                  <a href={storeSite} target="_blank" rel="noreferrer">{storeSite}</a>
                </li>
                <li>
                  <strong>WhatsApp:</strong>{' '}
                  <a href={whatsappLink} target="_blank" rel="noreferrer">{whatsappNumber}</a>
                </li>
                <li>
                  <strong>Endereço:</strong> Rua Padre Cícero, nº 22 — Célio Miranda, Paragominas/PA
                </li>
                <li>
                  <strong>Serviços:</strong> {services}
                </li>
              </ul>
            </div>

            <div className="digital-card-qr-wrap" aria-label="QR Codes para acesso rápido">
              <div className="digital-card-qr">
                <h3>QR Code do site</h3>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(storeSite)}`}
                  alt="QR Code para acessar o site da Allegro Music Store"
                  loading="lazy"
                />
              </div>
              <div className="digital-card-qr">
                <h3>QR Code do WhatsApp</h3>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(whatsappLink)}`}
                  alt="QR Code para conversar no WhatsApp da Allegro Music Store"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div className="digital-card-actions" aria-label="Ações do cartão digital">
            <a className="btn" href={storeSite} target="_blank" rel="noreferrer">Comprar na loja online</a>
            <a className="btn btn-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
            <a className="btn btn-secondary" href="/servicos">Ver serviços musicais</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DigitalCardPage;
