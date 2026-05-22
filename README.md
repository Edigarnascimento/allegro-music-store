# Allegro Music Store

Primeira versão de um site profissional para loja de música, desenvolvido com **React + Vite**, com foco em design moderno, navegação clara e experiência responsiva.

## Funcionalidades

- Página inicial moderna
- Catálogo de produtos com fallback para dados mockados
- Página de detalhes do produto
- Página de serviços
- Página de contato
- Botões de WhatsApp em catálogo e detalhes
- Layout responsivo para celular
- Estrutura inicial para integração com Supabase

## Estrutura de pastas

```bash
src/
  components/
  data/
  lib/
    supabaseClient.js
  pages/
  services/
    productsService.js
    categoriesService.js
    storeSettingsService.js
    adminService.js
  styles/
```

## Pré-requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
npm install
```

## Configuração do Supabase

1. Copie o arquivo de exemplo de variáveis:

```bash
cp .env.example .env
```

2. Preencha no `.env`:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

3. Sem essas variáveis, o projeto continua funcionando com dados mockados (`src/data`).

### Tabelas esperadas (fase inicial)

> Como o banco será compartilhado com outros projetos, as tabelas do Allegro usam o prefixo `music_` para evitar conflitos de nomes.

- `music_produtos`
- `music_categorias`
- `music_configuracoes_loja`

> Nesta etapa, o painel administrativo ainda **não foi implementado**. Foi criada apenas a base de serviços para suportar essa evolução.

## Executar em desenvolvimento

```bash
npm run dev
```

## Gerar build de produção

```bash
npm run build
```

## Publicar o projeto

Você pode publicar facilmente em plataformas como Vercel, Netlify ou Cloudflare Pages.

### Exemplo (Vercel)

1. Suba o repositório para o GitHub.
2. Importe o projeto na Vercel.
3. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Clique em **Deploy**.

## Próximos passos

- Conectar páginas aos serviços de dados Supabase
- Adicionar busca, filtros e paginação
- Evoluir painel administrativo (autenticação, CRUD e uploads)
