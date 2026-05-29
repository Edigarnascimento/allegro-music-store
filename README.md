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
- `music_produto_imagens` (opcional para galeria de fotos adicionais por produto)
- `music_home_videos` (cards da seção “Chegou na Allegro” da Home)


### SQL sugerido para galeria de imagens de produto

A imagem principal continua no campo `imagem_url` da tabela `music_produtos`. Para fotos adicionais, crie a tabela abaixo:

```sql
create table if not exists public.music_produto_imagens (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.music_produtos(id) on delete cascade,
  image_url text not null,
  ordem integer default 0,
  is_principal boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_music_produto_imagens_produto_id
on public.music_produto_imagens(produto_id);
```

#### Políticas RLS recomendadas para `music_produto_imagens`

As políticas abaixo mantêm leitura pública da galeria no site e escrita apenas por usuários autenticados do painel admin, sem uso de `service_role` no frontend:

```sql
alter table public.music_produto_imagens enable row level security;

create policy "Public can view product gallery images"
on public.music_produto_imagens
for select
to anon, authenticated
using (true);

create policy "Authenticated users can insert product gallery images"
on public.music_produto_imagens
for insert
to authenticated
with check (true);

create policy "Authenticated users can update product gallery images"
on public.music_produto_imagens
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete product gallery images"
on public.music_produto_imagens
for delete
to authenticated
using (true);
```

### SQL sugerido para cards da seção “Chegou na Allegro”

A Home busca os cards ativos na tabela `music_home_videos`, ordenando pelo campo `ordem`. O painel administrativo em `/admin/chegou-na-allegro` permite criar, editar, excluir, ativar/desativar e alterar a ordem desses cards.

```sql
create table if not exists public.music_home_videos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text,
  descricao text,
  video_url text,
  botao_texto text default 'Ver produtos',
  botao_link text default '/catalogo',
  whatsapp_mensagem text,
  ordem integer default 0,
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_music_home_videos_ativo_ordem
on public.music_home_videos(ativo, ordem);

alter table public.music_home_videos enable row level security;

create policy "Public can view active home videos"
on public.music_home_videos
for select
to anon, authenticated
using (ativo = true);

create policy "Authenticated users can manage home videos"
on public.music_home_videos
for all
to authenticated
using (true)
with check (true);
```

Para popular os cards iniciais diretamente pelo SQL Editor, execute depois de criar a tabela:

```sql
insert into public.music_home_videos
  (titulo, categoria, descricao, video_url, botao_texto, botao_link, whatsapp_mensagem, ordem, ativo)
values
  ('Reposição de cordas para violão', 'Cordas', 'Cordas de aço e nylon com reposição frequente para todos os níveis de músicos.', null, 'Ver produtos', '/catalogo?categoria=Cordas', null, 1, true),
  ('Palhetas e acessórios', 'Acessórios', 'Novas palhetas, correias, afinadores e itens essenciais para o dia a dia.', null, 'Ver produtos', '/catalogo?categoria=Acessórios', null, 2, true),
  ('Cabos e conectores', 'Áudio', 'Cabos P10, XLR e conectores de alta durabilidade para ensaios e apresentações.', null, 'Ver produtos', '/catalogo?categoria=Áudio', null, 3, true),
  ('Produtos para músicos iniciantes', 'Iniciante', 'Kits acessíveis para começar com qualidade no estudo de música.', null, 'Ver produtos', '/catalogo', null, 4, true),
  ('Serviço de luteria', 'Luteria', 'Ajustes, regulagem e cuidados técnicos para manter seu instrumento pronto para tocar.', 'https://www.instagram.com/reel/DXkefWWDV9_/?igsh=MWZpeHVtczU4ZjF0OQ==', 'Ver serviços', '/servicos', 'Olá, vi um vídeo de serviço de luteria no site da Allegro Music Store e gostaria de saber mais.', 5, true)
on conflict do nothing;
```

### SQL sugerido para campos PIX em `music_configuracoes_loja`

```sql
alter table music_configuracoes_loja add column if not exists chave_pix text;
alter table music_configuracoes_loja add column if not exists nome_recebedor_pix text;
alter table music_configuracoes_loja add column if not exists banco_pix text;
alter table music_configuracoes_loja add column if not exists instrucoes_pix text;
```

### SQL sugerido para campos de rodapé em `music_configuracoes_loja`

```sql
alter table public.music_configuracoes_loja add column if not exists footer_text text;
alter table public.music_configuracoes_loja add column if not exists atendimento_linha_1 text;
alter table public.music_configuracoes_loja add column if not exists atendimento_linha_2 text;
alter table public.music_configuracoes_loja add column if not exists footer_payment_notice text;
alter table public.music_configuracoes_loja add column if not exists footer_whatsapp_label text;
```

