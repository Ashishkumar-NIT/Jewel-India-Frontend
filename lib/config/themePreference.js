export const THEME_STORAGE_KEY = "retailer_selected_theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const APPLICABLE_THEME_IDS = new Set(["indian", "maharaja"]);

export function normalizeThemeId(themeId, fallback = "indian") {
  return APPLICABLE_THEME_IDS.has(themeId) ? themeId : fallback;
}
