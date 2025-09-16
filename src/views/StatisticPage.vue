<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>Tableau de bord</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="ion-padding simple-bg">
      <ion-grid fixed>
        <ion-row v-if="loading || error">
          <ion-col size="12">
            <ion-card class="card clean-card">
              <ion-card-content>
                <ion-skeleton-text v-if="loading" animated style="width: 60%; height: 16px" />
                <ion-text color="danger" v-else>{{ error }}</ion-text>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row class="gap-row">
          <ion-col size="12" size-md="4">
            <ion-card class="card kpi">
              <ion-card-header>
                <ion-card-title>Stock total</ion-card-title>
                <ion-card-subtitle>Somme des poids restants</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div class="kpi-value">{{ totalWeightKg.toFixed(2) }} kg</div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="4">
            <ion-card class="card kpi">
              <ion-card-header>
                <ion-card-title>Bobines</ion-card-title>
                <ion-card-subtitle>Total inventaire</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div class="kpi-value">{{ totalSpools }}</div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="4">
            <ion-card class="card kpi">
              <ion-card-header>
                <ion-card-title>% moyen restant</ion-card-title>
                <ion-card-subtitle>Moyenne sur toutes les bobines</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div class="kpi-value">{{ avgRemaining.toFixed(0) }}%</div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row class="gap-row">
          <ion-col size="12" size-md="6">
            <ion-card class="card">
              <ion-card-header>
                <ion-card-title>Répartition par matériau</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <apexchart type="donut" height="280" :options="donutMaterial.options" :series="donutMaterial.series" />
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card class="card">
              <ion-card-header>
                <ion-card-title>Répartition par sous-type</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <apexchart type="donut" height="280" :options="donutSubtype.options" :series="donutSubtype.series" />
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row class="gap-row">
          <ion-col size="12" size-md="7">
            <ion-card class="card">
              <ion-card-header>
                <ion-card-title>Top couleurs (par poids restant)</ion-card-title>
              </ion-card-header>
              <ion-card-content >
                <apexchart type="bar" height="320" :options="barTopColors.options" :series="barTopColors.series" />
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="5">
            <ion-card class="card">
              <ion-card-header>
                <ion-card-title>Bobines proches de la fin</ion-card-title>
                <ion-card-subtitle><strong>{{ lowSpools.length }}</strong> bobine(s) < 25%</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div v-if="lowSpools.length === 0" class="empty">Aucune ♥</div>
                <ion-list v-else lines="inset">
                  <ion-item v-for="s in lowSpools" :key="s.id">
                    <div class="color-dot" :style="{ backgroundColor: s.color_code || '#999' }" />
                    <ion-label>
                      <div class="item-title">{{ s.filament_type }} — {{ s.filament_detailed_type || '—' }}</div>
                      <div class="item-sub">{{ s.remaining_weight }} g restants • {{ s.remaining_percent }}%</div>
                    </ion-label>
                    <ion-badge :color="s.remaining_percent <= 10 ? 'danger' : 'warning'">{{ s.remaining_percent }}%</ion-badge>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonText, IonSkeletonText, IonList, IonItem, IonLabel, IonBadge
} from '@ionic/vue'
import VueApexCharts from 'vue3-apexcharts'
import api from '@/api'

const apexchart = VueApexCharts

interface Filament {
  id: number
  filament_type: string | null
  filament_detailed_type: string | null
  color_code: string | null
  remaining_weight: number | null
  remaining_percent: number | null
}

const loading = ref(true)
const error = ref('')
const filaments = ref<Filament[]>([])

