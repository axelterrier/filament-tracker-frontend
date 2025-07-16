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

    <ion-content fullscreen>
        <FilamentTable />
        <!-- MODIFIER CE BOUTON POUR AVOIR UNE POP UP D'AJOUT MANUEL OU VIA LE CAPTEUR RFID -->
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button @click="$router.push('/manual')">
            <ion-icon name="add-outline" />
          </ion-fab-button>
        </ion-fab>
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
import { setDarkTheme } from '@/main';

// Custom Components
import FilamentTable from '@/components/FilamentTable.vue';

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
