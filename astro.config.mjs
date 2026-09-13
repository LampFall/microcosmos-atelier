// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: 'nl',
    locales: ['nl', 'en'],
    routing: {
      // nl blijft op "/", geen "/nl/" prefix
      prefixDefaultLocale: false,
    },
  },
});