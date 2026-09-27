// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preparePhotos from './src/integrations/prepare-photos';

// https://astro.build/config
export default defineConfig({
  site: 'https://microcosmos-atelier.com',
  integrations: [
    // The contact thank-you pages are noindex, so they stay out of the sitemap.
    // The i18n option links each page's NL and EN version (same hreflang
    // values as the pages themselves, SPEC.md §3.12); pages without a
    // translation stay unpaired. The filter runs first, so the thank-you
    // pages can't show up as alternates.
    sitemap({
      filter: (page) => !page.includes('/contact/thanks'),
      i18n: { defaultLocale: 'nl', locales: { nl: 'nl', en: 'en' } },
    }),
    preparePhotos(),
  ],
  i18n: {
    defaultLocale: 'nl',
    locales: ['nl', 'en'],
    routing: {
      // nl blijft op "/", geen "/nl/" prefix
      prefixDefaultLocale: false,
    },
  },
  // Old flat journal entry URLs -> new /journal/<aquarium>/<entry> URLs,
  // after the journal restructuring (PLAN.md, "journal restructuring &
  // image performance"). Generated as static redirect pages at build time.
  redirects: {
    '/journal/2023-05-fallen-forest-hardscape': '/journal/fallen-forest/2023-05-hardscape/',
    '/journal/2023-09-fallen-forest-emers': '/journal/fallen-forest/2023-09-emers/',
    '/journal/2025-06-fallen-forest-gesloten': '/journal/fallen-forest/2025-06-gesloten/',
    '/journal/2026-08-borneo-opstart': '/journal/borneo-understory/2026-08-opstart/',
    '/en/journal/2023-05-fallen-forest-hardscape': '/en/journal/fallen-forest/2023-05-hardscape/',
    '/en/journal/2023-09-fallen-forest-emers': '/en/journal/fallen-forest/2023-09-emers/',
    '/en/journal/2025-06-fallen-forest-gesloten': '/en/journal/fallen-forest/2025-06-gesloten/',
    '/en/journal/2026-08-borneo-opstart': '/en/journal/borneo-understory/2026-08-opstart/',
  },
});