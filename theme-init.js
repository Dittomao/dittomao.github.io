// Resolve appearance before the first paint; storage holds only the theme choice.
(() => {
  let theme;
  try { theme = localStorage.getItem('audioMirror.siteTheme'); } catch { /* Storage is optional. */ }
  document.documentElement.dataset.theme = ['light', 'dark'].includes(theme)
    ? theme : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
})();
