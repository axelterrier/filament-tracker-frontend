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

    <ion-content fullscreen class="ion-padding simple-bg" :class="{ 'blur-bg': helpOpen }" :inert="helpOpen ? '' : null"
      :aria-hidden="helpOpen ? 'true' : null">
      <ion-grid fixed>
        <ion-row class="gap-row">
          <ion-col size="12" size-md="7">
            <ion-card class="card clean-card">
              <ion-card-header class="card-header-row">
                <div class="title-row">
                  <ion-icon :icon="serverOutline" />
                  <span>{{ t('settings.mqttTitle') || 'Connexion MQTT / Bambu' }}</span>
                </div>

                <div class="header-actions">
                  <ion-chip :color="statusColor" outline>
                    <span class="dot" :class="statusColor"></span>
                    <ion-label>{{ statusLabel }}</ion-label>
                  </ion-chip>

                  <ion-button fill="clear" size="small" class="info-btn" @click="helpOpen = true">
                    <ion-icon :icon="informationCircleOutline" />
                  </ion-button>
                </div>
              </ion-card-header>

              <ion-card-subtitle class="subtitle">
                <span>{{ t('settings.mqttSubtitle') || 'Renseigne IP, serial et code LAN' }}</span>
                <span v-if="lastChecked" class="muted">• Dernière vérif : {{ formatTime(lastChecked) }}</span>
              </ion-card-subtitle>

              <ion-card-content>
                <ion-grid class="inner-grid">
                  <ion-row class="gap-row">
                    <ion-col size="12">
                      <ion-item lines="inset">
                        <ion-label position="stacked">IP (broker)</ion-label>
                        <ion-input placeholder="192.168.1.46" v-model="form.ip" @ionBlur="touched.ip = true"
                          :class="{ invalid: touched.ip && !validIp }" />
                      </ion-item>
                      <p v-if="touched.ip && !validIp" class="field-error">IP invalide</p>
                    </ion-col>

                    <ion-col size="12" size-md="6">
                      <ion-item lines="inset">
                        <ion-label position="stacked">Serial</ion-label>
                        <ion-input placeholder="01P00A..." v-model="form.serial" @ionBlur="touched.serial = true"
                          :class="{ invalid: touched.serial && !validSerial }" />
                      </ion-item>
                      <p v-if="touched.serial && !validSerial" class="field-error">Serial trop court</p>
                    </ion-col>

                    <ion-col size="12" size-md="6">
                      <ion-item lines="inset" class="pw-item">
                        <ion-label position="stacked">LAN code</ion-label>
                        <ion-input :type="showPw ? 'text' : 'password'" placeholder="6960…" v-model="form.password"
                          @ionBlur="touched.password = true" :class="{ invalid: touched.password && !validPassword }" />
                        <ion-button slot="end" fill="clear" size="small" @click="showPw = !showPw">
                          <ion-icon :icon="showPw ? eyeOffOutline : eyeOutline" />
                        </ion-button>
                      </ion-item>
                      <p v-if="touched.password && !validPassword" class="field-error">Code requis</p>
                    </ion-col>

                    <ion-col size="12">
                      <ion-item lines="none">
                        <ion-label>Se connecter automatiquement</ion-label>
                        <ion-toggle slot="end" v-model:checked="autoConnect"></ion-toggle>
                      </ion-item>
                    </ion-col>

                    <ion-col size="12">
                      <div class="adv-content" v-show="advancedOpen">
                        <div class="adv-row">
                          <ion-item lines="none" class="adv-cell">
                            <ion-label>Utiliser TLS</ion-label>
                            <ion-input>
                              <ion-toggle slot="end" v-model:checked="form.useTLS" />
                            </ion-input>
                          </ion-item>

                          <ion-item lines="inset" class="adv-cell">
                            <ion-label position="stacked">Port</ion-label>
                            <ion-input type="number" v-model.number="portValue" />
                            <ion-note slot="helper">
                              Par défaut : {{ form.useTLS ? 8883 : 1883 }}
                            </ion-note>
                          </ion-item>
                        </div>
                      </div>
                    </ion-col>

                    <ion-col size="12">
                      <div class="cta-row">
                        <ion-button class="btn btn-primary" :disabled="!canSubmit || loading" @click="saveAndConnect">
                          <ion-icon slot="start" :icon="saveOutline" />
                          <span v-if="!loading">Enregistrer & (Re)connecter</span>
                          <span v-else>Connexion…</span>
                          <ion-spinner v-if="loading" slot="end" name="dots" />
                        </ion-button>

                        <ion-button class="btn btn-ghost" :disabled="loading" @click="checkNow">
                          <ion-icon slot="start" :icon="flashOutline" />
                          Vérifier maintenant
                        </ion-button>
                      </div>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="5">
            <div class="tile-grid">
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

    <MqttHelpModal :open="helpOpen" @update:open="v => helpOpen = v" @never-show="onNeverShowHelp" />
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted, onUnmounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonToggle,
  IonSelect, IonSelectOption, IonButton, IonIcon, IonChip, IonSpinner, IonNote
} from '@ionic/vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import { useI18n } from 'vue-i18n'
import {
  serverOutline, flashOutline, saveOutline, moonOutline,
  languageOutline, speedometerOutline, informationCircleOutline,
  eyeOutline, eyeOffOutline
} from 'ionicons/icons'
import MqttHelpModal from '@/components/MqttHelpModal.vue'

