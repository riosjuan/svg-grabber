const THEME_STORAGE_KEY = 'theme-preference';
const themeToggleSelector = '.btn-theme-toggle';
const logoThemeSelector = '.logo picture';

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getSavedTheme = () => window.localStorage.getItem(THEME_STORAGE_KEY);

const updateLogoTheme = (theme) => {
  const picture = document.querySelector(logoThemeSelector);
  if (!picture) return;

  picture.querySelectorAll('source[data-theme]').forEach((source) => {
    const isMatch = source.dataset.theme === theme;
    source.media = isMatch ? 'all' : 'not all';
  });

  const img = picture.querySelector('img');
  if (img) {
    const nextSrc = theme === 'dark' ? 'logo-for-dark.svg' : 'logo-for-light.svg';
    if (img.getAttribute('src') !== nextSrc) {
      img.setAttribute('src', nextSrc);
    }
  }
};

const updateToggle = (theme) => {
  const toggle = document.querySelector(themeToggleSelector);
  if (!toggle) return;

  toggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
  toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  toggle.setAttribute('aria-label', 'Toggle color theme');
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  updateToggle(theme);
  updateLogoTheme(theme);
};

export const setupThemeToggle = () => {
  const initialTheme = getSavedTheme() || getSystemTheme();
  applyTheme(initialTheme);

  if (!getSavedTheme()) {
    window.localStorage.setItem(THEME_STORAGE_KEY, initialTheme);
  }

  const toggle = document.querySelector(themeToggleSelector);
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const nextTheme =
      document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  });
};
