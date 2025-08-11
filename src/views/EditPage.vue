<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/filament/${route.params.id}`" />
        </ion-buttons>
        <ion-title>{{ $t('filamentEdit.title') }}</ion-title>
        <ion-buttons slot="end">
          <ion-chip color="medium" outline v-if="filament">
            <ion-icon name="pencil-outline"></ion-icon>
            <ion-label>{{ $t('common.editing') || 'Édition' }}</ion-label>
          </ion-chip>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <!-- Loading -->
      <div v-if="!filament" class="container">
        <ion-skeleton-text animated style="width: 60%; height: 28px; margin: 16px 0;"></ion-skeleton-text>
        <ion-grid fixed>
          <ion-row>
            <ion-col size="12" size-md="6" v-for="i in 4" :key="i">
              <ion-card class="card">
                <ion-card-header>
                  <ion-skeleton-text animated style="width: 40%; height: 20px;"></ion-skeleton-text>
                </ion-card-header>
                <ion-card-content>
                  <ion-skeleton-text animated style="width: 100%; height: 16px; margin: 8px 0;"></ion-skeleton-text>
                  <ion-skeleton-text animated style="width: 85%; height: 16px; margin: 8px 0;"></ion-skeleton-text>
                  <ion-skeleton-text animated style="width: 70%; height: 16px; margin: 8px 0;"></ion-skeleton-text>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <!-- Content -->
      <div v-else class="container">
        <!-- Hero (affichage only, sans stats éditées) -->
        <ion-card class="hero">
          <ion-card-content class="hero-content">
            <div class="hero-left">
              <div class="color-bubble" :style="{ backgroundColor: filament.color_code || '#e5e7eb' }"></div>
              <div>
                <div class="hero-title">
                  <ion-badge mode="ios" color="primary" class="badge-type">
                    {{ filament.filament_type || $t('filamentDetail.unknownType') }}
                  </ion-badge>
                  <span v-if="filament.filament_detailed_type" class="detail-type">
                    – {{ filament.filament_detailed_type }}
                  </span>
                </div>
                <div class="hero-sub">
                  {{ $t('filamentDetail.uid') }}: <code>{{ filament.uid }}</code>
                </div>
                <div class="hero-meta">
                  <ion-chip outline>
                    <ion-icon :icon="icons.colorPalette" />
                    <ion-label>{{ filament.color_code || '—' }}</ion-label>
                  </ion-chip>
                  <ion-chip outline v-if="filament.extra_color_info">
                    <ion-icon :icon="icons.informationCircle" />
                    <ion-label>{{ filament.extra_color_info }}</ion-label>
                  </ion-chip>
                  <ion-chip outline>
                    <ion-icon :icon="icons.time" />
                    <ion-label>
                      {{ $t('filamentDetail.addedAt') }}:
                      {{ filament.created_at ? prettyDate(filament.created_at) : '—' }}
                    </ion-label>
                  </ion-chip>
                </div>
              </div>
            </div>
            <div class="hero-right"></div>
          </ion-card-content>
        </ion-card>

        <!-- GRID -->
        <ion-grid class="wide-grid">
          <ion-row class="cards-grid">

            <!-- Propriétés physiques (inclut nozzle + diamètre + largeur + longueur + type) -->
            <ion-col size="12" size-lg="6">
              <ion-card class="card card--spacious">
                <ion-card-header>
                  <div class="card-title">
                    <ion-icon :icon="icons.analytics" />
                    <span>{{ $t('filamentDetail.physical') }}</span>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <div class="grid-3 roomy">
                    <div>
                      <div class="k">{{ $t('filamentDetail.diameter') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.number="filament.filament_diameter" type="number" step="0.01"
                          inputmode="decimal" placeholder="1.75" />
                        <ion-note slot="end">mm</ion-note>
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentDetail.spoolWidth') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.number="filament.spool_width" type="number" step="0.1" inputmode="decimal"
                          placeholder="65" />
                        <ion-note slot="end">mm</ion-note>
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentDetail.filamentLength') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.number="filament.filament_length" type="number" inputmode="numeric"
                          placeholder="330" />
                        <ion-note slot="end">m</ion-note>
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentDetail.nozzleDiameter') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.number="filament.nozzle_diameter" type="number" step="0.01"
                          inputmode="decimal" placeholder="0.4" />
                        <ion-note slot="end">mm</ion-note>
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentEdit.type') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.trim="filament.filament_type" placeholder="PLA, PETG, ABS…" />
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentEdit.detailedType') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.trim="filament.filament_detailed_type" placeholder="Basic, Silk, CF…" />
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div class="grid-span-3">
                      <div class="k">{{ $t('filamentDetail.xcamInfo') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.trim="filament.xcam_info" placeholder="…" />
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <!-- AMS / Stock (remaining_grams + spool_weight + percent auto) -->
            <ion-col size="12" size-lg="6">
              <ion-card class="card card--spacious">
                <ion-card-header>
                  <div class="card-title">
                    <ion-icon :icon="icons.hardwareChip" />
                    <span>{{ $t('filamentDetail.amsSync') }}</span>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <div class="grid-2 roomy">
                    <div>
                      <div class="k">{{ $t('filamentDetail.remainingGrams') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.number="filament.remaining_grams" type="number" inputmode="numeric"
                          placeholder="ex: 730" />
                        <ion-note slot="end">g</ion-note>
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentDetail.spoolWeight') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.number="filament.spool_weight" type="number" inputmode="numeric"
                          placeholder="ex: 1000" />
                        <ion-note slot="end">g</ion-note>
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentDetail.remainingPercent') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.number="filament.remaining_percent" type="number" min="0" max="100" />
                        <ion-note slot="end">%</ion-note>
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentDetail.remainingLength') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.number="filament.remaining_length_mm" type="number" />
                        <ion-note slot="end">mm</ion-note>
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentDetail.lastSyncSource') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.trim="filament.last_sync_source" placeholder="ams / manual / api" />
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentDetail.lastSyncAt') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.trim="filament.last_sync_at" placeholder="YYYY-MM-DD HH:mm:ss" />
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <!-- Températures -->
            <ion-col size="12" size-lg="6">
              <ion-card class="card card--spacious">
                <ion-card-header>
                  <div class="card-title">
                    <ion-icon :icon="icons.thermometer" />
                    <span>{{ $t('filamentDetail.temperatures') }}</span>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <div class="stack">
                    <div class="grid-2">
                      <div>
                        <div class="label">{{ $t('filamentDetail.printTemp') }} (min)</div>
                        <ion-item class="editable">
                          <ion-input v-model.number="filament.print_temp_min" type="number" inputmode="numeric"
                            placeholder="190" />
                          <ion-note slot="end">°C</ion-note>
                          <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                        </ion-item>
                      </div>
                      <div>
                        <div class="label">{{ $t('filamentDetail.printTemp') }} (max)</div>
                        <ion-item class="editable">
                          <ion-input v-model.number="filament.print_temp_max" type="number" inputmode="numeric"
                            placeholder="240" />
                          <ion-note slot="end">°C</ion-note>
                          <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                        </ion-item>
                      </div>
                    </div>
                    <div class="grid-3">
                      <div>
                        <div class="label">{{ $t('filamentDetail.chamber') }}</div>
                        <ion-item class="editable">
                          <ion-input v-model.number="filament.dry_temp" type="number" inputmode="numeric"
                            placeholder="55" />
                          <ion-note slot="end">°C</ion-note>
                          <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                        </ion-item>
                      </div>
                      <div>
                        <div class="label">{{ $t('filamentDetail.hourShort') }}</div>
                        <ion-item class="editable">
                          <ion-input v-model.number="filament.dry_time_hour" type="number" inputmode="numeric"
                            placeholder="8" />
                          <ion-note slot="end">{{ $t('filamentDetail.hourShort') || 'h' }}</ion-note>
                          <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                        </ion-item>
                      </div>
                      <div>
                        <div class="label">{{ $t('filamentDetail.bed') }}</div>
                        <ion-item class="editable">
                          <ion-input v-model.number="filament.dry_bed_temp" type="number" inputmode="numeric"
                            placeholder="0" />
                          <ion-note slot="end">°C</ion-note>
                          <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                        </ion-item>
                      </div>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <!-- Général -->
            <ion-col size="12" size-lg="6">
              <ion-card class="card card--spacious">
                <ion-card-header>
                  <div class="card-title">
                    <ion-icon :icon="icons.informationCircle" />
                    <span>{{ $t('filamentDetail.general') }}</span>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <div class="stack">
                    <div class="stack-item">
                      <div class="label">{{ $t('filamentDetail.manufactureDate') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.trim="filament.manufacture_datetime_utc"
                          :placeholder="$t('filamentEdit.manufactureDatetimePlaceholder') || 'YYYY-MM-DD HH:mm:ss'" />
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div class="stack-item">
                      <div class="label">{{ $t('filamentDetail.shortDate') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.trim="filament.short_date" placeholder="YYYY-MM" />
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>



            <!-- Métadonnées -->
            <ion-col size="12">
              <ion-card class="card card--spacious">
                <ion-card-header>
                  <div class="card-title">
                    <ion-icon :icon="icons.informationCircle" />
                    <span>{{ $t('filamentDetail.metadata') }}</span>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <div class="grid-3 roomy">
                    <div>
                      <div class="k">{{ $t('filamentDetail.trayUid') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.trim="filament.tray_uid" placeholder="…" />
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentDetail.tagManufacturer') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.trim="filament.tag_manufacturer" placeholder="…" />
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                    <div>
                      <div class="k">{{ $t('filamentDetail.uid') }}</div>
                      <ion-item class="editable">
                        <ion-input v-model.trim="filament.uid" placeholder="…" />
                        <ion-icon slot="end" name="pencil-outline" class="hint-icon" />
                      </ion-item>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

          </ion-row>
        </ion-grid>

        <!-- Actions -->
        <div class="actions">
          <ion-button fill="clear" @click="cancel">{{ $t('common.cancel') }}</ion-button>
          <ion-button :disabled="submitting" color="primary" @click="submit">
            {{ submitting ? $t('common.saving') : $t('filamentEdit.save') }}
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardContent, IonGrid, IonRow, IonCol,
  IonBadge, IonChip, IonIcon, IonLabel, IonSkeletonText, IonItem, IonInput, IonNote, IonButton
} from '@ionic/vue';
import { colorPalette, informationCircle, time, analytics, hardwareChip, thermometer } from 'ionicons/icons';

const icons = { colorPalette, informationCircle, time, analytics, hardwareChip, thermometer };

const route = useRoute();
const router = useRouter();
const filament = ref(null);
const submitting = ref(false);

const prettyDate = (d) => {
  try { return new Date(d).toLocaleString(); } catch { return d || '—'; }
};

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

// Recalcul auto du pourcentage quand poids restant / total changent
watch(
  () => filament.value ? [filament.value.remaining_grams, filament.value.spool_weight] : [null, null],
  ([rg, sw]) => {
    const g = Number(rg), t = Number(sw);
    if (Number.isFinite(g) && Number.isFinite(t) && t > 0) {
      const pct = Math.max(0, Math.min(100, Math.round((g / t) * 100)));
      if (filament.value) filament.value.remaining_percent = pct;
    }
  }
);

async function submit() {
  if (!filament.value || submitting.value) return;
  submitting.value = true;
const id = Number(route.params.id);
if (!Number.isFinite(id)) { router.back(); return; }
  try {
    const res = await fetch(`http://localhost:5000/api/filaments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filament.value)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    window.dispatchEvent(new Event('refresh-filaments'));
    router.push(`/filament/${id}`);
  } catch (e) {
    alert('Erreur lors de la mise à jour');
  } finally {
    submitting.value = false;
  }
}