### SQL sugerido para logo da loja em `music_configuracoes_loja`

Se a coluna `logo_url` ainda não existir no Supabase, execute:

```sql
alter table public.music_configuracoes_loja
add column if not exists logo_url text;
```

O upload da logo no painel administrativo reutiliza o bucket público de imagens de produto (`product-images`) e grava os arquivos na pasta `logos/`, usando a chave anônima do Supabase no frontend.

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
- `imagem_url` (imagem principal, preservada para cards, carrinho e checkout)
- `destaque`
- `ativo`
- `estoque`

As fotos adicionais ficam em `music_produto_imagens.image_url`, relacionadas por `produto_id`, e são gerenciadas na seção “Galeria de imagens do produto” do cadastro/edição.

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

### Storage para imagens de produtos e logos (`product-images`)

Para o upload funcionar no painel (`/admin/produtos/novo`, `/admin/produtos/editar/:id` e `/admin/configuracoes`), crie um bucket no Supabase Storage:

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

> Observação: se o bucket não existir, o cadastro/edição de produto e a configuração de logo continuam disponíveis em modo mock/local, porém sem persistência remota de arquivos. As fotos principais de produto são gravadas em `products/`, as fotos adicionais da galeria em `products/gallery/` e as logos em `logos/` no mesmo bucket.

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
  cliente_documento text,
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

create policy "admin_select_music_pedidos" on public.music_pedidos
for select to authenticated using (true);

create policy "admin_update_music_pedidos" on public.music_pedidos
for update to authenticated using (true) with check (true);

create policy "admin_select_music_pedido_itens" on public.music_pedido_itens
for select to authenticated using (true);

alter table public.music_pedidos add column if not exists cliente_documento text;

-- Função RPC segura para checkout público/anônimo
create or replace function public.create_music_order(payload jsonb)
returns table (
  id uuid,
  created_at timestamptz,
  total numeric,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer jsonb := coalesce(payload->'customer', '{}'::jsonb);
  v_items jsonb := coalesce(payload->'items', '[]'::jsonb);
  v_subtotal numeric := coalesce((payload->>'subtotal')::numeric, 0);
  v_total numeric := coalesce((payload->>'total')::numeric, 0);
  v_order_id uuid;
  v_created_at timestamptz;
  v_status text := 'novo';
  item jsonb;
  v_product_id uuid;
  v_qty integer;
  v_price numeric;
  v_stock integer;
begin
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 then
    raise exception 'Pedido inválido: itens obrigatórios.';
  end if;

  -- trava e valida estoque de todos os itens
  for item in select * from jsonb_array_elements(v_items)
  loop
    v_product_id := nullif(coalesce(item->>'id', item->>'produto_id'), '')::uuid;
    v_qty := greatest(coalesce((item->>'quantidade')::integer, 0), 0);

    if v_product_id is null or v_qty <= 0 then
      raise exception 'Item inválido no pedido.';
    end if;

    select p.estoque
      into v_stock
      from public.music_produtos p
     where p.id = v_product_id
     for update;

    if not found then
      raise exception 'Produto não encontrado: %', coalesce(item->>'nome', v_product_id::text);
    end if;

    if v_stock is null or v_stock < v_qty then
      raise exception 'Estoque insuficiente para %.', coalesce(item->>'nome', v_product_id::text);
    end if;
  end loop;

  insert into public.music_pedidos (
    cliente_nome,
    cliente_whatsapp,
    cliente_email,
    cliente_documento,
    endereco_entrega,
    observacoes,
    status,
    subtotal,
    total,
    forma_entrega,
    forma_pagamento
  ) values (
    nullif(v_customer->>'nome', ''),
    nullif(v_customer->>'whatsapp', ''),
    nullif(v_customer->>'email', ''),
    nullif(v_customer->>'documento', ''),
    nullif(v_customer->>'endereco', ''),
    nullif(v_customer->>'observacoes', ''),
    v_status,
    v_subtotal,
    v_total,
    nullif(v_customer->>'formaEntrega', ''),
    nullif(v_customer->>'formaPagamento', '')
  )
  returning music_pedidos.id, music_pedidos.created_at
  into v_order_id, v_created_at;

  for item in select * from jsonb_array_elements(v_items)
  loop
    v_product_id := nullif(coalesce(item->>'id', item->>'produto_id'), '')::uuid;
    v_qty := (item->>'quantidade')::integer;
    v_price := coalesce((item->>'preco')::numeric, 0);

    insert into public.music_pedido_itens (
      pedido_id,
      produto_id,
      produto_nome,
      categoria,
      quantidade,
      preco_unitario,
      subtotal
    ) values (
      v_order_id,
      v_product_id,
      item->>'nome',
      item->>'categoria',
      v_qty,
      v_price,
      v_price * v_qty
    );

    update public.music_produtos
       set estoque = greatest(coalesce(public.music_produtos.estoque, 0) - v_qty, 0)
     where public.music_produtos.id = v_product_id;
  end loop;

  return query
  select v_order_id, v_created_at, v_total, v_status;
end;
$$;

grant execute on function public.create_music_order(jsonb) to anon, authenticated;

-- Recomendado: não dar update público direto em estoque e não abrir select público de pedidos
revoke all on public.music_pedidos from anon;
revoke all on public.music_pedido_itens from anon;
revoke update on public.music_produtos from anon;
```

## Auditoria básica (music_audit_logs)

### SQL para criar tabela

```sql
create table if not exists public.music_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tipo text,
  acao text,
  tabela text,
  registro_id text,
  descricao text,
  antes jsonb,
  depois jsonb,
  usuario_email text,
  origem text default 'admin',
  created_at timestamp with time zone default now()
);
```

### RLS recomendado

```sql
alter table public.music_audit_logs enable row level security;

