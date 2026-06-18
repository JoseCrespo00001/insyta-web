import { getRequestConfig } from "next-intl/server";

// Locale por defecto. Hoy es fijo en español.
// Cuando sumemos inglés con routing (/es, /en), este valor vendrá del
// segmento [locale] / cookie / header en vez de ser constante — sin tocar los mensajes.
const DEFAULT_LOCALE = "es";

export default getRequestConfig(async () => {
  const locale = DEFAULT_LOCALE;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
