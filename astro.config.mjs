// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// El adaptador (Vercel/Netlify/Cloudflare/Node) se agrega antes del primer despliegue.
export default defineConfig({
  integrations: [react()],
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});