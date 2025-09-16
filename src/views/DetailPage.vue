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

      <div v-else class="container">
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
            <div class="hero-right">
              <div class="quick-stats">
                <div class="stat">
                  <div class="stat-label">{{ $t('filamentDetail.diameter') }}</div>
                  <div class="stat-value">{{ formatValue(filament.filament_diameter, 'mm') }}</div>
                </div>
                <div class="stat">
                  <div class="stat-label">{{ $t('filamentDetail.spoolWeight') }}</div>
                  <div class="stat-value">{{ formatValue(filament.spool_weight, 'g') }}</div>
                </div>
                <div class="stat">
                  <div class="stat-label">{{ $t('filamentDetail.remainingGrams') }}</div>
                  <div class="stat-value emphasize">
                    {{ formatValue(filament.remaining_grams ?? filament.spool_weight, 'g') }}
                  </div>
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
        <ion-grid class="wide-grid">
          <ion-row class="cards-grid">
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
                      <div class="value">{{ filament.manufacture_datetime_utc || '—' }}</div>
                    </div>
                    <div class="stack-item" v-if="filament.short_date">
                      <div class="label">{{ $t('filamentDetail.shortDate') }}</div>
                      <div class="value">{{ filament.short_date }}</div>
                    </div>
                    <div class="stack-item">
                      <div class="label">{{ $t('filamentDetail.addedAt') }}</div>
                      <div class="value">{{ filament.created_at ? prettyDate(filament.created_at) : '—' }}</div>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
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
                    <div class="stack-item">
                      <div class="label">{{ $t('filamentDetail.printTemp') }}</div>
                      <div class="value">
                        {{ formatValue(filament.print_temp_min, '°C') }} – {{ formatValue(filament.print_temp_max, '°C')
                        }}
                      </div>
                    </div>
                    <div class="stack-item">
                      <div class="label">{{ $t('filamentDetail.dryInfo') }}</div>
                      <div class="value">
                        {{ $t('filamentDetail.chamber') }} {{ formatValue(filament.dry_temp, '°C') }}
                        / {{ formatValue(filament.dry_time_hour, $t('filamentDetail.hourShort') || 'h') }}
                        / {{ $t('filamentDetail.bed') }} {{ formatValue(filament.dry_bed_temp, '°C') }}
                      </div>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="12" size-lg="6">
              <ion-card class="card card--spacious">
                <ion-card-header>
                  <div class="card-title">
                    <ion-icon :icon="icons.analytics" />
                    <span>{{ $t('filamentDetail.physical') }}</span>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <div class="grid-2 roomy">
                    <div class="kv">
                      <div class="k">{{ $t('filamentDetail.diameter') }}</div>
                      <div class="v">{{ formatValue(filament.filament_diameter, 'mm') }}</div>
                    </div>
                    <div class="kv">
                      <div class="k">{{ $t('filamentDetail.spoolWidth') }}</div>
                      <div class="v">{{ formatValue(filament.spool_width, 'mm') }}</div>
                    </div>
                    <div class="kv">
                      <div class="k">{{ $t('filamentDetail.filamentLength') }}</div>
                      <div class="v">{{ formatValue(filament.filament_length, 'm') }}</div>
                    </div>
                    <div class="kv">
                      <div class="k">{{ $t('filamentDetail.nozzleDiameter') }}</div>
                      <div class="v">{{ formatValue(filament.nozzle_diameter, 'mm') }}</div>
                    </div>
                    <div class="kv" v-if="filament.xcam_info">
                      <div class="k">{{ $t('filamentDetail.xcamInfo') }}</div>
                      <div class="v monospace">{{ filament.xcam_info }}</div>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
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
                    <div class="kv">
                      <div class="k">{{ $t('filamentDetail.remainingPercent') }}</div>
                      <div class="v">{{ formatValue(filament.remaining_percent, '%') }}</div>
                    </div>
                    <div class="kv">
                      <div class="k">{{ $t('filamentDetail.remainingGrams') }}</div>
                      <div class="v emphasize">{{ formatValue(filament.remaining_grams, 'g') }}</div>
                    </div>
                    <div class="kv">
                      <div class="k">{{ $t('filamentDetail.remainingLength') }}</div>
                      <div class="v">{{ formatValue(filament.remaining_length_mm, 'mm') }}</div>
                    </div>
                    <div class="kv" v-if="filament.last_sync_source">
                      <div class="k">{{ $t('filamentDetail.lastSyncSource') }}</div>
                      <div class="v">{{ filament.last_sync_source }}</div>
                    </div>
                    <div class="kv" v-if="filament.last_sync_at">
                      <div class="k">{{ $t('filamentDetail.lastSyncAt') }}</div>
                      <div class="v">{{ prettyDate(filament.last_sync_at) }}</div>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
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
                    <div class="kv">
                      <div class="k">{{ $t('filamentDetail.trayUid') }}</div>
                      <div class="v monospace">{{ filament.tray_uid || '—' }}</div>
                    </div>
                    <div class="kv">
                      <div class="k">{{ $t('filamentDetail.tagManufacturer') }}</div>
                      <div class="v">{{ filament.tag_manufacturer || '—' }}</div>
                    </div>
                    <div class="kv">
                      <div class="k">{{ $t('filamentDetail.uid') }}</div>
                      <div class="v monospace">{{ filament.uid }}</div>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonCard, IonCardHeader, IonCardContent,
  IonGrid, IonRow, IonCol,
  IonBadge, IonChip, IonIcon, IonLabel, IonSkeletonText
} from '@ionic/vue';

