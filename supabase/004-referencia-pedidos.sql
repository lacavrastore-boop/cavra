-- Referencia consecutiva de pedidos: CVR-0001, CVR-0002, ...
-- Se asigna sola al crear el pedido (default de orders.reference).
create sequence if not exists public.order_number_seq start 1;

create or replace function public.next_order_reference()
returns text
language sql
volatile
set search_path = public
as $$
  select 'CVR-' || lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;

alter table public.orders alter column reference set default public.next_order_reference();
