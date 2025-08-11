<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ t('settings.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="ion-padding simple-bg">
      <ion-grid fixed>
        <ion-row class="gap-row">
          <!-- ===== Colonne gauche : Carte Connexion ===== -->
          <ion-col size="12" size-md="7">
            <ion-card class="card clean-card">
              <ion-card-header>
                <ion-card-title class="title-row">
                  <ion-icon :icon="serverOutline" />
                  <span>{{ t('settings.mqttTitle') || 'Connexion MQTT / Bambu' }}</span>
                </ion-card-title>
                <ion-card-subtitle>
                  {{ t('settings.mqttSubtitle') || 'Renseigne IP, serial et code LAN' }}
                </ion-card-subtitle>
              </ion-card-header>

              <ion-card-content>
                <ion-grid class="inner-grid">
                  <ion-row class="gap-row">
                    <ion-col size="12">
                      <ion-item lines="inset">
                        <ion-label position="stacked">IP (broker)</ion-label>
                        <ion-input placeholder="192.168.1.46" v-model="form.ip" @ionBlur="touched.ip = true"
                          :class="{ invalid: touched.ip && !validIp }" />
                      </ion-item>
                    </ion-col>

                    <ion-col size="12" size-md="6">
                      <ion-item lines="inset">
                        <ion-label position="stacked">Serial</ion-label>
                        <ion-input placeholder="01P00A..." v-model="form.serial" @ionBlur="touched.serial = true"
                          :class="{ invalid: touched.serial && !validSerial }" />
                      </ion-item>
                    </ion-col>

                    <ion-col size="12" size-md="6">
                      <ion-item lines="inset">
                        <ion-label position="stacked">LAN code</ion-label>
                        <ion-input placeholder="6960..." type="password" v-model="form.password" @ionBlur="touched.password = true"
                          :class="{ invalid: touched.password && !validPassword }" />
                      </ion-item>
                    </ion-col>

                    <ion-col size="12" size-md="6">
                      <ion-item lines="none">
                        <ion-label>Utiliser TLS</ion-label>
                        <ion-toggle slot="end" v-model:checked="form.useTLS" />
                      </ion-item>
                    </ion-col>

                    <ion-col size="12" size-md="6" v-if="form.useTLS">
                      <ion-item lines="inset">
                        <ion-label position="stacked">Port TLS</ion-label>
                        <ion-input type="number" v-model.number="form.portTLS" />
                      </ion-item>
                    </ion-col>
                    <ion-col size="12" size-md="6" v-else>
                      <ion-item lines="inset">
                        <ion-label position="stacked">Port (sans TLS)</ion-label>
                        <ion-input type="number" v-model.number="form.portPlain" />
                      </ion-item>
                    </ion-col>

                    <ion-col size="12">
                      <div class="inline-actions">
                        <ion-button @click="testConnection">
                          <ion-icon slot="start" :icon="flashOutline" />
                          {{ t('settings.testButton') || 'Tester la connexion' }}
                        </ion-button>

                        <ion-button color="primary" @click="saveConfig">
                          <ion-icon slot="start" :icon="saveOutline" />
                          {{ t('settings.save') || 'Enregistrer' }}
                        </ion-button>

                        <ion-badge v-if="testResult" color="success">OK</ion-badge>
                        <ion-badge v-else-if="errorMsg" color="danger">Erreur</ion-badge>
                      </div>

                      <ion-text color="success" v-if="testResult">
                        <p class="hint">{{ (testResult as any).details }}</p>
                      </ion-text>
                      <ion-text color="danger" v-if="errorMsg">
                        <p class="hint">{{ errorMsg }}</p>
                      </ion-text>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- ===== Colonne droite : Grid de mini-cartes Préférences ===== -->
          <ion-col size="12" size-md="5">
            <div class="tile-grid">
              <!-- Thème -->
              <ion-card class="card tile">
                <ion-card-header>
                  <ion-card-title class="tile-title">
                    <ion-icon :icon="moonOutline" />
                    <span>{{ t('settings.theme') }}</span>
                  </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div class="tile-control">
                    <ion-label>Thème sombre</ion-label>
                    <ion-toggle :checked="darkMode" @ionChange="onToggle" />
                  </div>
                </ion-card-content>
              </ion-card>

              <!-- Langue -->
              <ion-card class="card tile">
                <ion-card-header>
                  <ion-card-title class="tile-title">
                    <ion-icon :icon="languageOutline" />
                    <span>{{ t('settings.language') }}</span>
                  </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-select interface="popover" v-model="selectedLanguage" ok-text="OK"
                    :cancel-text="t('settings.cancel')">
                    <ion-select-option v-for="lang in languages" :key="lang.value" :value="lang.value">
                      {{ lang.text }}
                    </ion-select-option>
                  </ion-select>
                </ion-card-content>
              </ion-card>

              <!-- Unités -->
              <ion-card class="card tile">
                <ion-card-header>
                  <ion-card-title class="tile-title">
                    <ion-icon :icon="speedometerOutline" />
                    <span>{{ t('settings.units') }}</span>
                  </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-select interface="popover" v-model="selectedUnit" ok-text="OK"
                    :cancel-text="t('settings.cancel')">
                    <ion-select-option v-for="unit in units" :key="unit.value" :value="unit.value">
                      {{ unit.text }}
                    </ion-select-option>
                  </ion-select>
                </ion-card-content>
              </ion-card>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonToggle,
  IonSelect, IonSelectOption, IonButton, IonIcon, IonBadge, IonText
} from '@ionic/vue'
import { storeToRefs } from 'pinia';
import { useMainStore } from "@/store";
import { useI18n } from 'vue-i18n'
import {
  serverOutline, flashOutline, saveOutline, moonOutline,
  languageOutline, speedometerOutline
} from 'ionicons/icons'

