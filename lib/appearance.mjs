export const APPEARANCE_KEY = 'benji-appearance-v2';
export const FONTS = [
  { id: 'geist', name: 'Geist', note: '清晰中性 · 干净利落', family: 'var(--font-geist-sans), sans-serif' },
  { id: 'jost', name: 'Jost', note: '轻盈几何 · 留白感强', family: '"Jost", sans-serif' },
  { id: 'manrope', name: 'Manrope', note: '圆润开阔 · 温和现代', family: '"Manrope", sans-serif' },
  { id: 'barlow', name: 'Barlow Condensed', note: '窄体修长 · 车库刊物感', family: '"Barlow Condensed", sans-serif' },
  { id: 'plex', name: 'IBM Plex Sans', note: '有棱角 · 工程气质', family: '"IBM Plex Sans", sans-serif' },
];
export function normalizeAppearance(value) {
  return {
    theme: ['system', 'light', 'dark'].includes(value?.theme) ? value.theme : 'system',
    font: ['geist', 'jost', 'manrope', 'barlow', 'plex'].includes(value?.font) ? value.font : 'plex',
    weight: [300, 400].includes(value?.weight) ? value.weight : 400,
  };
}
// Runs before first paint; only validated values reach HTML attributes.
export const appearanceScript = `(() => {
  const normalize = ${normalizeAppearance.toString()};
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem('${APPEARANCE_KEY}'));
    if (!saved) {
      const previous = JSON.parse(localStorage.getItem('benji-appearance-v1'));
      saved = { theme: previous?.theme };
    }
  } catch {}
  const value = normalize(saved);
  const root = document.documentElement;
  root.dataset.theme = value.theme;
  root.dataset.font = value.font;
  root.dataset.weight = String(value.weight);
})();`;
