-- Crea un pedido desde el checkout. TODO se valida y se calcula aquí, desde la base de datos:
-- precios, stock, subtotal, envío y total. Lo que mande el navegador solo dice QUÉ quiere comprar.
-- La llave anon es pública, así que esta función no confía en nada de lo que recibe.
-- Envío fijo nacional: cambiar la constante v_envio (y src/lib/shipping.ts, que solo lo muestra).
create or replace function public.create_order(p jsonb)
returns table (o_id uuid, o_reference text, o_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  c        jsonb := p -> 'customer';
  it       record;
  v        record;
  v_envio  constant integer := 12000;
  v_sub    integer := 0;
  v_id     uuid;
  v_ref    text;
begin
  if c is null or jsonb_typeof(c) <> 'object' then
    raise exception 'DATOS_INVALIDOS|Faltan los datos del cliente';
  end if;
  if length(btrim(coalesce(c ->> 'name', ''))) not between 2 and 80 then
    raise exception 'DATOS_INVALIDOS|Escribe tu nombre completo';
  end if;
  if coalesce(c ->> 'email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(c ->> 'email') > 120 then
    raise exception 'DATOS_INVALIDOS|El correo no es válido';
  end if;
  if coalesce(c ->> 'phone', '') !~ '^3[0-9]{9}$' then
    raise exception 'DATOS_INVALIDOS|El celular debe tener 10 dígitos y empezar por 3';
  end if;
  if length(btrim(coalesce(c ->> 'address', ''))) not between 5 and 160 then
    raise exception 'DATOS_INVALIDOS|Escribe la dirección de envío';
  end if;
  if length(btrim(coalesce(c ->> 'city', ''))) not between 2 and 60 then
    raise exception 'DATOS_INVALIDOS|Escribe la ciudad';
  end if;
  if length(btrim(coalesce(c ->> 'department', ''))) not between 2 and 40 then
    raise exception 'DATOS_INVALIDOS|Elige el departamento';
  end if;
  if length(coalesce(c ->> 'notes', '')) > 300 then
    raise exception 'DATOS_INVALIDOS|Las indicaciones son muy largas';
  end if;
  if jsonb_typeof(p -> 'items') <> 'array' or jsonb_array_length(p -> 'items') not between 1 and 20 then
    raise exception 'CARRITO_INVALIDO|Tu carrito está vacío';
  end if;

  insert into orders (customer_name, customer_email, customer_phone, shipping_address, shipping_city,
                      shipping_department, shipping_notes, subtotal_cop, shipping_cop, total_cop)
  values (btrim(c ->> 'name'), lower(btrim(c ->> 'email')), c ->> 'phone', btrim(c ->> 'address'),
          btrim(c ->> 'city'), btrim(c ->> 'department'), nullif(btrim(coalesce(c ->> 'notes', '')), ''),
          0, v_envio, v_envio)
  returning id, reference into v_id, v_ref;

  -- Une líneas repetidas (misma prenda, color y talla) antes de revisar stock
  for it in
    select x.slug, x.color, x.size, sum(x.qty)::integer as qty
      from jsonb_to_recordset(p -> 'items') as x(slug text, color text, size text, qty integer)
     group by x.slug, x.color, x.size
  loop
    if it.qty is null or it.qty < 1 or it.qty > 10 then
      raise exception 'CARRITO_INVALIDO|Cantidad no válida';
    end if;

    select pv.id as variant_id, pr.name, pr.price_cop, pv.stock,
           coalesce(pc.name, pv.color) as color_name
      into v
      from products pr
      join product_variants pv on pv.product_id = pr.id
      left join product_colors pc on pc.product_id = pr.id and pc.key = pv.color
     where pr.slug = it.slug and pr.status = 'active' and pv.color = it.color and pv.size = it.size;

    if not found then
      raise exception 'NO_DISPONIBLE|Una prenda de tu carrito ya no está disponible';
    end if;
    if v.stock < it.qty then
      raise exception 'SIN_STOCK|No hay suficiente stock de % (% · %)', v.name, v.color_name, it.size;
    end if;

    insert into order_items (order_id, variant_id, product_name, size, color, unit_price_cop, quantity)
    values (v_id, v.variant_id, v.name, it.size, v.color_name, v.price_cop, it.qty);

    v_sub := v_sub + v.price_cop * it.qty;
  end loop;

  update orders set subtotal_cop = v_sub, total_cop = v_sub + v_envio where id = v_id;

  return query select v_id, v_ref, v_sub + v_envio;
end
$$;

revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated, service_role;
