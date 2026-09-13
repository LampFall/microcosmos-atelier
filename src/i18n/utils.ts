import { ui, defaultLang } from './ui';

// Haalt de huidige taal uit de URL, bv. "/en/about" -> "en", "/about" -> "nl"
export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

// Geeft een functie terug waarmee je vertaalde strings kan opvragen:
// const t = useTranslations(lang);
// t('nav.about') -> "Over mij" of "About"
export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}