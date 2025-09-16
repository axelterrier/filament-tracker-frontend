<template>
  <ion-app>
    <ion-page>
      <ion-header class="global-header">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button />
          </ion-buttons>
          <ion-title>Filament tracker</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content fullscreen>
        <ion-split-pane content-id="main-content" when="lg">
          <ion-menu content-id="main-content" type="reveal" :content-width="200">
            <ion-content>
              <ion-list lines="none">
                <ion-menu-toggle auto-hide="false">
                  <ion-item routerLink="/filaments" routerDirection="root">
                    <ion-icon slot="start" :icon="cubeOutline" />
                    <ion-label>Filaments</ion-label>
                  </ion-item>
                </ion-menu-toggle>
                <ion-menu-toggle auto-hide="false">
                  <ion-item routerLink="/statistic" routerDirection="root">
                    <ion-icon slot="start" :icon="statsChartOutline" />
                    <ion-label>Statistiques</ion-label>
                  </ion-item>
                </ion-menu-toggle>
                <ion-menu-toggle auto-hide="false">
                  <ion-item routerLink="/settings" routerDirection="root">
                    <ion-icon slot="start" :icon="settingsOutline" />
                    <ion-label>Paramètres</ion-label>
                  </ion-item>
                </ion-menu-toggle>
                <ion-menu-toggle auto-hide="false">
                  <ion-item routerLink="/3mf-analyse" routerDirection="root">
                    <ion-icon slot="start" :icon="documentAttachOutline" />
                    <ion-label>3MF</ion-label>
                  </ion-item>
                </ion-menu-toggle>
                <ion-menu-toggle auto-hide="false">
                  <ion-item routerLink="/login" routerDirection="root">
                    <ion-icon slot="start" :icon="logInOutline" color="danger" />
                    <ion-label>Déconnexion</ion-label>
                  </ion-item>
                </ion-menu-toggle>
              </ion-list>
            </ion-content>
          </ion-menu>
          <ion-router-outlet id="main-content" />
        </ion-split-pane>
      </ion-content>
    </ion-page>
  </ion-app>
</template>
<script setup lang="ts">
import {
  IonApp, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonSplitPane, IonMenu, IonRouterOutlet,
  IonList, IonMenuToggle, IonItem, IonIcon, IonLabel
} from '@ionic/vue';
import {
  statsChartOutline, settingsOutline, documentAttachOutline,
  logInOutline, cubeOutline
} from 'ionicons/icons';
</script>

<style>
:root {
  --app-header-height: var(--ion-toolbar-height, 56px);
}

.global-header {
  --background: var(--ion-color-dark);
  --color: var(--ion-color-light);
  border-bottom: 1px solid var(--ion-color-step-150);
}

ion-menu::part(container) {
  top: var(--app-header-height);
  height: calc(100% - var(--app-header-height));
}


ion-menu {
  width: auto;
}
</style>