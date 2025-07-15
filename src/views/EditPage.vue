<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/filament/${route.params.id}`" />
        </ion-buttons>
        <ion-title>Éditer le filament</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-card v-if="loaded">
        <ion-card-content>
          <form @submit.prevent="submit">
            <ion-list>
              <ion-item>
                <ion-label position="stacked">UID</ion-label>
                <ion-input v-model="filament.uid" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Tray UID</ion-label>
                <ion-input v-model="filament.tray_uid" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Fabricant tag</ion-label>
                <ion-input v-model="filament.tag_manufacturer" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Type</ion-label>
                <ion-input v-model="filament.filament_type" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Type détaillé</ion-label>
                <ion-input v-model="filament.filament_detailed_type" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Code couleur</ion-label>
                <ion-input v-model="filament.color_code" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Infos couleur</ion-label>
                <ion-input v-model="filament.extra_color_info" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Diamètre (mm)</ion-label>
                <ion-input v-model.number="filament.filament_diameter" type="number" step="0.01" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Largeur bobine (mm)</ion-label>
                <ion-input v-model.number="filament.spool_width" type="number" step="0.01" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Poids bobine (g)</ion-label>
                <ion-input v-model.number="filament.spool_weight" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Longueur filament (m)</ion-label>
                <ion-input v-model.number="filament.filament_length" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Temp. impression min (°C)</ion-label>
                <ion-input v-model.number="filament.print_temp_min" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Temp. impression max (°C)</ion-label>
                <ion-input v-model.number="filament.print_temp_max" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Temp. séchage (°C)</ion-label>
                <ion-input v-model.number="filament.dry_temp" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Temps séchage (min)</ion-label>
                <ion-input v-model.number="filament.dry_time_minutes" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Temp. lit séchage (°C)</ion-label>
                <ion-input v-model.number="filament.dry_bed_temp" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Diamètre buse (mm)</ion-label>
                <ion-input v-model.number="filament.nozzle_diameter" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">XCAM info</ion-label>
                <ion-input v-model="filament.xcam_info" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Date fabrication (UTC)</ion-label>
                <ion-input v-model="filament.manufacture_datetime_utc" placeholder="YYYY-MM-DD HH:mm:ss" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Date courte</ion-label>
                <ion-input v-model="filament.short_date" />
              </ion-item>
            </ion-list>
            <ion-button expand="block" type="submit" color="primary" class="ion-margin-top">
              Enregistrer
            </ion-button>
          </form>
        </ion-card-content>
      </ion-card>
      <ion-card v-else>
        <ion-card-content>Chargement…</ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
  IonCard, IonCardContent, IonList, IonItem, IonLabel, IonInput, IonButton
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const filament = ref({});
const loaded = ref(false);

onMounted(async () => {
  const id = route.params.id;
  const res = await fetch(`http://localhost:5000/api/filaments/${id}`);
  if (!res.ok) {
    alert("Erreur de chargement du filament");
    router.back();
    return;
  }
  filament.value = await res.json();
  loaded.value = true;
});

async function submit() {
  const id = route.params.id;
  const res = await fetch(`http://localhost:5000/api/filaments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filament.value)
  });
  if (!res.ok) {
    alert('Erreur lors de la mise à jour');
    return;
  }
  window.dispatchEvent(new Event('refresh-filaments'));
  router.push('/home');
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
ion-button {
  margin-top: 18px;
}
</style>
