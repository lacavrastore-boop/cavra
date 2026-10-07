-- Datos de MENTIRA del drop 01 (nombres, precios y stock no son reales). Se reemplazan desde /admin.
begin;

insert into public.products (slug, name, tagline, description, price_cop, status, sort_order, category, drop_number, details, life_path)
values ('buzo-la-cabra', 'Buzo La Cabra', 'La cabra en la espalda.', 'Buzo pesado de capucha, corte amplio y hombro caído. Pezuña bordada en el pecho y la cabra estampada grande en la espalda.', 189900, 'active', 1, 'buzos', 1, array['Algodón perchado de alto gramaje', 'Capucha doble con cordón', 'Bolsillo canguro', 'Estampado en espalda'], '/img/life/hoodie.webp')
on conflict (slug) do nothing;
insert into public.product_colors (product_id, key, name, hex, stage, stage_dark, front_path, back_path, position)
select p.id, v.* from public.products p, (values
  ('negro', 'Negro', '#1A1A1A', '#EFE6D0', false, '/img/p/hoodie_front_negro.webp', '/img/p/hoodie_back_negro.webp', 0),
  ('cafe', 'Café', '#573724', '#D7C9A8', false, '/img/p/hoodie_front_cafe.webp', '/img/p/hoodie_back_cafe.webp', 1),
  ('crema', 'Crema', '#EFE6D0', '#573724', true, '/img/p/hoodie_front_crema.webp', '/img/p/hoodie_back_crema.webp', 2),
  ('bosque', 'Verde bosque', '#2E5D46', '#8E8B80', false, '/img/p/hoodie_front_bosque.webp', '/img/p/hoodie_back_bosque.webp', 3)
) as v(key, name, hex, stage, stage_dark, front_path, back_path, position) where p.slug = 'buzo-la-cabra'
on conflict (product_id, key) do nothing;
insert into public.product_variants (product_id, size, color, stock, position)
select p.id, v.* from public.products p, (values
  ('S', 'negro', 1, 0),
  ('M', 'negro', 6, 1),
  ('L', 'negro', 2, 2),
  ('XL', 'negro', 0, 3),
  ('S', 'cafe', 4, 0),
  ('M', 'cafe', 9, 1),
  ('L', 'cafe', 5, 2),
  ('XL', 'cafe', 1, 3),
  ('S', 'crema', 7, 0),
  ('M', 'crema', 3, 1),
  ('L', 'crema', 8, 2),
  ('XL', 'crema', 4, 3),
  ('S', 'bosque', 0, 0),
  ('M', 'bosque', 6, 1),
  ('L', 'bosque', 2, 2),
  ('XL', 'bosque', 7, 3)
) as v(size, color, stock, position) where p.slug = 'buzo-la-cabra'
on conflict (product_id, size, color) do nothing;

insert into public.products (slug, name, tagline, description, price_cop, status, sort_order, category, drop_number, details, life_path)
values ('camiseta-cabra', 'Camiseta Cabra', 'Logo al frente, cabra atrás.', 'Camiseta de algodón pesado, corte cuadrado y cuello grueso. CAVRA al frente y la cabra con el logo en la espalda.', 89900, 'active', 2, 'camisetas', 1, array['Algodón peinado de alto gramaje', 'Corte cuadrado (boxy)', 'Cuello acanalado grueso', 'Estampado frente y espalda'], '/img/life/tee.webp')
on conflict (slug) do nothing;
insert into public.product_colors (product_id, key, name, hex, stage, stage_dark, front_path, back_path, position)
select p.id, v.* from public.products p, (values
  ('negro', 'Negro', '#1A1A1A', '#EFE6D0', false, '/img/p/tee_front_negro.webp', '/img/p/tee_back_negro.webp', 0),
  ('crema', 'Crema', '#EFE6D0', '#573724', true, '/img/p/tee_front_crema.webp', '/img/p/tee_back_crema.webp', 1),
  ('oliva', 'Oliva', '#55684F', '#B7AFB3', false, '/img/p/tee_front_oliva.webp', '/img/p/tee_back_oliva.webp', 2)
) as v(key, name, hex, stage, stage_dark, front_path, back_path, position) where p.slug = 'camiseta-cabra'
on conflict (product_id, key) do nothing;
insert into public.product_variants (product_id, size, color, stock, position)
select p.id, v.* from public.products p, (values
  ('S', 'negro', 1, 0),
  ('M', 'negro', 6, 1),
  ('L', 'negro', 2, 2),
  ('XL', 'negro', 7, 3),
  ('S', 'crema', 0, 0),
  ('M', 'crema', 9, 1),
  ('L', 'crema', 5, 2),
  ('XL', 'crema', 1, 3),
  ('S', 'oliva', 7, 0),
  ('M', 'oliva', 3, 1),
  ('L', 'oliva', 8, 2),
  ('XL', 'oliva', 4, 3)
) as v(size, color, stock, position) where p.slug = 'camiseta-cabra'
on conflict (product_id, size, color) do nothing;

