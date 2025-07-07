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
import { ref, watch } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle
} from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { setDarkTheme } from '@/main';

const { t } = useI18n();
const dark = ref(localStorage.getItem('dark') === 'true');
watch(dark, (isDark) => setDarkTheme(isDark));
</script>

<style scoped>
#container {
  padding: 16px;
}
</style>