onMounted(async () => {
  try {
    const res = await api.get('/filaments')
    filaments.value = Array.isArray(res.data) ? res.data : []
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
})

const DEFAULT_SPOOL_NET_G = 1000

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

function guessNominalWeight(f: Filament): number {
  const sub = (f.filament_detailed_type || '').toLowerCase()
  if (sub.includes('250')) return 250
  if (sub.includes('500')) return 500
  if (sub.includes('750')) return 750
  return DEFAULT_SPOOL_NET_G
}

const displayFilaments = computed<Filament[]>(() =>
  (filaments.value || []).map(f => {
    const rawW = f.remaining_weight ?? 0
    const weight = rawW < 0 ? 50 : rawW

    const needRecomputePct = (f.remaining_percent ?? -1) < 0 || rawW < 0
    const nominal = guessNominalWeight(f)
    const computedPct = nominal > 0 ? Math.round((weight / nominal) * 100) : 0
    const percent = needRecomputePct ? computedPct : (f.remaining_percent ?? 0)

    return {
      ...f,
      remaining_weight: weight,
      remaining_percent: clamp(percent, 0, 100),
    }
  })
)

const totalWeightKg = computed(() =>
  displayFilaments.value.reduce((sum, f) => sum + (f.remaining_weight || 0), 0) / 1000
)

const totalSpools = computed(() => displayFilaments.value.length)

const avgRemaining = computed(() => {
  const arr = displayFilaments.value
  if (!arr.length) return 0
  const s = arr.reduce((sum, f) => sum + (f.remaining_percent || 0), 0)
  return s / arr.length
})

function groupSum<T extends string | null>(key: (f: Filament) => T) {
  const map = new Map<string, number>()
  for (const f of displayFilaments.value) {
    const k = (key(f) || 'Inconnu') as string
    map.set(k, (map.get(k) || 0) + (f.remaining_weight || 0))
  }
  return map
}

const donutMaterial = computed(() => {
  const g = groupSum(f => f.filament_type)
  const labels = Array.from(g.keys())
  const series = labels.map(l => g.get(l) || 0)
  return {
    series,
    options: {
      labels,
      legend: { position: 'bottom' },
      dataLabels: { enabled: true, formatter: (v: number) => `${v.toFixed(0)}%` },
      tooltip: { y: { formatter: (v: number) => `${v.toFixed(0)} g` } }
    }
  }
})

const donutSubtype = computed(() => {
  const g = groupSum(f => f.filament_detailed_type)
  const labels = Array.from(g.keys())
  const series = labels.map(l => g.get(l) || 0)
  return {
    series,
    options: {
      labels,
      legend: { position: 'bottom' },
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (v: number) => `${v.toFixed(0)} g` } }
    }
  }
})

const barTopColors = computed(() => {
  const map = new Map<string, number>()
  for (const f of displayFilaments.value) {
    const k = f.color_code || '#999999'
    map.set(k, (map.get(k) || 0) + (f.remaining_weight || 0))
  }
  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const labels = entries.map(([c]) => c)
  const data = entries.map(([, v]) => v)
  return {
    series: [{ name: 'g restants', data }],
    options: {
      chart: { type: 'bar' },
      plotOptions: { bar: { horizontal: true, distributed: true } },
      xaxis: { categories: labels, labels: { formatter: (v: any) => `${v}` } },
      tooltip: { y: { formatter: (v: number) => `${v.toFixed(0)} g` } },
      dataLabels: { enabled: false }
    }
  }
})

const lowSpools = computed(() =>
  displayFilaments.value
    .filter(f => (f.remaining_percent ?? 0) < 25)
    .sort((a, b) => (a.remaining_percent ?? 0) - (b.remaining_percent ?? 0))
)
</script>

<style scoped>
.simple-bg { background: var(--ion-background-color); }
.gap-row { row-gap: 16px; }
.card.clean-card, .card.kpi, .card { border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,.06); border: 1px solid rgba(120,120,120,.15); }
.kpi { text-align: center; }
.kpi-value { font-size: 2rem; font-weight: 700; margin-top: 8px; }
.empty { opacity: .7; padding: 8px 0; }
.color-dot { width: 12px; height: 12px; border-radius: 999px; margin-right: 10px; }
.item-title { font-weight: 600; }
.item-sub { opacity: .75; font-size: .9rem; }
</style>