insert into public.products (slug, name, tagline, description, price_cop, status, sort_order, category, drop_number, details, life_path)
values ('cargo-calle', 'Cargo Calle', 'Bolsillos para todo.', 'Pantalón cargo de bota ancha y caída pesada. Bolsillos laterales con tapa y pezuña bordada en la cadera.', 159900, 'active', 3, 'pantalones', 1, array['Dril de algodón', 'Bota ancha', 'Seis bolsillos', 'Pezuña bordada'], '/img/life/pants.webp')
on conflict (slug) do nothing;
insert into public.product_colors (product_id, key, name, hex, stage, stage_dark, front_path, back_path, position)
select p.id, v.* from public.products p, (values
  ('negro', 'Negro', '#1A1A1A', '#EFE6D0', false, '/img/p/pants_front_negro.webp', null::text, 0),
  ('oliva', 'Oliva', '#55684F', '#B7AFB3', false, '/img/p/pants_front_oliva.webp', null::text, 1),
  ('arena', 'Arena', '#D7C9A8', '#2A2A2A', true, '/img/p/pants_front_arena.webp', null::text, 2)
) as v(key, name, hex, stage, stage_dark, front_path, back_path, position) where p.slug = 'cargo-calle'
on conflict (product_id, key) do nothing;
insert into public.product_variants (product_id, size, color, stock, position)
select p.id, v.* from public.products p, (values
  ('28', 'negro', 1, 0),
  ('30', 'negro', 6, 1),
  ('32', 'negro', 2, 2),
  ('34', 'negro', 7, 3),
  ('28', 'oliva', 4, 0),
  ('30', 'oliva', 9, 1),
  ('32', 'oliva', 5, 2),
  ('34', 'oliva', 1, 3),
  ('28', 'arena', 7, 0),
  ('30', 'arena', 3, 1),
  ('32', 'arena', 8, 2),
  ('34', 'arena', 0, 3)
) as v(size, color, stock, position) where p.slug = 'cargo-calle'
on conflict (product_id, size, color) do nothing;

insert into public.products (slug, name, tagline, description, price_cop, status, sort_order, category, drop_number, details, life_path)
values ('gorra-pezuna', 'Gorra Pezuña', 'La pezuña al frente.', 'Gorra de seis paneles, visera curva y correa ajustable. Pezuña bordada al frente.', 69900, 'active', 4, 'accesorios', 1, array['Seis paneles', 'Visera curva', 'Correa ajustable', 'Bordado frontal'], '/img/life/cap.webp')
on conflict (slug) do nothing;
insert into public.product_colors (product_id, key, name, hex, stage, stage_dark, front_path, back_path, position)
select p.id, v.* from public.products p, (values
  ('cafe', 'Café', '#573724', '#D7C9A8', false, '/img/p/cap_cafe.webp', null::text, 0),
  ('negro', 'Negro', '#1A1A1A', '#EFE6D0', false, '/img/p/cap_negro.webp', null::text, 1),
  ('crema', 'Crema', '#EFE6D0', '#573724', true, '/img/p/cap_crema.webp', null::text, 2)
) as v(key, name, hex, stage, stage_dark, front_path, back_path, position) where p.slug = 'gorra-pezuna'
on conflict (product_id, key) do nothing;
insert into public.product_variants (product_id, size, color, stock, position)
select p.id, v.* from public.products p, (values
  ('Única', 'cafe', 8, 0),
  ('Única', 'negro', 5, 0),
  ('Única', 'crema', 0, 0)
) as v(size, color, stock, position) where p.slug = 'gorra-pezuna'
on conflict (product_id, size, color) do nothing;

insert into public.products (slug, name, tagline, description, price_cop, status, sort_order, category, drop_number, details, life_path)
values ('camiseta-pezuna', 'Camiseta Pezuña', 'La pezuña al pecho, la cabra atrás.', 'Camiseta de algodón pesado, corte cuadrado y cuello grueso. Pezuña en relieve mate al pecho y la cabra con el logo en la espalda.', 89900, 'active', 5, 'camisetas', 1, array['Algodón peinado de alto gramaje', 'Corte cuadrado (boxy)', 'Cuello acanalado grueso', 'Pezuña en el pecho y estampado en espalda'], '/img/life/tee.webp')
on conflict (slug) do nothing;
insert into public.product_colors (product_id, key, name, hex, stage, stage_dark, front_path, back_path, position)
select p.id, v.* from public.products p, (values
  ('negro', 'Negro', '#1A1A1A', '#EFE6D0', false, '/img/p/tee_front_negro_pezuna.webp', '/img/p/tee_back_negro_pezuna.webp', 0)
) as v(key, name, hex, stage, stage_dark, front_path, back_path, position) where p.slug = 'camiseta-pezuna'
on conflict (product_id, key) do nothing;
insert into public.product_variants (product_id, size, color, stock, position)
select p.id, v.* from public.products p, (values
  ('S', 'negro', 1, 0),
  ('M', 'negro', 6, 1),
  ('L', 'negro', 2, 2),
  ('XL', 'negro', 7, 3)
) as v(size, color, stock, position) where p.slug = 'camiseta-pezuna'
on conflict (product_id, size, color) do nothing;

commit;
