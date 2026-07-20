// Lightweight i18n core for the playground.
// No external library needed: just the Localized type + React context.

export type Lang = "en" | "id";

// A value that has both English and Indonesian versions.
export type Localized<T = string> = { id: T; en: T };

export const LANGS: Lang[] = ["en", "id"];

export const LANG_LABEL: Record<Lang, string> = {
  en: "EN",
  id: "ID",
};
