<template>
  <ion-app>
    <GlobalMenu/>
    <ion-router-outlet id="main-content" />  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import GlobalMenu from '@/components/GlobalMenu.vue'
</script>