interface Language { value: string; text: string }
interface Unit { value: string; text: string }

const store = useMainStore()
const { darkMode } = storeToRefs(store)
const { t, locale } = useI18n()

const API_BASE = 'http://localhost:5000'

const form = reactive({
  ip: '',
  serial: '',
  password: '',
  useTLS: true as boolean,
  portTLS: 8883 as number,
  portPlain: 1883 as number,
})
const showPw = ref(false)
const autoConnect = ref<boolean>(localStorage.getItem('mqtt_auto_connect') !== 'false')
const advancedOpen = ref<boolean>(true)

const touched = reactive({ ip: false, serial: false, password: false })
const validIp = computed(() => {
  if (form.ip.trim().toLowerCase() === 'localhost') return true
  const m = form.ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)
  return !!m && form.ip.split('.').every(p => +p >= 0 && +p <= 255)
})
const validSerial = computed(() => form.serial.trim().length >= 6)
const validPassword = computed(() => form.password.trim().length > 0)
const canSubmit = computed(() => validIp.value && validSerial.value && validPassword.value)

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
watch(selectedLanguage, (lang) => { locale.value = lang; localStorage.setItem('locale', lang) })
watch(selectedUnit, (unit) => { localStorage.setItem('unit', unit) })
watch(autoConnect, v => localStorage.setItem('mqtt_auto_connect', String(v)))

type ConnStatus = 'unknown' | 'checking' | 'connected' | 'error'
const status = ref<ConnStatus>('unknown')
const lastChecked = ref<number | null>(null)
const errorMsg = ref('')
const loading = ref(false)
const testResult = ref<Record<string, unknown> | null>(null)

const statusLabel = computed(() => ({
  unknown: 'Inconnu',
  checking: 'Vérification…',
  connected: 'Connecté',
  error: 'Erreur'
}[status.value]))

const statusColor = computed(() => ({
  unknown: 'medium',
  checking: 'warning',
  connected: 'success',
  error: 'danger'
}[status.value]))

const portValue = computed<number>({
  get: () => (form.useTLS ? form.portTLS : form.portPlain),
  set: (val: number) => {
    if (form.useTLS) form.portTLS = Number(val)
    else form.portPlain = Number(val)
  }
})

watch(() => form.useTLS, (v) => {
  if (v && (!form.portTLS && form.portTLS !== 0)) form.portTLS = 8883
  if (!v && (!form.portPlain && form.portPlain !== 0)) form.portPlain = 1883
})

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString()
}

function onToggle(ev: CustomEvent) {
  store.setDarkMode((ev as any).detail?.checked === true)
}

