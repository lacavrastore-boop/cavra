import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const TIPOS: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/avif': 'avif' };

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Verifica la firma real del archivo (no solo lo que dice el navegador). */
function esImagenReal(b: Uint8Array, tipo: string) {
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (tipo === 'image/jpeg') return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (tipo === 'image/png') return b[0] === 0x89 && ascii(1, 4) === 'PNG';
  if (tipo === 'image/webp') return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
  if (tipo === 'image/avif') return ascii(4, 8) === 'ftyp' && ascii(8, 12).startsWith('avi');
  return false;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return json(400, { error: 'Falta la foto' });

  const ext = TIPOS[file.type];
  if (!ext) return json(400, { error: 'Solo WebP, JPG, PNG o AVIF' });
  if (file.size > MAX_BYTES) return json(400, { error: 'La foto pesa más de 3 MB. Optimízala (WebP, máx. ~1600 px).' });

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!esImagenReal(bytes, file.type)) return json(400, { error: 'El archivo no es una imagen válida' });

  const path = `p/${crypto.randomUUID()}.${ext}`;
  const { error } = await locals.supabase!.storage.from('products').upload(path, bytes, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) return json(400, { error: 'No se pudo subir la foto.' });
  return json(200, { path });
};
