import type { APIRoute } from 'astro';
import { ProductoSchema } from '../../../../lib/admin-product';

export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Crea (sin id) o actualiza (con id) un producto completo: datos, colores y variantes en una transacción. */
export const POST: APIRoute = async ({ request, locals }) => {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return json(400, { error: 'Datos inválidos' });
  }
  const parsed = ProductoSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return json(400, { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' });
  }

  const { data, error } = await locals.supabase!.rpc('admin_save_product', { p: parsed.data });
  if (error) {
    if (error.code === '23505') return json(409, { error: 'Ya existe un producto con ese enlace (slug).' });
    if (error.code === '42501') return json(403, { error: 'Sin permiso' });
    return json(400, { error: 'No se pudo guardar el producto.' });
  }
  return json(200, { id: data });
};
