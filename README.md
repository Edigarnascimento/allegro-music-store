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
- Painel administrativo com autenticação Supabase

## Estrutura de pastas

```bash
src/
  components/
    admin/
  data/
  lib/
    supabaseClient.js
  pages/
    admin/
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

3. Sem essas variáveis, o projeto continua funcionando com dados mockados (`src/data`) e o painel administrativo funciona em modo mock local (sem persistência remota).

### Tabelas esperadas

- `music_produtos`
- `music_categorias`
- `music_configuracoes_loja`

## Painel administrativo

### Rotas

- `/admin/login`: login com Supabase Auth (`signInWithPassword`)
- `/admin`: dashboard simples
- `/admin/produtos`: listagem e inativação de produtos
- `/admin/produtos/novo`: cadastro de produto
- `/admin/produtos/editar/:id`: edição de produto
- `/admin/categorias`: gerenciamento de categorias
- `/admin/configuracoes`: edição de configurações da loja

### Campos de produto suportados

- `nome`
- `descricao`
- `preco`
- `categoria`
- `imagem_url`
- `destaque`
- `ativo`
- `estoque`

### Proteção de rotas administrativas

- Rotas `/admin/*` (exceto `/admin/login`) passam por validação de sessão.
- Sem sessão válida, o usuário é redirecionado para `/admin/login`.

### Importante

- O site público continua funcionando normalmente.
- Os dados mockados não foram removidos.
- Pagamento online ainda não está implementado.

## Executar em desenvolvimento

```bash
npm run dev
```

## Gerar build de produção

```bash
npm run build
```
