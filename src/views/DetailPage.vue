<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>{{ $t('filamentDetail.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-card v-if="filament">
        <ion-card-header>
          <ion-card-title class="ion-text-wrap ion-margin-bottom">
            <strong>
              {{ filament.filament_type || $t('filamentDetail.unknownType') }}
              <span v-if="filament.filament_detailed_type">
                – {{ filament.filament_detailed_type }}
              </span>
            </strong>
          </ion-card-title>
          <ion-card-subtitle>
            {{ $t('filamentDetail.uid') }}: <code>{{ filament.uid }}</code>
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <!-- Section Général -->
          <ion-list inset lines="none" class="ion-margin-bottom">
            <ion-list-header>
              <ion-label>{{ $t('filamentDetail.general') }}</ion-label>
            </ion-list-header>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.colorLabel') }}</ion-label>
              <div
                slot="end"
                class="color-preview"
                :style="{ backgroundColor: filament.color_code }"
              ></div>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.manufactureDate') }}</ion-label>
              <ion-note slot="end">
                {{ filament.manufacture_datetime_utc || '—' }}
              </ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.addedAt') }}</ion-label>
              <ion-note slot="end">
                {{ filament.created_at ? new Date(filament.created_at).toLocaleString() : '—' }}
              </ion-note>
            </ion-item>
          </ion-list>

          <!-- Section Physique -->
          <ion-list inset lines="none" class="ion-margin-bottom">
            <ion-list-header>
              <ion-label>{{ $t('filamentDetail.physical') }}</ion-label>
            </ion-list-header>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.diameter') }}</ion-label>
              <ion-note slot="end">
                {{ filament.filament_diameter != null ? filament.filament_diameter + ' mm' : '—' }}
              </ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.spoolWeight') }}</ion-label>
              <ion-note slot="end">
                {{ filament.spool_weight != null ? filament.spool_weight + ' g' : '—' }}
              </ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.spoolWidth') }}</ion-label>
              <ion-note slot="end">
                {{ filament.spool_width != null ? filament.spool_width + ' mm' : '—' }}
              </ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.filamentLength') }}</ion-label>
              <ion-note slot="end">
                {{ filament.filament_length != null ? filament.filament_length + ' m' : '—' }}
              </ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.nozzleDiameter') }}</ion-label>
              <ion-note slot="end">
                {{ filament.nozzle_diameter != null ? filament.nozzle_diameter + ' mm' : '—' }}
              </ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.xcamInfo') }}</ion-label>
              <ion-note slot="end">
                {{ filament.xcam_info || '—' }}
              </ion-note>
            </ion-item>
          </ion-list>

          <!-- Section Températures -->
          <ion-list inset lines="none" class="ion-margin-bottom">
            <ion-list-header>
              <ion-label>{{ $t('filamentDetail.temperatures') }}</ion-label>
            </ion-list-header>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.printTemp') }}</ion-label>
              <ion-note slot="end">
                {{ filament.print_temp_min != null ? filament.print_temp_min + '°C' : '—' }}
                &nbsp;–&nbsp;
                {{ filament.print_temp_max != null ? filament.print_temp_max + '°C' : '—' }}
              </ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.dryInfo') }}</ion-label>
              <ion-note slot="end">
                {{ $t('filamentDetail.chamber') }}
                {{ filament.dry_temp != null ? filament.dry_temp + '°C' : '—' }}
                &nbsp;/&nbsp;
                {{ filament.dry_time_minutes != null ? filament.dry_time_minutes + ' min' : '—' }}
                &nbsp;/&nbsp;
                {{ $t('filamentDetail.bed') }}:
                {{ filament.dry_bed_temp != null ? filament.dry_bed_temp + '°C' : '—' }}
              </ion-note>
            </ion-item>
          </ion-list>

          <!-- Section Métadonnées -->
          <ion-list inset lines="none" class="ion-margin-bottom">
            <ion-list-header>
              <ion-label>{{ $t('filamentDetail.metadata') }}</ion-label>
            </ion-list-header>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.trayUid') }}</ion-label>
              <ion-note slot="end">
                {{ filament.tray_uid || '—' }}
              </ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">{{ $t('filamentDetail.tagManufacturer') }}</ion-label>
              <ion-note slot="end">
                {{ filament.tag_manufacturer || '—' }}
              </ion-note>
            </ion-item>
          </ion-list>

          <!-- Bouton flottant d’édition -->
          <ion-fab vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button
              :router-link="['/filament', filament.uid, 'edit']"
              router-direction="forward"
            >
              <ion-icon name="pencil-outline" />
            </ion-fab-button>
          </ion-fab>
        </ion-card-content>
      </ion-card>

      <ion-card v-else>
        <ion-card-content class="ion-padding">
          {{ $t('filamentDetail.loading') }}
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup>
// Core Imports
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// Ionic Components
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/vue';

// Router & State
const route = useRoute();
const filament = ref(null);

// Fetch data
onMounted(async () => {
  const id = route.params.id;
  try {
    const res = await fetch(`http://localhost:5000/api/filaments/${id}`);
    if (!res.ok) throw new Error(res.statusText);
    filament.value = await res.json();
  } catch (e) {
    console.error(e);
  }
});
</script>

<style scoped>
/* Texte plus grand et aéré */
ion-card-content {
  font-size: 1.3em;
  line-height: 1.5em;
}

/* Alignement en haut, hauteur auto */
ion-item {
  --min-height: auto;
  --padding-start: 18px;
  --padding-end: 18px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  align-items: flex-start;
}

/* Liste inset décalée */
ion-list[inset] {
  --inset-start: 16px;
  --inset-end: 16px;
}

/* Labels et notes adaptés */
ion-label[position="stacked"], ion-note {
  white-space: normal;
}

/* Couleur */
.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #ccc;
  margin-right: 12px;
}

/* Bouton plus grand */
ion-fab-button {
  --size: 60px;
}
ion-fab-button ion-icon {
  font-size: 1.6em;
}
</style>
