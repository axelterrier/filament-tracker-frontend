<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>{{ t('addFilament.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list class="ion-padding">

        <ion-list-header>
          <ion-label>{{ t('addFilament.sectionTypeColor') }}</ion-label>
        </ion-list-header>

        <!-- Type -->
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.type') }}</ion-label>
          <ion-select v-model="filament.filament_type" interface="popover" :placeholder="$t('addFilament.typePlaceholder')" >
            <ion-select-option value="PLA">PLA</ion-select-option>
            <ion-select-option value="PETG">PETG</ion-select-option>
            <ion-select-option value="ABS">ABS</ion-select-option>
            <ion-select-option value="TPU">TPU</ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Type détaillé -->
        <ion-item v-if="detailedOptions.length">
          <ion-label position="stacked">{{ t('addFilament.typeDetailed') }}</ion-label>
          <ion-select v-model="filament.filament_detailed_type" interface="popover" :placeholder="$t('addFilament.typeDetailedPlaceholder')">
            <ion-select-option v-for="opt in detailedOptions" :key="opt" :value="opt">
              {{ opt }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Couleur avec color picker -->
        <ion-item lines="full">
          <ion-label position="stacked">{{ t('addFilament.color') }}</ion-label>
          <ion-input v-model="filament.color_code" type="text" :placeholder="$t('addFilament.colorPlaceholder')" style="flex:1" />
        </ion-item>

        <!-- Infos couleur -->
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.extraColorInfo') }}</ion-label>
          <ion-input v-model="filament.extra_color_info" :placeholder="$t('addFilament.extraColorInfoPlaceholder')" />
        </ion-item>

        <!-- Caractéristiques physiques -->
        <ion-list-header>
          <ion-label><strong>{{ t('addFilament.sectionPhysical') }}</strong></ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.diameter') }}</ion-label>
          <ion-input v-model.number="filament.filament_diameter" type="number" :placeholder="$t('addFilament.diameterPlaceholder')" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.weight') }}</ion-label>
          <ion-input v-model.number="filament.spool_weight" type="number" :placeholder="$t('addFilament.weightPlaceholder')" />
        </ion-item>

        <!-- Températures -->
        <ion-list-header>
          <ion-label><strong>{{ t('addFilament.sectionTemps') }}</strong></ion-label>
        </ion-list-header>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.printTempMin') }}</ion-label>
          <ion-input v-model.number="filament.print_temp_min" type="number" :placeholder="$t('addFilament.printTempMinPlaceholder')" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.printTempMax') }}</ion-label>
          <ion-input v-model.number="filament.print_temp_max" type="number" :placeholder="$t('addFilament.printTempMaxPlaceholder')" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.dryTemp') }}</ion-label>
          <ion-input v-model.number="filament.dry_temp" type="number" :placeholder="$t('addFilament.dryTempPlaceholder')" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.dryTimeMinutes') }}</ion-label>
          <ion-input v-model.number="filament.dry_time_minutes" type="number" :placeholder="$t('addFilament.dryTimeMinutesPlaceholder')" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.dryBedTemp') }}</ion-label>
          <ion-input v-model.number="filament.dry_bed_temp" type="number" :placeholder="$t('addFilament.dryBedTempPlaceholder')" />
        </ion-item>

      </ion-list>

      <div class="ion-padding">
        <ion-button expand="block" size="large" @click="submit">{{ t('addFilament.submit') }}</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
// Core Imports
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

// Ionic Components
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonBackButton,
  IonButtons,
  IonSelect,
  IonSelectOption,
  IonListHeader
} from '@ionic/vue';

// Styles
import 'vue-color-kit/dist/vue-color-kit.css';

// Router & i18n
const router = useRouter();
const { t } = useI18n();

// Reactive State
const filament = ref({
  uid: '',
  filament_type: '',
  filament_detailed_type: '',
  color_code: '#ffffff',
  extra_color_info: '',
  filament_diameter: null,
  spool_weight: null,
  filament_length: null,
  dry_temp: null,
  dry_time_minutes: null,
  dry_bed_temp: null,
  nozzle_diameter: null,
  print_temp_min: null,
  print_temp_max: null
});

// Filament Type Options
const filamentTypes = {
  PLA: ['Basic', 'Silk', 'Wood', 'Carbon', 'Matte'],
  PETG: ['Basic', 'HF', 'Carbon'],
  ABS: ['Basic', 'Pro', 'Carbon'],
  TPU: ['95A', 'Soft', 'HF']
};

// Computed Detailed Options
const detailedOptions = computed(() =>
  filamentTypes[filament.value.filament_type] || []
);

// Watchers
watch(
  () => filament.value.filament_type,
  () => {
    filament.value.filament_detailed_type = null;
  }
);

// Helper Functions
/**
 * Generate a unique identifier.
 */
function generateUid() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Form Submission
async function submit() {
  // Assign UIDs before sending
  filament.value.uid = generateUid();
  filament.value.tray_uid = generateUid();

  try {
    const res = await fetch('http://localhost:5000/api/filaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filament.value)
    });

    if (res.status === 400) {
      const err = await res.json();
      console.error('400 Bad Request:', err.error);
      alert(`${t('error')}: ${err.error}`);
      return;
    }

    if (!res.ok) {
      console.error('Error adding filament:', res.status);
      return;
    }

    const data = await res.json();
    console.log('Added:', data);
    window.dispatchEvent(new Event('refresh-filaments'));
    router.push('/home');
  } catch (error) {
    console.error('Submission error:', error);
  }
}
</script>


<style scoped>
ion-list-header{margin:20px 0 10px}
ion-item{--inner-padding-end:0px}
.color-picker-row{display:flex;align-items:center;gap:10px;padding-top:5px}
.color-preview{width:32px;height:32px;border-radius:6px;border:1px solid var(--ion-color-medium-tint);cursor:pointer}
.color-popover{margin-top:10px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.2);background:var(--ion-background-color);padding:12px}
</style>
