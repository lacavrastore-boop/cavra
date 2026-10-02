import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

const Enviar = z.object({
  carrier: z.string().trim().min(1).max(60),
  tracking: z.string().trim().min(1).max(60),
});
const Nota = z.object({ notes: z.string().trim().max(1000) });

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  const id = params.id ?? '';
  const volver = (q: string) => redirect(`/admin/pedidos/${id}?${q}`, 303);
  const falla = (m: string) => volver(`error=${encodeURIComponent(m)}`);
  if (!z.uuid().safeParse(id).success) return new Response('No encontrado', { status: 404 });

  const f = await request.formData();
  const accion = String(f.get('accion') ?? '');
  const db = locals.supabase!;
  const hora = new Date().toISOString();

  // Cada cambio exige el estado anterior correcto (.eq('status', ...)): evita saltarse pasos o pisar otro cambio.
  const cambiar = async (desde: string[], valores: Record<string, unknown>) => {
    const { data, error } = await db.from('orders').update(valores).eq('id', id).in('status', desde).select('id');
    if (error) return falla('No se pudo guardar el cambio');
    if (!data?.length) return falla('El pedido ya cambió de estado. Recarga la página.');
    return volver('ok=1');
  };

  if (accion === 'enviar') {
    const v = Enviar.safeParse({ carrier: f.get('carrier'), tracking: f.get('tracking') });
    if (!v.success) return falla('Falta la transportadora o la guía');
    return cambiar(['paid'], { status: 'shipped', carrier: v.data.carrier, tracking_code: v.data.tracking, shipped_at: hora });
  }
  if (accion === 'entregar') return cambiar(['shipped'], { status: 'delivered' });
  if (accion === 'cancelar') {
    if (f.get('confirmar') !== 'on') return falla('Confirma la cancelación');
    return cambiar(['pending', 'paid'], { status: 'cancelled' });
  }
  if (accion === 'nota') {
    const v = Nota.safeParse({ notes: f.get('notes') ?? '' });
    if (!v.success) return falla('La nota es muy larga');
    const { error } = await db.from('orders').update({ notes: v.data.notes || null }).eq('id', id);
    return error ? falla('No se pudo guardar la nota') : volver('ok=1');
  }
  return falla('Acción no válida');
};
