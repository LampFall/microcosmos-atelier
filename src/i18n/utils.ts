import { ui, defaultLang } from './ui';

// Haalt de huidige taal uit de URL, bv. "/en/about" -> "en", "/about" -> "nl"
export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

// Pad zonder taalprefix, bv. "/en/about/" -> "/about/", "/about/" -> "/about/",
// "/en/" -> "/". Gebruikt door de taalwissel in de header en door de canonical
// en hreflang-links in de layout, zodat die altijd hetzelfde pad gebruiken.
export function getPathWithoutLocale(url: URL) {
  // Alleen "/en" als volledig padsegment, zodat bv. "/entries/" blijft staan.
  return url.pathname.replace(/^\/en(?=\/|$)/, '') || '/';
}

// Geeft een functie terug waarmee je vertaalde strings kan opvragen:
// const t = useTranslations(lang);
// t('nav.about') -> "Over mij" of "About"
export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}