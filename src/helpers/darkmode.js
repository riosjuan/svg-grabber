// import { moonIcon, sunIcon } from '../svg-core/icons';

const THEME_STORAGE_KEY = 'theme-preference';
const themeToggleSelector = '.btn-theme-toggle';

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getSavedTheme = () => window.localStorage.getItem(THEME_STORAGE_KEY);

const updateToggle = (theme) => {
  const toggle = document.querySelector(themeToggleSelector);
  if (!toggle) return;

  toggle.innerHTML = theme === 'dark' ? 'Theme: Light' : 'Theme: Dark';
  toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  toggle.setAttribute('aria-label', 'Toggle color theme');
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  updateToggle(theme);
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
