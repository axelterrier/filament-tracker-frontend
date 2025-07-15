<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>Détail du filament</ion-title>
        <!-- AJOUTER UN BOUTON POUR PERMETTRE L'EDITION-->
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-card v-if="filament">
        <ion-card-header>
          <ion-card-title>
            {{ filament.filament_type || 'Type inconnu' }}<span v-if="filament.filament_detailed_type"> - {{ filament.filament_detailed_type }}</span>
          </ion-card-title>
          <ion-card-subtitle>
            UID: <code>{{ filament.uid }}</code>
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <!-- Couleur et Infos Générales -->
          <div class="detail-row">
            <div class="color-preview" :style="{backgroundColor: filament.color_code}" :title="filament.color_code"></div>
            <div>
              <strong>Couleur :</strong>
              <span>{{ filament.extra_color_info || filament.color_code || 'N/A' }}</span>
            </div>
          </div>
          <ion-list lines="none" class="ion-margin-top">

            <!-- Lignes principales -->
            <ion-item>
              <ion-label>
                <strong>Diamètre :</strong> {{ filament.filament_diameter ?? '—' }} mm
              </ion-label>
              <ion-label>
                <strong>Poids bobine :</strong> {{ filament.spool_weight ?? '—' }} g
              </ion-label>
              <ion-label>
                <strong>Largeur bobine :</strong> {{ filament.spool_width ?? '—' }} mm
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <strong>Longueur filament :</strong> {{ filament.filament_length ?? '—' }} m
              </ion-label>
              <ion-label>
                <strong>Type buse :</strong> {{ filament.nozzle_diameter ?? '—' }} mm
              </ion-label>
              <ion-label>
                <strong>XCAM info :</strong> {{ filament.xcam_info ?? '—' }}
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <strong>Température impression :</strong>
                {{ filament.print_temp_min ?? '—' }}&nbsp;–&nbsp;{{ filament.print_temp_max ?? '—' }} °C
              </ion-label>
              <ion-label>
                <strong>Séchage :</strong>
                {{ filament.dry_temp ?? '—' }} °C / {{ filament.dry_time_minutes ?? '—' }} min / Lit : {{ filament.dry_bed_temp ?? '—' }} °C
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <strong>Date fabrication :</strong>
                {{ filament.manufacture_datetime_utc ?? '—' }}
              </ion-label>
              <ion-label>
                <strong>Date courte :</strong>
                {{ filament.short_date ?? '—' }}
              </ion-label>
              <ion-label>
                <strong>Ajouté le :</strong>
                {{ filament.created_at ? new Date(filament.created_at).toLocaleString() : '—' }}
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <strong>Tray UID :</strong> <code>{{ filament.tray_uid ?? '—' }}</code>
              </ion-label>
              <ion-label>
                <strong>Fabricant Tag :</strong> {{ filament.tag_manufacturer ?? '—' }}
              </ion-label>
            </ion-item>
          </ion-list>
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
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonList, IonItem, IonLabel
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const filament = ref(null);

onMounted(async () => {
  const id = route.params.id;
  try {
    const res = await fetch(`http://localhost:5000/api/filaments/${id}`);
    if (!res.ok) throw new Error('Erreur chargement filament');
    filament.value = await res.json();
  } catch (e) {
    filament.value = null;
    console.error(e);
  }
});
</script>

<style scoped>
.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.color-preview {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #ccc;
}
ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --background: none;
  --ion-item-background: none;
  font-size: 1em;
}
ion-label[slot] {
  min-width: 90px;
  color: var(--ion-color-medium);
}
ion-card-content {
  font-size: 1.02em;
}
</style>
