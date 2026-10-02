-- ════════════════════════════════════════════════════════════════
-- Cavra — ampliación del catálogo (corre DESPUÉS de 03-esquema-supabase.sql)
-- Dónde: Supabase → SQL Editor → pegar → Run
-- Agrega lo que la tienda necesita: eslogan, categoría, drop, detalles, foto de calle
-- y los colores de cada producto (con su foto de frente y espalda).
-- ════════════════════════════════════════════════════════════════

alter table public.products
  add column if not exists tagline     text not null default '',
  add column if not exists category    text not null default 'camisetas'
    check (category in ('camisetas', 'buzos', 'pantalones', 'accesorios')),
  add column if not exists drop_number integer not null default 1 check (drop_number >= 1),
  add column if not exists details     text[] not null default '{}',
  add column if not exists life_path   text;   -- foto en contexto (calle)

-- Orden de las tallas dentro de un producto (S, M, L, XL...)
alter table public.product_variants
  add column if not exists position integer not null default 0;

-- Colores de un producto. product_variants.color guarda la "key" de esta tabla.
create table if not exists public.product_colors (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  key        text not null,                 -- 'negro', 'crema'...
  name       text not null,                 -- 'Negro'
  hex        text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  stage      text not null check (stage ~ '^#[0-9A-Fa-f]{6}$'),  -- fondo del escenario en la página de producto
  stage_dark boolean not null default false, -- true si el texto sobre el fondo debe ser claro
  front_path text not null,                 -- foto de frente
  back_path  text,                          -- foto de espalda (opcional)
  position   integer not null default 0,
  unique (product_id, key)
);
create index if not exists product_colors_product_idx on public.product_colors (product_id, position);

alter table public.product_colors enable row level security;

create policy "product_colors_public_read" on public.product_colors
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));

create policy "product_colors_admin_all" on public.product_colors
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
