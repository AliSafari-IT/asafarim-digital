import type { Dictionaries } from "@asafarim/shared-i18n";

/**
 * Content Generator specific translation overrides. Keys shadow the base
 * dictionary from `@asafarim/shared-i18n`. Add app-only keys under `cg.*`.
 */
export const contentGeneratorDictionaries: Dictionaries = {
  en: {
    "cg.hero.title": "AI content, on demand",
    "cg.hero.subtitle": "Draft blog posts, emails, and product copy in seconds.",
  },
  nl: {
    "cg.hero.title": "AI-content op aanvraag",
    "cg.hero.subtitle": "Schrijf blogposts, e-mails en productteksten in seconden.",
  },
  fr: {
    "cg.hero.title": "Contenu IA, à la demande",
    "cg.hero.subtitle": "Rédigez articles de blog, e-mails et textes produits en quelques secondes.",
  },
  de: {
    "cg.hero.title": "KI-Inhalte auf Abruf",
    "cg.hero.subtitle": "Erstellen Sie Blogposts, E-Mails und Produkttexte in Sekunden.",
  },
};
