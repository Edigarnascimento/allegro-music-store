import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

const PAGES = {
  privacidade: {
    title: 'Política de Privacidade',
    subtitle: 'Seu atendimento e seus dados são tratados com responsabilidade.',
    sections: [
      {
        heading: 'Coleta e uso de dados',
        text: 'Utilizamos dados informados no checkout (nome, WhatsApp, endereço e e-mail opcional) apenas para processar pedidos, atendimento e suporte pós-venda.',
      },
      {
        heading: 'Compartilhamento',
        text: 'Não comercializamos seus dados pessoais. Compartilhamentos são limitados aos parceiros necessários para entrega e comunicação do pedido.',
      },
      {
        heading: 'Segurança',
        text: 'Adotamos boas práticas técnicas para proteção dos dados e monitoramos acessos administrativos para reduzir riscos de uso indevido.',
      },
    ],
  },
  trocas: {
    title: 'Trocas e Devoluções',
    subtitle: 'Processo claro para compras com tranquilidade.',
    sections: [
      { heading: 'Prazo para solicitação', text: 'Solicitações de troca ou devolução podem ser feitas em até 7 dias corridos após o recebimento, conforme legislação aplicável para compras online.' },
      { heading: 'Condições do produto', text: 'O item deve estar com embalagem original, sem sinais de mau uso e com todos os acessórios. Produtos com uso indevido podem ser recusados na análise.' },
      { heading: 'Como iniciar', text: 'Fale com nossa equipe pelo WhatsApp informando o número do pedido para receber orientações de coleta, envio ou troca em loja.' },
    ],
  },
  pagamento: {
    title: 'Formas de Pagamento',
    subtitle: 'Opções disponíveis para fechamento do seu pedido.',
    sections: [
      { heading: 'PIX (manual)', text: 'Quando a opção PIX estiver disponível no checkout, a chave e os dados do recebedor serão exibidos no final do pedido. A confirmação ocorre apenas após validação manual do comprovante.' },
      { heading: 'Pagamento a combinar', text: 'Você pode enviar o pedido e alinhar com nossa equipe a melhor forma de pagamento pelo WhatsApp.' },
      { heading: 'Importante', text: 'Não realizamos confirmação automática de PIX no momento. O acompanhamento do pedido também é feito pelo WhatsApp.' },
    ],
  },
  entrega: {
    title: 'Entrega e Retirada',
    subtitle: 'Informações sobre logística e disponibilidade.',
    sections: [
      { heading: 'Entrega', text: 'Realizamos entregas conforme região atendida. Prazos e valores podem variar por CEP e tipo de produto.' },
      { heading: 'Retirada na loja', text: 'Quando disponível, você pode retirar na loja com agendamento após confirmação do pedido.' },
      { heading: 'Estoque e disponibilidade', text: 'Trabalhamos com atualização frequente de estoque, porém disponibilidade final pode ser confirmada pela equipe antes da expedição.' },
    ],
  },
  sobre: {
    title: 'Sobre a Loja',
    subtitle: 'Allegro Music Store: equipamentos e atendimento especializado.',
    sections: [
      { heading: 'Nossa proposta', text: 'Atendemos músicos, igrejas, estúdios e produtores com foco em qualidade, consultoria e suporte real no pré e pós-venda.' },
      { heading: 'Atendimento humano', text: 'Nosso time acompanha cada pedido e presta suporte pelo WhatsApp para orientar escolha de produtos e andamento da compra.' },
      { heading: 'Compromisso', text: 'Trabalhamos para oferecer uma experiência confiável, com comunicação transparente sobre pagamento, estoque, entrega e assistência.' },
    ],
  },
};

export default function InstitutionalPage() {
  const { slug } = useParams();
  const page = PAGES[slug];

  if (!page) {
    return (
      <section className="container section">
        <h1>Página não encontrada</h1>
        <Link className="btn" to="/">Voltar para a home</Link>
      </section>
    );
  }

  return (
    <section className="container section">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: page.title }]} />
      <div className="section-heading">
        <h1>{page.title}</h1>
        <p className="subtitle">{page.subtitle}</p>
      </div>
      <div className="services-grid">
        {page.sections.map((section) => (
          <article key={section.heading} className="service-card">
            <h3>{section.heading}</h3>
            <p>{section.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