interface Language { value: string; text: string }
interface Unit { value: string; text: string }

const store = useMainStore();
const { darkMode } = storeToRefs(store);

const API_BASE = 'http://localhost:5000'

const form = reactive({
  ip: '',
  serial: '',
  password: '',
  useTLS: true as boolean,
  portTLS: 8883 as number,
  portPlain: 1883 as number,
})
const touched = reactive({ ip: false, serial: false, password: false })
const loading = ref(false)
const testResult = ref<Record<string, unknown> | null>(null)
const errorMsg = ref('')

const { t, locale } = useI18n()
const selectedLanguage = ref<string>(localStorage.getItem('locale') || locale.value)
const languages: Language[] = [
  { value: 'fr', text: t('settings.languages.fr') },
  { value: 'en', text: t('settings.languages.en') },
]
const selectedUnit = ref<string>(localStorage.getItem('unit') || 'metric')
const units: Unit[] = [
  { value: 'metric', text: t('settings.metric') },
  { value: 'imperial', text: t('settings.imperial') },
]

const validIp = computed(() => {
  if (form.ip.trim().toLowerCase() === 'localhost') return true
  const m = form.ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)
  return !!m && form.ip.split('.').every(p => +p >= 0 && +p <= 255)
})
const validSerial = computed(() => form.serial.trim().length >= 6)
const validPassword = computed(() => form.password.trim().length > 0)

const canSave = computed(() => validIp.value && validSerial.value && validPassword.value)
const canTest = canSave

function onToggle(ev: CustomEvent) {
  store.setDarkMode((ev as any).detail?.checked === true);
}

watch(selectedLanguage, (lang) => { locale.value = lang; localStorage.setItem('locale', lang) })
watch(selectedUnit, (unit) => { localStorage.setItem('unit', unit) })

async function testConnection() {
  loading.value = true; errorMsg.value = ''; testResult.value = null
  try {
    const res = await fetch(`${API_BASE}/api/mqtt/test`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Test échoué')
    testResult.value = data
  } catch (e: any) {
    errorMsg.value = e?.message || 'Erreur inconnue'
  } finally { loading.value = false }
}

async function saveConfig() {
  loading.value = true; errorMsg.value = ''
  try {
    const res = await fetch(`${API_BASE}/api/mqtt/config`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Sauvegarde échouée')
    localStorage.setItem('mqtt_config', JSON.stringify(form))
    const toast = document.createElement('ion-toast')
    toast.message = 'Configuration enregistrée ✅'
    toast.duration = 1600
    document.body.appendChild(toast)
    toast.present()
  } catch (e: any) {
    errorMsg.value = e?.message || 'Erreur inconnue'
  } finally { loading.value = false }
}
</script>

<style scoped>
/* === Layout === */
.simple-bg {
  background: var(--ion-background-color);
}

.gap-row {
  row-gap: 16px;
}

/* === Cards === */
.card.clean-card,
.card.tile {
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(120, 120, 120, 0.15);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-row ion-icon {
  font-size: 20px;
  opacity: .85;
}

/* grid interne de la carte connexion */
.inner-grid {
  --ion-grid-column-padding: 0;
}

/* mini-cartes en grid */
.tile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .tile-grid {
    grid-template-columns: 1fr;
  }
}

.tile-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
}

.tile-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* === Items & Inputs === */
ion-item {
  --inner-padding-end: 0;
}

/* === Inline actions & footer === */
.inline-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.hint {
  margin-top: 6px;
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 12px;
  border-top: 1px solid rgba(120, 120, 120, 0.15);
  background: color-mix(in oklab, var(--ion-background-color) 85%, transparent);
  backdrop-filter: blur(2px);
}
</style>
