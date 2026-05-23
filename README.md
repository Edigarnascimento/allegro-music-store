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

### SQL sugerido para campos PIX em `music_configuracoes_loja`

```sql
alter table music_configuracoes_loja add column if not exists chave_pix text;
alter table music_configuracoes_loja add column if not exists nome_recebedor_pix text;
alter table music_configuracoes_loja add column if not exists banco_pix text;
alter table music_configuracoes_loja add column if not exists instrucoes_pix text;
```

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

### Storage para imagens de produtos (`product-images`)

Para o upload funcionar no painel (`/admin/produtos/novo` e `/admin/produtos/editar/:id`), crie um bucket no Supabase Storage:

1. No Supabase Dashboard, acesse **Storage > Buckets**.
2. Clique em **Create bucket**.
3. Nome: `product-images`.
4. Marque como **Public bucket** (necessário para `getPublicUrl`).

#### Políticas recomendadas (Storage)

No SQL Editor, ajuste as políticas para o bucket `product-images`:

```sql
-- Leitura pública dos arquivos do bucket
create policy "Public can view product images"
on storage.objects
for select
using (bucket_id = 'product-images');

-- Upload apenas para usuários autenticados (admin)
create policy "Authenticated users can upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images');

-- Atualização apenas para usuários autenticados
create policy "Authenticated users can update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

-- Remoção apenas para usuários autenticados
create policy "Authenticated users can delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images');
```

> Observação: se o bucket não existir, o cadastro/edição de produto continua disponível em modo mock/local, porém sem persistência remota de arquivos.

## Módulo de Interesses / Orçamentos (WhatsApp)

Para registrar o interesse do cliente ao clicar no botão de WhatsApp (sem exigir login), crie a tabela abaixo no Supabase:

```sql
create table if not exists public.music_interesses (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid null,
  produto_nome text,
  categoria text,
  preco numeric(10,2),
  origem text,
  whatsapp_destino text,
  mensagem text,
  created_at timestamp with time zone default now()
);
```

### Políticas RLS recomendadas

```sql
alter table public.music_interesses enable row level security;

-- Permite registrar interesse de forma pública/anônima
create policy "Public can insert interests"
on public.music_interesses
for insert
to anon, authenticated
with check (true);

-- Permite leitura apenas para usuários autenticados (admin)
create policy "Authenticated can read interests"
on public.music_interesses
for select
to authenticated
using (true);
```

### Observação importante

O clique no WhatsApp **não deve ser bloqueado** se o registro no banco falhar.
A aplicação faz fallback seguro: registra quando possível e, em caso de erro/ausência de configuração do Supabase, apenas emite `console.warn` e abre o WhatsApp normalmente.
Sem dados pessoais do cliente: apenas metadados do produto e origem do clique.

## SQL sugerido: carrinho e pedidos

```sql
create table if not exists public.music_pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_nome text not null,
  cliente_whatsapp text not null,
  cliente_email text,
  endereco_entrega text,
  observacoes text,
  status text default 'novo',
  subtotal numeric(10,2),
  total numeric(10,2),
  forma_entrega text,
  forma_pagamento text,
  created_at timestamp with time zone default now()
);

create table if not exists public.music_pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references public.music_pedidos(id) on delete cascade,
  produto_id uuid,
  produto_nome text,
  categoria text,
  quantidade integer,
  preco_unitario numeric(10,2),
  subtotal numeric(10,2),
  created_at timestamp with time zone default now()
);

alter table public.music_pedidos enable row level security;
alter table public.music_pedido_itens enable row level security;

create policy "public_insert_music_pedidos" on public.music_pedidos
for insert to anon, authenticated with check (true);

create policy "public_insert_music_pedido_itens" on public.music_pedido_itens
for insert to anon, authenticated with check (true);

create policy "admin_select_music_pedidos" on public.music_pedidos
for select to authenticated using (true);

create policy "admin_update_music_pedidos" on public.music_pedidos
for update to authenticated using (true) with check (true);

create policy "admin_select_music_pedido_itens" on public.music_pedido_itens
for select to authenticated using (true);
```
