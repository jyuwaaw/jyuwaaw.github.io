export const APPEARANCE_KEY = 'benji-appearance-v2';
export const THEMES = ['system', 'light', 'dark'];
export const THEME_COLORS = { light: '#f6f7f5', dark: '#101210' };

// Earlier versions also stored a trial font and weight under the same key.
// Those fields are ignored now; only the theme survives.
export function normalizeAppearance(value) {
  return { theme: ['system', 'light', 'dark'].includes(value?.theme) ? value.theme : 'system' };
}

// Runs before first paint; only validated values reach HTML attributes.
export const appearanceScript = `(() => {
  const normalize = ${normalizeAppearance.toString()};
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem('${APPEARANCE_KEY}'));
    if (!saved) saved = JSON.parse(localStorage.getItem('benji-appearance-v1'));
  } catch {}
  document.documentElement.dataset.theme = normalize(saved).theme;
})();`;
