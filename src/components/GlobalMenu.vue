<template>
    <ion-menu side="start" content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ t('menu.title') }}</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content>
        <ion-list lines="none">
          <!-- Home -->
          <ion-menu-toggle auto-hide="false">
            <ion-item routerLink="/home" routerDirection="root" lines="none">
              <ion-icon slot="start" :icon="homeOutline" />
              <ion-label>{{ t('menu.home') }}</ion-label>
            </ion-item>
          </ion-menu-toggle>

          <ion-menu-toggle auto-hide="false">
            <ion-item routerLink="/statistic" routerDirection="root" lines="none">
              <ion-icon slot="start" :icon="statsChartOutline" />
              <ion-label>{{ t('menu.statistic') }}</ion-label>
            </ion-item>
          </ion-menu-toggle>
  
          <!-- Settings -->
          <ion-menu-toggle auto-hide="false">
            <ion-item routerLink="/settings" routerDirection="forward" lines="none">
              <ion-icon slot="start" :icon="settingsOutline" />
              <ion-label>{{ t('menu.settings') }}</ion-label>
            </ion-item>
          </ion-menu-toggle>

          <ion-menu-toggle auto-hide="false">
            <ion-item routerLink="/login" routerDirection="root" lines="none">
              <ion-icon slot="start" :icon="logInOutline" color="danger"/>
              <ion-label>{{ t('menu.disconnect') }}</ion-label>
            </ion-item>
          </ion-menu-toggle>

        </ion-list>
      </ion-content>
    </ion-menu>
  </template>
  
  <script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { homeOutline, logInOutline, settingsOutline, statsChartOutline } from 'ionicons/icons';
  import {
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel
  } from '@ionic/vue';
  
  const { t } = useI18n();
  </script>
  