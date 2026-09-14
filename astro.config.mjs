// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://microcosmos-atelier.com',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'nl',
    locales: ['nl', 'en'],
    routing: {
      // nl blijft op "/", geen "/nl/" prefix
      prefixDefaultLocale: false,
    },
  },
});