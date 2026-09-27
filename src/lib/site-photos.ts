// Shared settings for the fixed site photos in src/content/site/
// (SPEC.md §3.11), used by Index.astro and About.astro.

// The site photos are very detailed, so WebP at the default quality stays
// heavy; quality 65 keeps a phone under the 400 KB budget before scrolling
// (SPEC.md §3.11 D4). Journal and Our Work photos keep the default.
export const SITE_PHOTO_QUALITY = 65;
