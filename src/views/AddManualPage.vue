<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>Ajout manuel</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list class="ion-padding">

        <ion-list-header>
          <ion-label><strong>Type &amp; Couleur</strong></ion-label>
        </ion-list-header>

        <!-- Type -->
        <ion-item>
          <ion-label position="stacked">Type</ion-label>
          <ion-select v-model="filament.filament_type" interface="popover" placeholder="Choisir un type">
            <ion-select-option value="PLA">PLA</ion-select-option>
            <ion-select-option value="PETG">PETG</ion-select-option>
            <ion-select-option value="ABS">ABS</ion-select-option>
            <ion-select-option value="TPU">TPU</ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Type détaillé -->
        <ion-item v-if="detailedOptions.length">
          <ion-label position="stacked">Type détaillé</ion-label>
          <ion-select v-model="filament.filament_detailed_type" interface="popover" placeholder="Choisir un type détaillé">
            <ion-select-option v-for="opt in detailedOptions" :key="opt" :value="opt">
              {{ opt }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Couleur avec color picker -->
        <ion-item lines="full">
          <ion-label position="stacked">Couleur</ion-label>
          <ion-input v-model="filament.color_code" type="text" placeholder="28fc9e" style="flex:1" />
        </ion-item>

        <!-- Infos couleur -->
        <ion-item>
          <ion-label position="stacked">Infos couleur</ion-label>
          <ion-input v-model="filament.extra_color_info" placeholder="ex: White Pearl" />
        </ion-item>

        <!-- Caractéristiques physiques -->
        <ion-list-header>
          <ion-label><strong>Caractéristiques physiques</strong></ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label position="stacked">Diamètre (mm)</ion-label>
          <ion-input v-model.number="filament.filament_diameter" type="number" placeholder="1.75" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Poids (g)</ion-label>
          <ion-input v-model.number="filament.spool_weight" type="number" placeholder="1000" />
        </ion-item>

        <!-- Températures -->
        <ion-list-header>
          <ion-label><strong>Températures</strong></ion-label>
        </ion-list-header>
        <ion-item>
          <ion-label position="stacked">Température impression minimum</ion-label>
          <ion-input v-model.number="filament.print_temp_min" type="number" placeholder="170" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Température impression maximum</ion-label>
          <ion-input v-model.number="filament.print_temp_max" type="number" placeholder="230" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Séchage (°C)</ion-label>
          <ion-input v-model.number="filament.dry_temp" type="number" placeholder="55" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Temps séchage (min)</ion-label>
          <ion-input v-model.number="filament.dry_time_minutes" type="number" placeholder="240" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Température lit séchage (°C)</ion-label>
          <ion-input v-model.number="filament.dry_bed_temp" type="number" placeholder="60" />
        </ion-item>

      </ion-list>

      <div class="ion-padding">
        <ion-button expand="block" size="large" @click="submit">Ajouter le filament</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonInput, IonButton,
  IonBackButton, IonButtons, IonSelect, IonSelectOption, IonListHeader
} from '@ionic/vue';
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import 'vue-color-kit/dist/vue-color-kit.css';

const router = useRouter();

const filament = ref({
  uid: '', filament_type: '', filament_detailed_type: '',
  color_code: '#ffffff', extra_color_info: '',
  filament_diameter: null, spool_weight: null, filament_length: null,
  dry_temp: null, dry_time_minutes: null, dry_bed_temp: null,
  nozzle_diameter: null, print_temp_min: null, print_temp_max: null
});

const filamentTypes = {
  PLA: ['Basic','Silk','Wood','Carbon','Matte'],
  PETG: ['Basic','HF','Carbon'], ABS: ['Basic','Pro','Carbon'], TPU: ['95A','Soft','HF']
};
const detailedOptions = computed(() => filamentTypes[filament.value.filament_type] || []);
watch(() => filament.value.filament_type, () => filament.value.filament_detailed_type = null);

// Générateur d'UID pour backend
function generateUid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Soumission du formulaire
async function submit() {
  // assigner uid et tray_uid avant l'appel
  filament.value.uid = generateUid();
  filament.value.tray_uid = generateUid();

  const res = await fetch('http://localhost:5000/api/filaments', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify(filament.value)
  });
  if (res.status === 400) {
    const err = await res.json();
    console.error('400 Bad Request:', err.error);
    alert(`Erreur : ${err.error}`);
    return;
  }
  if (!res.ok) { console.error('Erreur ajout', res.status); return; }
  const data = await res.json(); console.log('Ajouté :',data);
  window.dispatchEvent(new Event('refresh-filaments'));
  router.push('/home');
}
</script>

<style scoped>
ion-list-header{margin:20px 0 10px}
ion-item{--inner-padding-end:0px}
.color-picker-row{display:flex;align-items:center;gap:10px;padding-top:5px}
.color-preview{width:32px;height:32px;border-radius:6px;border:1px solid var(--ion-color-medium-tint);cursor:pointer}
.color-popover{margin-top:10px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.2);background:var(--ion-background-color);padding:12px}
</style>
