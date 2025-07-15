import { createApp } from 'vue'
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router';

import fr from './locales/fr.json';
import en from './locales/en.json';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';



/* Theme variables */
import './theme/variables.css';
/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
import '@ionic/vue/css/palettes/dark.class.css';

const i18n = createI18n({
  legacy: false,           // Pour l’API Composition
  globalInjection: true,   // Injecte $t() dans tous les composants
  locale: 'fr',            // Langue par défaut
  fallbackLocale: 'en',    // Secours si clé introuvable
  messages: { fr, en }     // Objet de toutes tes traductions
});

export function setDarkTheme(isDark: boolean) {
  console.log('▶ setDarkTheme called with', isDark);
  // applique / retire la classe sur l’<html>
  document.documentElement.classList.toggle('ion-palette-dark', isDark);
  localStorage.setItem('dark', isDark ? 'true' : 'false');
}

const app = createApp(App)
  .use(IonicVue)
  .use(i18n)
  .use(createPinia())
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
});

const stored = localStorage.getItem('dark');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setDarkTheme(stored === null ? prefersDark : stored === 'true');

fetch('http://localhost:5000/api/filaments')
  .then(res => res.json())
  .then(data => console.log(data));
