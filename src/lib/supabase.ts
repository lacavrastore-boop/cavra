/**
 * Cliente de Supabase para LEER el catálogo (llave pública + RLS).
 * Solo ve productos activos. Nunca usar aquí la llave service_role.
 * Las variables PUBLIC_ se leen del entorno de build (.env local / variables de build en Cloudflare).
 */
import { createClient } from '@supabase/supabase-js';

export function supabasePublic() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Faltan PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY (ver .env.example).');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