async function apiTest(payload: any) {
  const res = await fetch(`${API_BASE}/api/mqtt/test`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Test échoué')
  return data
}

async function checkNow() {
  if (!canSubmit.value) {
    touched.ip = touched.serial = touched.password = true
    return
  }
  status.value = 'checking'; loading.value = true; errorMsg.value = ''; testResult.value = null
  try {
    const data = await apiTest(form)
    testResult.value = data
    status.value = 'connected'
  } catch (e: any) {
    status.value = 'error'
    errorMsg.value = e?.message || 'Erreur inconnue'
  } finally {
    lastChecked.value = Date.now()
    loading.value = false
  }
}

async function saveAndConnect() {
  if (!canSubmit.value) {
    touched.ip = touched.serial = touched.password = true
    return
  }
  localStorage.setItem('mqtt_config', JSON.stringify(form))
  try {
    await fetch(`${API_BASE}/api/mqtt/config`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    }).catch(() => { })
  } catch { }
  await checkNow()

  const toast = document.createElement('ion-toast')
  toast.message = (status.value === 'connected')
    ? 'Configuration enregistrée et connexion OK ✅'
    : 'Configuration enregistrée. Connexion échouée.'
  toast.duration = 1800
  document.body.appendChild(toast); toast.present()
}

function loadConfigFromLocal() {
  const raw = localStorage.getItem('mqtt_config')
  if (!raw) return false
  try {
    Object.assign(form, JSON.parse(raw))
    return true
  } catch { return false }
}

const helpOpen = ref(false)
function onNeverShowHelp(v: boolean) {
  localStorage.setItem('mqtt_help_hide', String(v))
}

let pollTimer: any = null
onMounted(async () => {
  const hasCfg = loadConfigFromLocal()
  status.value = 'unknown'
  if (hasCfg && autoConnect.value) {
    checkNow()
  }
  pollTimer = setInterval(() => {
    if (autoConnect.value && canSubmit.value) checkNow()
  }, 30000)
})
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>

<style scoped>
.simple-bg {
  background: var(--ion-background-color);
}

.gap-row {
  row-gap: 16px;
}

/* Cards */
.card.clean-card,
.card.tile {
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .06);
  border: 1px solid rgba(120, 120, 120, .15);
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.title-row ion-icon {
  font-size: 20px;
  opacity: .85;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-btn {
  --padding-start: 6px;
  --padding-end: 6px;
}

.subtitle {
  padding: 0 16px 6px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.muted {
  opacity: .7;
}

/* Status chip dot */
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
  background: currentColor;
}

/* Grid interne */
.inner-grid {
  --ion-grid-column-padding: 0;
}

/* Avancé */
.adv-content {
  padding-top: 12px;
  border-top: 1px solid rgba(120, 120, 120, .12);
}

.adv-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: start;
}

.adv-cell {
  --background: transparent;
}

@media (max-width:640px) {
  .adv-row {
    grid-template-columns: 1fr;
  }
}

/* Inputs / erreurs */
ion-item {
  --inner-padding-end: 0;
}

.pw-item :deep(input) {
  letter-spacing: 0.1px;
}

.field-error {
  color: var(--ion-color-danger);
  font-size: .8rem;
  margin: 6px 12px 0;
}

/* Tiles */
.tile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width:768px) {
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

/* Actions */
.cta-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

@media (max-width:520px) {
  .cta-row {
    grid-template-columns: 1fr;
  }
}

.btn {
  --border-radius: 14px;
  --padding-start: 14px;
  --padding-end: 14px;
  font-weight: 600;
  letter-spacing: .2px;
}

.btn ion-icon {
  margin-inline-end: 6px;
}

.btn-primary {
  --color: #fff;
  --background: linear-gradient(180deg, var(--ion-color-primary) 0%, color-mix(in oklab, var(--ion-color-primary) 85%, #000) 100%);
  --background-activated: color-mix(in oklab, var(--ion-color-primary) 80%, #000 20%);
  --box-shadow: 0 6px 14px rgba(0, 0, 0, .18);
}

.btn-primary:disabled {
  opacity: .6;
  --box-shadow: none;
}

.btn-ghost {
  --background: transparent;
  --color: var(--ion-color-primary);
  --border-style: solid;
  --border-width: 1px;
  --border-color: rgba(var(--ion-color-primary-rgb), .35);
  --box-shadow: none;
}

.btn-ghost:hover {
  --background: rgba(var(--ion-color-primary-rgb), .08);
}

/* Renforce le voile + flou derrière la modale */
.blur-bg {
  filter: blur(6px) brightness(.9);
  transform: scale(.995);
  transition: filter .18s ease, transform .18s ease;
  pointer-events: none;
  user-select: none;
}
</style>
