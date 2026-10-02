/**
 * Cliente de Supabase en el SERVIDOR con la sesión del administrador (cookies).
 * Usa la llave pública: lo que puede hacer lo decide RLS (is_admin()), no la llave.
 * Nunca se usa la llave service_role en el panel.
 */
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function supabaseServer(request: Request, cookies: AstroCookies) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Faltan PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY (ver .env.example).');

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '').map((c) => ({ name: c.name, value: c.value ?? '' }));
      },
      setAll(list) {
        for (const { name, value, options } of list) {
          cookies.set(name, value, { ...options, httpOnly: true, secure: import.meta.env.PROD, sameSite: 'lax' });
        }
      },
    },
  });
}
