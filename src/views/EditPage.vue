<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/filament/${route.params.id}`" />
        </ion-buttons>
        <ion-title>Modifier la bobine</ion-title>
        <ion-buttons slot="end" v-if="filament">
          <ion-chip color="medium" outline>
            <ion-icon name="pencil-outline"></ion-icon>
            <ion-label>Édition</ion-label>
          </ion-chip>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <!-- Skeleton -->
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
        <!-- EN-TÊTE / APERÇU -->
        <ion-card class="hero">
          <ion-card-content class="hero-content">
            <div class="hero-left">
              <div class="color-bubble" :style="{ backgroundColor: filament.color_code || '#e5e7eb' }"></div>
              <div>
                <div class="hero-title">
                  <ion-badge mode="ios" color="primary" class="badge-type">
                    {{ filament.filament_type || 'Type inconnu' }}
                  </ion-badge>
                  <span v-if="filament.filament_detailed_type" class="detail-type">
                    – {{ filament.filament_detailed_type }}
                  </span>
                </div>
                <div class="hero-sub">
                  UID : <code>{{ filament.uid }}</code>
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
                    <ion-label>Ajouté le : {{ filament.created_at ? prettyDate(filament.created_at) : '—' }}</ion-label>
                  </ion-chip>
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- GRILLE PRINCIPALE -->
        <ion-grid class="wide-grid">
          <ion-row class="cards-grid">

            <!-- COL GAUCHE : MATÉRIAU & DIMENSIONS -->
            <ion-col size="12" size-lg="6">
              <ion-card class="card card--spacious">
                <ion-card-header>
                  <div class="card-title">Matériau & dimensions</div>
                </ion-card-header>
                <ion-card-content>
                  <div class="grid-2 roomy">
                    <div>
                      <label class="k">Type</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.trim="filament.filament_type" placeholder="PLA, PETG, ABS…" />
                      </ion-item>
                    </div>
                    <div>
                      <label class="k">Type détaillé</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.trim="filament.filament_detailed_type" placeholder="Basic, Silk, CF…" />
                      </ion-item>
                    </div>
                    <div>
                      <label class="k">Diamètre filament</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.number="filament.filament_diameter" type="number" step="0.01"
                          inputmode="decimal" placeholder="1.75" />
                        <ion-note slot="end">mm</ion-note>
                      </ion-item>
                    </div>
                    <div>
                      <label class="k">Diamètre buse</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.number="filament.nozzle_diameter" type="number" step="0.01"
                          inputmode="decimal" placeholder="0.4" />
                        <ion-note slot="end">mm</ion-note>
                      </ion-item>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <!-- COL DROITE : STOCK / AMS -->
            <ion-col size="12" size-lg="6">
              <ion-card class="card card--spacious">
                <ion-card-header>
                  <div class="card-title">Stock / AMS</div>
                </ion-card-header>
                <ion-card-content>
                  <div class="grid-2 roomy">
                    <div>
                      <label class="k">Gramme(s) restants</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.number="filament.remaining_grams" type="number" inputmode="numeric"
                          placeholder="730" @ionBlur="sanitizeStock" />
                        <ion-note slot="end">g</ion-note>
                      </ion-item>
                    </div>
                    <div>
                      <label class="k">Poids bobine</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.number="filament.spool_weight" type="number" inputmode="numeric"
                          placeholder="1000" @ionBlur="sanitizeStock" />
                        <ion-note slot="end">g</ion-note>
                      </ion-item>
                    </div>
                  </div>

                  <div class="grid-2 roomy">
                    <div>
                      <label class="k">Pourcentage (auto)</label>
                      <ion-item lines="none" class="editable">
                        <ion-input :value="filament.remaining_percent ?? 0" readonly />
                        <ion-note slot="end">%</ion-note>
                      </ion-item>
                    </div>
                    <div class="progress-wrap">
                      <ion-progress-bar :value="(Number(filament.remaining_percent) || 0) / 100"></ion-progress-bar>
                      <small class="help">{{ filament.remaining_grams || 0 }} g / {{ filament.spool_weight || 0 }}
                        g</small>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <!-- TEMPÉRATURES -->
            <ion-col size="12">
              <ion-card class="card card--spacious">
                <ion-card-header>
                  <div class="card-title">Températures</div>
                </ion-card-header>
                <ion-card-content>
                  <div class="grid-3">
                    <div>
                      <label class="k">Impression (min)</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.number="filament.print_temp_min" type="number" inputmode="numeric"
                          placeholder="190" />
                        <ion-note slot="end">°C</ion-note>
                      </ion-item>
                    </div>
                    <div>
                      <label class="k">Impression (max)</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.number="filament.print_temp_max" type="number" inputmode="numeric"
                          placeholder="240" />
                        <ion-note slot="end">°C</ion-note>
                      </ion-item>
                    </div>
                    <div>
                      <label class="k">Plateau</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.number="filament.dry_bed_temp" type="number" inputmode="numeric"
                          placeholder="0" />
                        <ion-note slot="end">°C</ion-note>
                      </ion-item>
                    </div>
                    <div>
                      <label class="k">Séchage (temp.)</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.number="filament.dry_temp" type="number" inputmode="numeric"
                          placeholder="55" />
                        <ion-note slot="end">°C</ion-note>
                      </ion-item>
                    </div>
                    <div>
                      <label class="k">Séchage (heures)</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.number="filament.dry_time_hour" type="number" inputmode="numeric"
                          placeholder="8" />
                        <ion-note slot="end">h</ion-note>
                      </ion-item>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <!-- MÉTADONNÉES -->
            <ion-col size="12">
              <ion-card class="card card--spacious">
                <ion-card-header>
                  <div class="card-title">Métadonnées</div>
                </ion-card-header>
                <ion-card-content>
                  <div class="grid-3 roomy">
                    <div>
                      <label class="k">Fabricant</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.trim="filament.tag_manufacturer" placeholder="Bambu Lab" />
                      </ion-item>
                    </div>

                    <div>
                      <label class="k">Couleur (hex)</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.trim="filament.color_code" placeholder="#000000" />
                      </ion-item>
                    </div>

                    <!-- NEW: nom textuel de la couleur -->
                    <div>
                      <label class="k">Nom de couleur</label>
                      <ion-item lines="none" class="editable">
                        <ion-input v-model.trim="filament.color_name" placeholder="Jade White" />
                      </ion-item>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>


          </ion-row>
        </ion-grid>
      </div>

      <!-- Loaders / toasts -->
      <ion-loading :is-open="submitting" message="Enregistrement..." />
      <ion-toast :is-open="toast.open" :message="toast.msg" :color="toast.color" duration="2200"
        @didDismiss="toast.open=false" />
    </ion-content>

    <!-- BARRE D'ACTIONS FIXE -->
    <ion-footer translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="cancel">ANNULER</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button :disabled="!isDirty || submitting" color="primary" @click="submit">
            {{ submitting ? 'Enregistrement…' : 'ENREGISTRER' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardContent, IonGrid, IonRow, IonCol,
  IonBadge, IonChip, IonIcon, IonLabel, IonSkeletonText, IonItem, IonInput, IonNote, IonButton,
  IonFooter, IonLoading, IonToast, IonProgressBar
} from '@ionic/vue';
import { colorPalette, informationCircle, time } from 'ionicons/icons';

const icons = { colorPalette, informationCircle, time };

const route = useRoute();
const router = useRouter();
const filament = ref(null);
const original = ref(null);
const submitting = ref(false);
const toast = ref({ open: false, msg: '', color: 'success' });

const prettyDate = (d) => {
  try { return new Date(d).toLocaleString(); } catch { return d || '—'; }
};

onMounted(async () => {
  const id = route.params.id;
  try {
    const res = await fetch(`http://localhost:5000/api/filaments/${id}`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    filament.value = { ...data };
    original.value = JSON.parse(JSON.stringify(filament.value));
    sanitizeStock();
  } catch (e) {
    console.error(e);
  }
});