create policy "authenticated_insert_music_audit_logs"
on public.music_audit_logs
for insert
to authenticated
with check (true);

create policy "authenticated_select_music_audit_logs"
on public.music_audit_logs
for select
to authenticated
using (true);
```

> Importante: não crie policy para `anon` em `select` ou `insert`.

### Versão opcional da RPC `create_music_order` com auditoria

> Esta etapa é **somente documentação**. Não altere automaticamente a função atual se ela já está em produção.

```sql
-- Dentro da função create_music_order (SECURITY DEFINER), após inserir pedido e itens:

insert into public.music_audit_logs (
  tipo,
  acao,
  tabela,
  registro_id,
  descricao,
  antes,
  depois,
  usuario_email,
  origem
)
values (
  'pedido',
  'pedido_criado',
  'music_pedidos',
  v_order_id::text,
  'Pedido criado via checkout.',
  null,
  jsonb_build_object('pedido_id', v_order_id, 'total', v_total),
  null,
  'checkout_rpc'
);

-- Em cada baixa de estoque dentro do loop de itens:
insert into public.music_audit_logs (
  tipo,
  acao,
  tabela,
  registro_id,
  descricao,
  antes,
  depois,
  usuario_email,
  origem
)
values (
  'estoque',
  'baixa_estoque_automatica',
  'music_produtos',
  (item->>'produto_id'),
  'Baixa de estoque automática após pedido.',
  jsonb_build_object('estoque', v_stock_before),
  jsonb_build_object(
    'estoque', v_stock_after,
    'pedido_id', v_order_id,
    'produto_nome', item->>'nome',
    'quantidade', (item->>'quantidade')::int
  ),
  null,
  'checkout_rpc'
);
```


## SQL sugerido: RPC pública segura para acompanhamento de pedido

```sql
create or replace function public.get_public_order_status(order_code text, customer_whatsapp text)
returns table (
  id uuid,
  short_id text,
  created_at timestamptz,
  status text,
  cliente_nome text,
  forma_pagamento text,
  forma_entrega text,
  total numeric,
  observacoes text,
  items jsonb
)
language sql
security definer
set search_path = public
as $$
  with pedido as (
    select p.*
    from public.music_pedidos p
    where (
      p.id::text = btrim(replace(coalesce(order_code, ''), '#', ''))
      or left(p.id::text, 8) = left(btrim(replace(coalesce(order_code, ''), '#', '')), 8)
    )
    and regexp_replace(coalesce(p.cliente_whatsapp, ''), '\D', '', 'g') = regexp_replace(coalesce(customer_whatsapp, ''), '\D', '', 'g')
    limit 1
  )
  select
    p.id,
    left(p.id::text, 8) as short_id,
    p.created_at,
    p.status,
    p.cliente_nome,
    p.forma_pagamento,
    p.forma_entrega,
    p.total,
    p.observacoes,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'produto_id', i.produto_id,
        'produto_nome', i.produto_nome,
        'quantidade', i.quantidade,
        'preco_unitario', i.preco_unitario,
        'subtotal', i.subtotal
      ) order by i.created_at asc)
      from public.music_pedido_itens i
      where i.pedido_id = p.id
    ), '[]'::jsonb) as items
  from pedido p;
