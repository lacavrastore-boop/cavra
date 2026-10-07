-- Segunda camiseta: Camiseta Pezuña (datos de mentira, se editan desde /admin). Idempotente.
begin;

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
