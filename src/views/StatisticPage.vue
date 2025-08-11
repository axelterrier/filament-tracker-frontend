<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ t('statistics.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <div id="container">
        <ion-list>
          <ion-item lines="none">
            <ion-label>{{ t('settings.theme') }}</ion-label>
            <ion-toggle slot="end" v-model="dark" />
          </ion-item>
        </ion-list>
        <!-- Remplace ce contenu par ton dashboard réel -->
      </div>
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
  IonToggle
} from '@ionic/vue';

// Internationalization
import { useI18n } from 'vue-i18n';

// Theme Utility
import { setDarkTheme } from '@/theme';

// i18n Composition API
const { t } = useI18n();

// Reactive State: Dark Mode
const dark = ref(localStorage.getItem('dark') === 'true');

// Watch for changes in dark mode and apply theme
watch(dark, (isDark) => {
  setDarkTheme(isDark);
  localStorage.setItem('dark', String(isDark));
});
</script>


<style scoped>
#container {
  padding: 16px;
}
</style>