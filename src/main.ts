import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';

import App from './App.vue';
import router from './router';

import fr from './locales/fr.json';
import en from './locales/en.json';

/* CSS Ionic */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
import '@ionic/vue/css/palettes/dark.class.css';

/* Variables + thème */
import './theme/variables.css';
import { setDarkTheme } from './theme';

// Init dark mode
const saved = localStorage.getItem('dark');
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
setDarkTheme(saved === null ? prefersDark : saved === 'true');

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'fr',
  fallbackLocale: 'en',
  messages: { fr, en },
});

// App
const app = createApp(App)
  .use(IonicVue)
  .use(createPinia())
  .use(i18n)
  .use(router);

router.isReady().then(() => app.mount('#app'));
