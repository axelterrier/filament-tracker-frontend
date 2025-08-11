import { defineStore } from 'pinia';
import { setDarkTheme } from '@/theme';

export const useMainStore = defineStore('main', {
  state: () => ({
    darkMode: (localStorage.getItem('dark') ?? 'false') === 'true',
  }),
  actions: {
    setDarkMode(active: boolean) {
      this.darkMode = active;
      setDarkTheme(active); // applique la classe + persiste
    },
  },
});
