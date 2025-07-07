import { defineStore } from 'pinia';

export const useMainStore = defineStore('main', {
  state: () => ({
    token: '' as string,
    darkMode: false as boolean,
    locale: 'fr' as string,
  }),
  actions: {
    setToken(t: string) {
      this.token = t;
    },
    setDarkMode(active: boolean) {
      this.darkMode = active;
      document.body.classList.toggle('dark', active);
      localStorage.setItem('darkMode', active ? '1' : '0');
    },
    setLocale(lang: string) {
      this.locale = lang;
      localStorage.setItem('locale', lang);
    }
  }
});