$$;

grant execute on function public.get_public_order_status(text, text) to anon, authenticated;
```

## PIX automático com Asaas (base inicial com fallback obrigatório)

### Variáveis de ambiente (backend/serverless)

```env
ASAAS_API_KEY=seu_token_asaas
ASAAS_API_URL=https://api-sandbox.asaas.com/v3
ASAAS_WEBHOOK_TOKEN=token_opcional_de_validacao_webhook
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

- `ASAAS_API_KEY` **não pode** usar prefixo `VITE_`.
- `SUPABASE_SERVICE_ROLE_KEY` **não pode** usar prefixo `VITE_`.
- Segredos devem existir apenas em backend/serverless.
- Prefixo `VITE_` expõe variáveis no navegador e não deve ser usado para token Asaas.
- Sandbox: `ASAAS_API_URL` para endpoint sandbox da Asaas.
- Produção: `ASAAS_API_URL` para endpoint de produção da Asaas.

### SQL sugerido para pagamentos

```sql
create table if not exists public.music_pagamentos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references public.music_pedidos(id) on delete cascade,
  gateway text default 'asaas',
  gateway_payment_id text,
  metodo text default 'pix',
  status text default 'pendente',
  valor numeric(10,2),
  qr_code_pix text,
  copia_cola_pix text,
  expires_at timestamp with time zone,
  paid_at timestamp with time zone,
  raw_response jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.music_payment_events (
  id uuid primary key default gen_random_uuid(),
  pagamento_id uuid,
  pedido_id uuid,
  gateway text default 'asaas',
  event_type text,
  payload jsonb,
  created_at timestamp with time zone default now()
);

alter table public.music_pagamentos enable row level security;
alter table public.music_payment_events enable row level security;

create policy "authenticated_select_music_pagamentos" on public.music_pagamentos
for select to authenticated using (true);

create policy "authenticated_select_music_payment_events" on public.music_payment_events
for select to authenticated using (true);
```

> Importante: insert/update de `music_pagamentos` e insert de `music_payment_events` devem ser feitos somente por backend com `service_role`.

### Rotas serverless adicionadas

- `POST /api/asaas/create-pix`: tenta criar PIX automático e, em qualquer falha/configuração ausente, retorna fallback controlado para PIX manual.
- `POST /api/webhooks/asaas`: recebe eventos Asaas, valida token quando configurado, registra evento e atualiza pagamento/pedido.

### TODOs de integração Asaas

- Confirmar e ajustar campos exatos do endpoint de QR Code PIX (`/payments/{id}/pixQrCode`) conforme documentação vigente da Asaas.
- Confirmar estratégia de idempotência para reprocessamento de webhooks em produção.

## SQL obrigatório: devolução automática de estoque em cancelamentos

### 1) Novas colunas em `music_pedidos`

```sql
alter table public.music_pedidos add column if not exists estoque_devolvido boolean default false;
alter table public.music_pedidos add column if not exists estoque_devolvido_at timestamp with time zone;
```

### 2) RPC segura para devolver estoque (`public.return_order_stock`)

```sql
create or replace function public.return_order_stock(order_id uuid)
returns table (
  pedido_id uuid,
  estoque_devolvido boolean,
  estoque_devolvido_at timestamp with time zone
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.music_pedidos%rowtype;
  v_item public.music_pedido_itens%rowtype;
begin
  select * into v_order
  from public.music_pedidos
  where id = order_id;

  if not found then
    raise exception 'Pedido % não encontrado.', order_id;
  end if;

  if coalesce(v_order.estoque_devolvido, false) then
    return query
    select v_order.id, true, v_order.estoque_devolvido_at;
    return;
  end if;

  for v_item in
    select *
    from public.music_pedido_itens
    where pedido_id = v_order.id
  loop
    update public.music_produtos
    set estoque = coalesce(estoque, 0) + coalesce(v_item.quantidade, 0)
    where id = v_item.produto_id;
  end loop;

  update public.music_pedidos
  set
    estoque_devolvido = true,
    estoque_devolvido_at = now()
  where id = v_order.id;

  return query
  select p.id, p.estoque_devolvido, p.estoque_devolvido_at
  from public.music_pedidos p
  where p.id = v_order.id;
end;
$$;

revoke all on function public.return_order_stock(uuid) from public;
grant execute on function public.return_order_stock(uuid) to authenticated;
```

> Recomendação: usar o webhook com `service_role` (backend) e manter RLS ativa, sem abrir update público de produtos.


alter table public.music_pagamentos add column if not exists payment_url text;
