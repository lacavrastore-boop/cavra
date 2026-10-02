import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabasePublic } from '../../lib/supabase';

export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// El navegador solo dice QUÉ quiere comprar. Nada de precios ni totales: los calcula la base de datos.
const Body = z.object({
  customer: z.object({
    name: z.string().trim().min(2, 'Escribe tu nombre completo').max(80),
    email: z.string().trim().max(120).pipe(z.email('El correo no es válido')),
    phone: z.string().transform((s) => s.replace(/[\s-]/g, '')).pipe(z.string().regex(/^3\d{9}$/, 'El celular debe tener 10 dígitos y empezar por 3')),
    address: z.string().trim().min(5, 'Escribe la dirección de envío').max(160),
    city: z.string().trim().min(2, 'Escribe la ciudad').max(60),
    department: z.string().trim().min(2, 'Elige el departamento').max(40),
    notes: z.string().trim().max(300).default(''),
  }),
  items: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(60),
        color: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(40),
        size: z.string().min(1).max(10),
        qty: z.number().int().min(1).max(10),
      }),
    )
    .min(1, 'Tu carrito está vacío')
    .max(20),
  acceptTerms: z.literal(true, { error: 'Debes aceptar las políticas para continuar' }),
});

export const POST: APIRoute = async ({ request, url }) => {
  if (request.headers.get('origin') !== url.origin) return json(403, { error: 'Origen no permitido' });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json(400, { error: 'Solicitud inválida' });
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return json(400, { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' });
  const { customer, items } = parsed.data;

  const { data, error } = await supabasePublic().rpc('create_order', { p: { customer, items } });
  if (error) {
    // La función avisa con "CODIGO|mensaje"; cualquier otro error no se muestra tal cual.
    const [code, msg] = error.message.split('|');
    if (msg && ['DATOS_INVALIDOS', 'CARRITO_INVALIDO', 'NO_DISPONIBLE', 'SIN_STOCK'].includes(code)) {
      return json(code === 'DATOS_INVALIDOS' || code === 'CARRITO_INVALIDO' ? 400 : 409, { error: msg });
    }
    console.error('create_order falló', error.message);
    return json(500, { error: 'No pudimos crear tu pedido. Intenta de nuevo.' });
  }

  const o = Array.isArray(data) ? data[0] : data;
  if (!o) return json(500, { error: 'No pudimos crear tu pedido. Intenta de nuevo.' });
  return json(200, { reference: o.o_reference, total: o.o_total });
};