// Recalcule % si grammes/poids changent
watch(
  () => filament.value ? [filament.value.remaining_grams, filament.value.spool_weight] : [null, null],
  ([rg, sw]) => {
    const g = num(rg), t = num(sw);
    if (Number.isFinite(g) && Number.isFinite(t) && t > 0) {
      filament.value.remaining_percent = clamp(Math.round((g / t) * 100), 0, 100);
    } else {
      filament.value.remaining_percent = 0;
    }
  }
);

function navigateToList(fullReload = false) {
  if (!fullReload) return router.replace('/filaments');
  window.location.assign('http://localhost:8100/filaments');
}

const isDirty = computed(() => {
  if (!filament.value || !original.value) return false;
  const pick = (o) => ({
    filament_diameter: num(o.filament_diameter),
    nozzle_diameter: num(o.nozzle_diameter),
    filament_type: (o.filament_type || '').trim(),
    filament_detailed_type: (o.filament_detailed_type || '').trim(),
    remaining_grams: num(o.remaining_grams),
    spool_weight: num(o.spool_weight),
    remaining_percent: num(o.remaining_percent),
    print_temp_min: num(o.print_temp_min),
    print_temp_max: num(o.print_temp_max),
    dry_temp: num(o.dry_temp),
    dry_time_hour: num(o.dry_time_hour),
    dry_bed_temp: num(o.dry_bed_temp),
    tag_manufacturer: (o.tag_manufacturer || '').trim(),
    color_code: (o.color_code || '').trim(),
    extra_color_info: (o.extra_color_info || '').trim()
  });
  return JSON.stringify(pick(filament.value)) !== JSON.stringify(pick(original.value));
});

