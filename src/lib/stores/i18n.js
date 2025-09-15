import {
  register,
  init,
  locale
} from "svelte-i18n";

// Register all your translation files
register("en", () => import("../../locales/en.json"));
register("id", () => import("../../locales/id.json"));

// Initialize the translation library
// You can set the initial locale here
init({
  fallbackLocale: "en",
  initialLocale: "en",
});

// The Svelte store 'locale' is what you'll use to change the language.
export {
  locale
};