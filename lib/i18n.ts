export type Lang = "en" | "id";

export type Localized<T = string> = { id: T; en: T };

export const LANGS: Lang[] = ["en", "id"];

export const LANG_LABEL: Record<Lang, string> = {
  en: "EN",
  id: "ID",
};