function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function sanitizeStock() {
  if (!filament.value) return;
  filament.value.remaining_grams = Math.max(0, num(filament.value.remaining_grams));
  filament.value.spool_weight  = Math.max(1, num(filament.value.spool_weight) || 1000);
}

function clampPercent() {
  if (!filament.value) return;
  filament.value.remaining_percent = clamp(num(filament.value.remaining_percent), 0, 100);
}

// ENREGISTRER
async function submit() {
  if (!filament.value || submitting.value || !isDirty.value) return;
  sanitizeStock(); clampPercent();
  submitting.value = true;
  const id = Number(route.params.id);
  try {
    const res = await fetch(`http://localhost:5000/api/filaments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filament.value)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    original.value = JSON.parse(JSON.stringify(filament.value));
    window.dispatchEvent(new Event('refresh-filaments'));
    await navigateToList();
  } catch (e) {
    console.error(e);
    toast.value = { open: true, msg: 'Erreur lors de la mise à jour', color: 'danger' };
  } finally {
    submitting.value = false;
  }
}

// ANNULER
async function cancel() {
  if (isDirty.value && !confirm('Annuler vos modifications ?')) return;
  await navigateToList();
}
</script>

<style scoped>
.container { padding: 12px 12px 28px; }

/* HERO */
.hero {
  --background: linear-gradient(135deg, var(--ion-color-step-50), var(--ion-color-step-150));
  border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.12);
}
.hero-content { display: flex; align-items: stretch; gap: 16px; padding: 16px; }
.hero-left { display: flex; gap: 16px; align-items: center; min-width: 0; }
.color-bubble { width: 48px; height: 48px; border-radius: 50%; border: 3px solid rgba(255,255,255,.6); }
.hero-title { font-weight: 700; font-size: 1.05rem; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.badge-type { font-weight: 700; letter-spacing: .2px; }
.detail-type { opacity: .9; }
.hero-sub { margin-top: 2px; opacity: .85; font-family: ui-monospace, Menlo, Consolas, monospace; word-break: break-all; }
.hero-meta { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px; }

/* CARDS */
.card { height: 100%; display: flex; flex-direction: column; border-radius: 14px; }
.card-title { font-weight: 700; font-size: 1.02rem; padding: 8px 12px 0; }
.cards-grid { row-gap: 18px; align-items: stretch; }
.card ion-card-content { flex: 1; display: flex; flex-direction: column; }
ion-card-content { padding-top: 6px; }

/* FORM LAYOUTS */
.grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 14px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px 14px; }
.roomy { margin-top: 6px; }
.k { font-size: .92rem; opacity: .85; margin-bottom: 6px; }
.help { display: block; margin-top: 6px; opacity: .8; font-size: .82rem; }
.progress-wrap { display: flex; flex-direction: column; justify-content: end; gap: 6px; }

/* INPUTS */
.editable {
  --background: var(--ion-color-step-100);
  border: 1px solid var(--ion-color-step-200);
  border-radius: 10px;
  --inner-padding-top: 8px;
  --inner-padding-bottom: 8px;
}
.editable:focus-within { box-shadow: 0 0 0 2px rgba(100,150,255,.22); }

/* WIDTH */
.wide-grid { max-width: 1200px; margin: 0 auto; }

/* Responsive */
@media (max-width: 768px) {
  .hero-content { flex-direction: column; align-items: stretch; }
  .grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 520px) {
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
}
</style>