import {
  colorPalette, informationCircle, time, analytics, hardwareChip, thermometer
} from 'ionicons/icons';
import api from '@/api'

const icons = { colorPalette, informationCircle, time, analytics, hardwareChip, thermometer };

const route = useRoute();
const filament = ref(null);

const formatValue = (value, unit) => {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  const out = Number.isFinite(n) ? (Math.round(n * 100) / 100).toString() : String(value);
  return unit ? `${out} ${unit}` : out;
};

const prettyDate = (d) => {
  try {
    const date = new Date(d);
    return date.toLocaleString();
  } catch {
    return d || '—';
  }
};

onMounted(async () => {
  const id = route.params.id
  try {
    const { data } = await api.get(`/filaments/${encodeURIComponent(id)}`)
    filament.value = data
  } catch (e) {
    console.error('Erreur chargement filament :', e.response?.status, e.message)
    filament.value = null
  }
})

</script>

<style scoped>
.container {
  padding: 12px 12px 28px;
}

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
  border: 3px solid rgba(255, 255, 255, 0.7);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
  flex: 0 0 auto;
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

.hero-right {
  display: flex;
  align-items: center;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(100px, 1fr));
  gap: 12px;
}

.stat {
  background: var(--ion-color-step-100);
  padding: 12px;
  border-radius: 14px;
  min-width: 120px;
  text-align: center;
}

.stat-label {
  font-size: .75rem;
  opacity: .7;
  margin-bottom: 6px;
}

.stat-value {
  font-weight: 700;
  font-size: 1.05rem;
}

.stat-value.emphasize {
  font-size: 1.2rem;
}

.card {
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.10);
  overflow: hidden;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1.05rem;
  padding: 12px 16px 0;
}

.cards-grid {
  row-gap: 16px;
}

ion-card-content {
  padding-top: 8px;
}

.item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 2px;
  border-bottom: 1px dashed var(--ion-color-step-150);
}

.item:last-child {
  border-bottom: 0;
}

.label {
  font-size: .9rem;
  opacity: .8;
}

.value {
  font-weight: 600;
  text-align: right;
}

.value.monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  word-break: break-all;
}

/* Grids inside cards */
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

.compact .item {
  padding: 4px 2px;
}

.divider {
  height: 1px;
  background: var(--ion-color-step-150);
  opacity: .7;
  margin: 10px 0 4px;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: stretch;
  }

  .quick-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .grid-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-2,
  .grid-3 {
    grid-template-columns: 1fr;
  }
}

/* Ionic tweaks */
ion-chip[outline] {
  --background: transparent;
  --color: var(--ion-text-color);
  border: 1px solid var(--ion-color-step-200);
  border-radius: 999px;
}

.wide-grid {
  max-width: 1400px;
  margin: 0 auto;
}

.card--spacious {
  --padding-start: 22px;
  --padding-end: 22px;
}

.card--spacious ion-card-content {
  padding: 18px 22px 22px;
}

.cards-grid {
  row-gap: 20px;
}

.grid-2.roomy,
.grid-3.roomy {
  gap: 18px 22px;
}

.kv {
  padding: 6px 0;
  border-bottom: 1px dashed var(--ion-color-step-200);
}

.kv:last-child {
  border-bottom: 0;
}

.k {
  font-size: .92rem;
  opacity: .8;
  margin-bottom: 4px;
}

.v {
  font-weight: 600;
  font-size: 1.02rem;
}

.v.emphasize {
  font-size: 1.14rem;
}

.stack {
  display: grid;
  gap: 14px;
}

.stack-item .label {
  font-size: .95rem;
  opacity: .8;
  margin-bottom: 4px;
}

.stack-item .value {
  font-weight: 600;
  font-size: 1.05rem;
}

/* Métadonnées */
.monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  word-break: break-all;
}

@media (max-width: 992px) {
  .wide-grid {
    padding: 0 10px;
  }
}
</style>
