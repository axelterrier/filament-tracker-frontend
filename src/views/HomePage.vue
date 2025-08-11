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
        <!-- Bouton principal -->
        <ion-fab-button>
          <ion-icon :icon="addOutline" />
        </ion-fab-button>

        <!-- Liste de sous‑boutons qui “pop” au-dessus -->
        <ion-fab-list side="top">
          <!-- Bouton “main” -->
          <ion-fab-button @click="$router.push('/manual')">
            <ion-icon :icon="handLeftOutline" />
          </ion-fab-button>
          <!-- Bouton “JSON” -->
          <ion-fab-button @click="$router.push('/drag-and-drop')">
            <ion-icon :icon="codeOutline" />
          </ion-fab-button>
        </ion-fab-list>
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
