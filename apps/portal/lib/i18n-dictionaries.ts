import type { Dictionaries } from "@asafarim/shared-i18n";

/**
 * Portal-specific translation overrides. Keys here shadow the base dictionary
 * from `@asafarim/shared-i18n`. Add app-only keys under the `portal.*` prefix.
 */
export const portalDictionaries: Dictionaries = {
  en: {
    "portal.auth.signInCta": "Sign in to your portal",
    "portal.auth.signUpCta": "Create an account",
  },
  nl: {
    "portal.auth.signInCta": "Meld je aan op je portaal",
    "portal.auth.signUpCta": "Maak een account aan",
  },
  fr: {
    "portal.auth.signInCta": "Connectez-vous à votre portail",
    "portal.auth.signUpCta": "Créer un compte",
  },
  de: {
    "portal.auth.signInCta": "Im Portal anmelden",
    "portal.auth.signUpCta": "Konto erstellen",
  },
};
