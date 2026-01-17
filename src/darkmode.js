// Retrieve saved theme preference from localStorage
const savedTheme =
  localStorage.getItem('theme-preference') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// Apply the selected theme to the document
document.documentElement.setAttribute('data-theme', savedTheme);

// Save the determined theme preference to localStorage if it's not already saved
if (!localStorage.getItem('theme-preference')) {
  localStorage.setItem('theme-preference', savedTheme);
}

// Apply the hue immediately to the document
document.documentElement.style.setProperty(
  savedTheme === 'dark' ? '--hue-on-dark' : '--hue-on-light',
  hue
);
