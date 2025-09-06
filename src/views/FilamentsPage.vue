<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ t('home.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content >
      <FilamentTable />
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
} from '@ionic/vue';

import { useI18n } from 'vue-i18n';
import { setDarkTheme } from '@/theme';

// Custom Components
import FilamentTable from '@/components/FilamentTable.vue';
import { addOutline, codeOutline, handLeftOutline } from 'ionicons/icons';

// Localization
const { t } = useI18n();

// Reactive State
const dark = ref(localStorage.getItem('dark') === 'true');

// Watchers
watch(dark, (isDark) => setDarkTheme(isDark));
</script>


<style scoped>
#container {
  padding: 16px;
}

</style>
