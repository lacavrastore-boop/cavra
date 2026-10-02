-- ════════════════════════════════════════════════════════════════
-- Cavra — guardar un producto completo desde /admin (corre DESPUÉS de 002)
-- Una sola transacción: producto + colores + variantes. Corre con los permisos
-- de quien llama (security invoker), así que RLS sigue mandando; además exige is_admin().
-- ════════════════════════════════════════════════════════════════
create or replace function public.admin_save_product(p jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  pid uuid := nullif(p->>'id', '')::uuid;
  c jsonb;
  v jsonb;
  i int;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if pid is null then
    insert into public.products (slug, name, tagline, description, price_cop, status, sort_order, category, drop_number, details, life_path)
    values (
      p->>'slug', p->>'name', coalesce(p->>'tagline', ''), nullif(p->>'description', ''),
      (p->>'price_cop')::int, p->>'status', coalesce((p->>'sort_order')::int, 0), p->>'category',
      coalesce((p->>'drop_number')::int, 1),
      array(select jsonb_array_elements_text(coalesce(p->'details', '[]'::jsonb))),
      nullif(p->>'life_path', '')
    )
    returning id into pid;
  else
    update public.products set
      slug = p->>'slug',
      name = p->>'name',
      tagline = coalesce(p->>'tagline', ''),
      description = nullif(p->>'description', ''),
      price_cop = (p->>'price_cop')::int,
      status = p->>'status',
      sort_order = coalesce((p->>'sort_order')::int, 0),
      category = p->>'category',
      drop_number = coalesce((p->>'drop_number')::int, 1),
      details = array(select jsonb_array_elements_text(coalesce(p->'details', '[]'::jsonb))),
      life_path = nullif(p->>'life_path', '')
    where id = pid;
    if not found then
      raise exception 'El producto no existe' using errcode = 'P0002';
    end if;
  end if;

  -- Colores: se quitan los que ya no están y se crean o actualizan los demás
  delete from public.product_colors
   where product_id = pid
     and key <> all (array(select e->>'key' from jsonb_array_elements(coalesce(p->'colors', '[]'::jsonb)) e));

  i := 0;
  for c in select * from jsonb_array_elements(coalesce(p->'colors', '[]'::jsonb)) loop
    insert into public.product_colors (product_id, key, name, hex, stage, stage_dark, front_path, back_path, position)
    values (pid, c->>'key', c->>'name', c->>'hex', c->>'stage', coalesce((c->>'stage_dark')::boolean, false),
            c->>'front_path', nullif(c->>'back_path', ''), i)
    on conflict (product_id, key) do update set
      name = excluded.name, hex = excluded.hex, stage = excluded.stage, stage_dark = excluded.stage_dark,
      front_path = excluded.front_path, back_path = excluded.back_path, position = excluded.position;
    i := i + 1;
  end loop;

  -- Variantes (talla + color): igual
  delete from public.product_variants pv
   where pv.product_id = pid
     and not exists (
       select 1 from jsonb_array_elements(coalesce(p->'variants', '[]'::jsonb)) e
        where e->>'size' = pv.size and e->>'color' = pv.color
     );

  for v in select * from jsonb_array_elements(coalesce(p->'variants', '[]'::jsonb)) loop
    insert into public.product_variants (product_id, size, color, stock, position)
    values (pid, v->>'size', v->>'color', (v->>'stock')::int, coalesce((v->>'position')::int, 0))
    on conflict (product_id, size, color) do update set stock = excluded.stock, position = excluded.position;
  end loop;

  return pid;
end
$$;

revoke all on function public.admin_save_product(jsonb) from public, anon;
grant execute on function public.admin_save_product(jsonb) to authenticated;
