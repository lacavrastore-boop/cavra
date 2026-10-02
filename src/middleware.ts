/**
 * Protege /admin/* y /api/admin/*.
 *  1. Usuario validado por el servidor de Supabase (getUser, no getSession).
 *  2. Debe ser administrador (función is_admin() de la base de datos).
 *  3. Escrituras a la API: solo desde el mismo origen.
 * Sin sesión: las páginas redirigen al login y la API responde 401. Sin ser admin: 403.
 */
import { defineMiddleware } from 'astro:middleware';
import { supabaseServer } from './lib/supabase-server';

const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const esApi = pathname.startsWith('/api/admin');
  const esPagina = pathname === '/admin' || pathname.startsWith('/admin/');
  if (!esApi && !esPagina) return next();

  const supabase = supabaseServer(context.request, context.cookies);
  context.locals.supabase = supabase;

  const esLogin = pathname === '/admin/login';
  if (!esLogin) {
    if (esApi && !['GET', 'HEAD'].includes(context.request.method)) {
      if (context.request.headers.get('Origin') !== context.url.origin) return json(403, 'Origen no permitido');
    }

    const { data } = await supabase.auth.getUser();
    if (!data.user) return esApi ? json(401, 'No autenticado') : context.redirect('/admin/login');

    const { data: esAdmin } = await supabase.rpc('is_admin');
    if (esAdmin !== true) {
      if (esApi) return json(403, 'Sin permiso');
      await supabase.auth.signOut();
      return context.redirect('/admin/login?error=permiso');
    }
    context.locals.user = data.user;
  }

  const res = await next();
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
});
