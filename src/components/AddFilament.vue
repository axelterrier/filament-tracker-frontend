<template>
  <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="component">
    <ion-fab-button>
      <ion-icon :icon="addOutline" />
    </ion-fab-button>

    <ion-fab-list side="top">
      <ion-fab-button @click="onScanRFID">
        <ion-icon :icon="radioOutline" />
      </ion-fab-button>
      <ion-fab-button @click="onAddManual">
        <ion-icon :icon="handLeft" />
      </ion-fab-button>
    </ion-fab-list>
  </ion-fab>
</template>

<script setup>
import { IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/vue';
import { addOutline, radioOutline, createOutline, handLeft } from 'ionicons/icons';
import { useRouter } from 'vue-router';
const router = useRouter();
function onScanRFID() {
  console.log("Scan RFID");
  // ouvrir une modale ou déclencher le backend RFID
}

function onAddManual() {
  router.push('/manual'); // ← Redirige vers la page d'ajout manuel
}
</script>

<style>
.component{
    margin-right: 20px;
    margin-bottom: 20px;
}
</style>