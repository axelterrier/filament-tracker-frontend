<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ t('settings.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <!-- Thème sombre/clair -->
        <ion-item class="form-item">
          <ion-label>{{ t('settings.theme') }}</ion-label>
          <ion-toggle slot="end" v-model="dark" />
        </ion-item>

        <!-- Choix de la langue -->
        <ion-item class="form-item">
          <ion-label>{{ t('settings.language') }}</ion-label>
          <ion-select slot="end" v-model="selectedLanguage" ok-text="OK" :cancel-text="t('settings.cancel')">
            <ion-select-option v-for="lang in languages" :key="lang.value" :value="lang.value">
              {{ lang.text }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Unité de mesure -->
        <ion-item class="form-item">
          <ion-label>{{ t('settings.units') }}</ion-label>
          <ion-select slot="end" v-model="selectedUnit" ok-text="OK" :cancel-text="t('settings.cancel')">
            <ion-select-option v-for="unit in units" :key="unit.value" :value="unit.value">
              {{ unit.text }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// Core Imports
import { ref, watch } from 'vue';

// Ionic Components
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption
} from '@ionic/vue';

// i18n
import { useI18n } from 'vue-i18n';

// Theme Utility
import { setDarkTheme } from '@/main';

// Reactive State
const dark = ref(localStorage.getItem('dark') === 'true');

// Localization
const { t, locale } = useI18n();

// Available Languages
interface Language { value: string; text: string; }
const languages: Language[] = [
  { value: 'fr', text: t('settings.languages.fr') },
  { value: 'en', text: t('settings.languages.en') }
];
const selectedLanguage = ref<string>(localStorage.getItem('locale') || locale.value);

// Available Units
interface Unit { value: string; text: string; }
const units: Unit[] = [
  { value: 'metric', text: t('settings.metric') },
  { value: 'imperial', text: t('settings.imperial') }
];
const selectedUnit = ref<string>(localStorage.getItem('unit') || 'metric');

// Watchers
watch(dark, (isDark) => setDarkTheme(isDark));

watch(selectedLanguage, (lang) => {
  locale.value = lang;
  localStorage.setItem('locale', lang);
});

watch(selectedUnit, (unit) => {
  localStorage.setItem('unit', unit);
});
</script>


<style scoped>
.form-item {
  margin-bottom: 1.5rem;
}
</style>