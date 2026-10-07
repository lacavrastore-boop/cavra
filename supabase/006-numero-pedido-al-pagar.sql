-- El número consecutivo (CVR-0001...) se asigna SOLO cuando el pedido se paga.
-- Antes de pagar, el pedido solo tiene una referencia técnica aleatoria (P-XXXXXXXX), que es la que se envía a Wompi.
alter table public.orders add column if not exists order_number text unique;

alter table public.orders alter column reference
  set default ('P-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));

create or replace function public.mark_order_paid(
  p_reference   text,
  p_wompi_id    text,
  p_amount_cop  integer
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  o       public.orders;
  it      record;
  flagged boolean := false;
begin
  select * into o from public.orders where reference = p_reference for update;
  if not found then
    return 'not_found';
  end if;

  if o.status <> 'pending' then
    return 'already_' || o.status;
  end if;

  if o.total_cop <> p_amount_cop then
    update public.orders
       set notes = coalesce(notes || E'\n', '')
                   || 'MONTO NO COINCIDE: pedido ' || o.total_cop || ', pagado ' || p_amount_cop
                   || ' (transacción ' || p_wompi_id || '). Revisar manualmente.',
           wompi_transaction_id = p_wompi_id,
           wompi_status = 'APPROVED'
     where id = o.id;
    return 'amount_mismatch';
  end if;

  for it in select * from public.order_items where order_id = o.id loop
    update public.product_variants
       set stock = stock - it.quantity
     where id = it.variant_id
       and stock >= it.quantity;
    if not found then
      flagged := true;
    end if;
  end loop;

  update public.orders
     set status = 'paid',
         paid_at = now(),
         order_number = coalesce(order_number, public.next_order_reference()),
         wompi_transaction_id = p_wompi_id,
         wompi_status = 'APPROVED',
         notes = case
                   when flagged then coalesce(notes || E'\n', '') || 'STOCK INSUFICIENTE al confirmar el pago. Revisar.'
                   else notes
                 end
   where id = o.id;

  return case when flagged then 'paid_stock_review' else 'paid' end;
end
$$;

revoke all on function public.mark_order_paid(text, text, integer) from public, anon, authenticated;
grant execute on function public.mark_order_paid(text, text, integer) to service_role;
