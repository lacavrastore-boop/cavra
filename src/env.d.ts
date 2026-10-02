/// <reference path="../.astro/types.d.ts" />

import type { SupabaseClient, User } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Locals {
      /** Solo existe en /admin y /api/admin (lo crea el middleware, con la sesión del administrador). */
      supabase?: SupabaseClient;
      user?: User;
    }
  }
}
