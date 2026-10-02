import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

// Borra un producto solo si nunca se ha vendido; si tiene pedidos, hay que archivarlo.
export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  const id = params.id ?? '';
  if (!z.uuid().safeParse(id).success) return new Response('No encontrado', { status: 404 });
  const volver = (m: string) => redirect(`/admin/productos/${id}?error=${encodeURIComponent(m)}`, 303);
  const db = locals.supabase!;

  const f = await request.formData();
  if (f.get('confirmar') !== 'on') return volver('Confirma que quieres eliminar el producto');

  const { data: p, error } = await db
    .from('products')
    .select('id, life_path, product_colors(front_path, back_path), product_variants(id)')
    .eq('id', id)
    .maybeSingle();
  if (error || !p) return volver('No se encontró el producto');

  const variantIds = p.product_variants.map((v: any) => v.id);
  if (variantIds.length) {
    const { count } = await db.from('order_items').select('id', { count: 'exact', head: true }).in('variant_id', variantIds);
    if (count) return volver('Este producto ya tiene pedidos: no se puede eliminar, archívalo.');
  }

  const { error: delErr } = await db.from('products').delete().eq('id', id);
  if (delErr) return volver('No se pudo eliminar el producto');

  // Limpia las fotos subidas desde el panel (carpeta p/); las del código (/img/...) no se tocan.
  const fotos = [p.life_path, ...p.product_colors.flatMap((c: any) => [c.front_path, c.back_path])].filter(
    (x): x is string => typeof x === 'string' && /^p\/[\w.-]+$/.test(x),
  );
  if (fotos.length) await db.storage.from('products').remove(fotos);

  return redirect('/admin/productos', 303);
};
