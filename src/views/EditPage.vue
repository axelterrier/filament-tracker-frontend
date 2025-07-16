<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/filament/${route.params.id}`" />
        </ion-buttons>
        <ion-title>{{ $t('filamentEdit.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-card v-if="loaded">
        <ion-card-content>
          <form @submit.prevent="submit">
            <ion-list>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.uid') }}</ion-label>
                <ion-input v-model="filament.uid" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.trayUid') }}</ion-label>
                <ion-input v-model="filament.tray_uid" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.tagManufacturer') }}</ion-label>
                <ion-input v-model="filament.tag_manufacturer" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.type') }}</ion-label>
                <ion-input v-model="filament.filament_type" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.detailedType') }}</ion-label>
                <ion-input v-model="filament.filament_detailed_type" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.colorCode') }}</ion-label>
                <ion-input v-model="filament.color_code" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.extraColorInfo') }}</ion-label>
                <ion-input v-model="filament.extra_color_info" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.diameter') }}</ion-label>
                <ion-input
                  v-model.number="filament.filament_diameter"
                  type="number"
                  step="0.01"
                  :placeholder="$t('filamentEdit.diameter')"
                />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.spoolWidth') }}</ion-label>
                <ion-input
                  v-model.number="filament.spool_width"
                  type="number"
                  step="0.01"
                  :placeholder="$t('filamentEdit.spoolWidth')"
                />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.spoolWeight') }}</ion-label>
                <ion-input v-model.number="filament.spool_weight" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.filamentLength') }}</ion-label>
                <ion-input v-model.number="filament.filament_length" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.printTempMin') }}</ion-label>
                <ion-input v-model.number="filament.print_temp_min" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.printTempMax') }}</ion-label>
                <ion-input v-model.number="filament.print_temp_max" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.dryTemp') }}</ion-label>
                <ion-input v-model.number="filament.dry_temp" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.dryTimeMinutes') }}</ion-label>
                <ion-input v-model.number="filament.dry_time_minutes" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.dryBedTemp') }}</ion-label>
                <ion-input v-model.number="filament.dry_bed_temp" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.nozzleDiameter') }}</ion-label>
                <ion-input v-model.number="filament.nozzle_diameter" type="number" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.xcamInfo') }}</ion-label>
                <ion-input v-model="filament.xcam_info" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.manufactureDatetime') }}</ion-label>
                <ion-input
                  v-model="filament.manufacture_datetime_utc"
                  :placeholder="$t('filamentEdit.manufactureDatetimePlaceholder')"
                />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">{{ $t('filamentEdit.shortDate') }}</ion-label>
                <ion-input v-model="filament.short_date" />
              </ion-item>
            </ion-list>
            <ion-button expand="block" type="submit" color="primary" class="ion-margin-top">
              {{ $t('filamentEdit.save') }}
            </ion-button>
          </form>
        </ion-card-content>
      </ion-card>
      <ion-card v-else>
        <ion-card-content>{{ $t('filamentEdit.loading') }}</ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>


<script setup>
// Core Imports
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton
} from '@ionic/vue';

// Router & Reactive State
const route = useRoute();
const router = useRouter();
const filament = ref({});
const loaded = ref(false);

// Lifecycle: fetch filament data on mount
onMounted(async () => {
  const id = route.params.id;
  try {
    const res = await fetch(`http://localhost:5000/api/filaments/${id}`);
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    filament.value = await res.json();
    loaded.value = true;
  } catch (error) {
    alert('Erreur de chargement du filament');
    router.back();
  }
});

/**
 * Submit updated filament data
 */
async function submit() {
  const id = route.params.id;
  try {
    const res = await fetch(`http://localhost:5000/api/filaments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filament.value)
    });
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    window.dispatchEvent(new Event('refresh-filaments'));
    router.push('/home');
  } catch (error) {
    alert('Erreur lors de la mise à jour');
  }
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