function cancel() {
  router.push(`/filament/${route.params.id}`);
}
</script>

<style scoped>
.container {
  padding: 12px 12px 28px;
}

/* HERO */
.hero {
  --background: linear-gradient(135deg, var(--ion-color-step-50), var(--ion-color-step-150));
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.hero-content {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
}

.hero-left {
  display: flex;
  gap: 16px;
  align-items: center;
  min-width: 0;
}

.color-bubble {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, .7);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .05);
}

.hero-title {
  font-weight: 700;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-type {
  font-weight: 700;
  letter-spacing: .2px;
}

.detail-type {
  opacity: .9;
}

.hero-sub {
  margin-top: 4px;
  opacity: .85;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  word-break: break-all;
}

.hero-meta {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* CARDS */
.card {
  height: 100%;
  /* occupe la hauteur du col */
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  /* pour que le contenu prenne le reste */
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1.05rem;
  padding: 12px 16px 0;
}

.card-title .chip-editable {
  margin-left: auto;
}

.cards-grid {
  row-gap: 20px;
  align-items: stretch;
  /* force toutes les colonnes à s'aligner en hauteur */
}

.card ion-card-content {
  flex: 1;
  /* pousse le contenu à occuper l'espace */
  display: flex;
  flex-direction: column;
}

ion-card-content {
  padding-top: 8px;
}

/* INNER GRIDS */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 16px;
}

.grid-span-3 {
  grid-column: 1 / -1;
}

.card--spacious {
  --padding-start: 22px;
  --padding-end: 22px;
}

.card--spacious ion-card-content {
  padding: 18px 22px 22px;
}

.k {
  font-size: .92rem;
  opacity: .8;
  margin-bottom: 6px;
}

.stack {
  display: grid;
  gap: 14px;
}

/* INPUT look (affordance forte) */
.editable {
  --background: var(--ion-color-step-100);
  border: 1px dashed var(--ion-color-step-200);
  border-radius: 10px;
  --inner-padding-top: 10px;
  --inner-padding-bottom: 10px;
}

.editable:focus-within {
  border-style: solid;
  box-shadow: 0 0 0 2px rgba(100, 150, 255, .25);
}

.hint-icon {
  opacity: .6;
}

.help {
  display: block;
  margin-top: 6px;
}

/* WIDTH */
.wide-grid {
  max-width: 1400px;
  margin: 0 auto;
}

/* Actions */
.actions {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 0 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, .35) 30%, rgba(0, 0, 0, .55));
  backdrop-filter: blur(2px);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: stretch;
  }

  .grid-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {

  .grid-2,
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>
