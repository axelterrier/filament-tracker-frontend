/**
 * @param {boolean} isDark
 */
export function setDarkTheme(isDark) {
  const root = document.documentElement; // <html>
  root.classList.toggle('ion-palette-dark', !!isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light'; // optionnel
  localStorage.setItem('dark', isDark ? 'true' : 'false');
}
