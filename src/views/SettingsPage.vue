<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ t('settings.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Bloc configuration MQTT -->
      <ion-list>
        <ion-item>
          <ion-label position="stacked">IP (broker)</ion-label>
          <ion-input
            type="text"
            inputmode="decimal"
            placeholder="192.168.1.46"
            v-model:modelValue="form.ip"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Serial</ion-label>
          <ion-input
            type="text"
            placeholder="01P00A..."
            v-model:modelValue="form.serial"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">LAN code</ion-label>
          <ion-input
            type="password"
            v-model:modelValue="form.password"
          />
        </ion-item>

        <ion-item>
          <ion-label>Utiliser TLS</ion-label>
          <ion-toggle v-model:checked="form.useTLS" />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Port TLS</ion-label>
          <ion-input
            type="number"
            inputmode="numeric"
            v-model:modelValue="form.portTLS"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Port (sans TLS)</ion-label>
          <ion-input
            type="number"
            inputmode="numeric"
            v-model:modelValue="form.portPlain"
          />
        </ion-item>

        <ion-button expand="block" :disabled="loading" @click="testConnection">
          Tester la connexion
        </ion-button>
        <ion-button expand="block" color="primary" :disabled="loading" @click="saveConfig">
          Enregistrer
        </ion-button>

        <ion-text color="success" v-if="testResult">
          <p class="ion-padding-top">Test OK : {{ (testResult as any).details }}</p>
        </ion-text>
        <ion-text color="danger" v-if="errorMsg">
          <p class="ion-padding-top">{{ errorMsg }}</p>
        </ion-text>
      </ion-list>

      <!-- Préférences UI -->
      <ion-list>
        <ion-item class="form-item">
          <ion-label>{{ t('settings.theme') }}</ion-label>
          <ion-toggle slot="end" v-model:checked="dark" />
        </ion-item>

        <ion-item class="form-item">
          <ion-label>{{ t('settings.language') }}</ion-label>
          <ion-select slot="end" v-model="selectedLanguage" ok-text="OK" :cancel-text="t('settings.cancel')">
            <ion-select-option v-for="lang in languages" :key="lang.value" :value="lang.value">
              {{ lang.text }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item class="form-item">
          <ion-label>{{ t('settings.units') }}</ion-label>
          <ion-select slot="end" v-model="selectedUnit" ok-text="OK" :cancel-text="t('settings.cancel')">
            <ion-select-option v-for="unit in units" :key="unit.value" :value="unit.value">
              {{ unit.text }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonText,
} from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { setDarkTheme } from '@/main'

interface Language { value: string; text: string }
interface Unit { value: string; text: string }

const API_BASE = 'http://localhost:5000'

// ---- État réactif ----
const dark = ref(localStorage.getItem('dark') === 'true')

const form = reactive({
  ip: '',
  serial: '',
  password: '',
  useTLS: true as boolean,
  portTLS: 8883 as number,
  portPlain: 1883 as number,
})

const loading = ref(false)
const testResult = ref<Record<string, unknown> | null>(null)
const errorMsg = ref('')

// ---- i18n ----
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

// ---- Watchers ----
watch(dark, (isDark) => setDarkTheme(isDark))
watch(selectedLanguage, (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
})
watch(selectedUnit, (unit) => {
  localStorage.setItem('unit', unit)
})

// ---- Actions réseau ----
async function testConnection() {
  loading.value = true
  errorMsg.value = ''
  testResult.value = null
  try {
    const res = await fetch(`${API_BASE}/api/mqtt/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) throw new Error((data && data.error) || 'Test échoué')
    testResult.value = data
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function saveConfig() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch(`${API_BASE}/api/mqtt/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) throw new Error((data && data.error) || 'Sauvegarde échouée')
    localStorage.setItem('mqtt_config', JSON.stringify(form))
    alert('Configuration enregistrée et client MQTT démarré ✅')
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-item {
  margin-bottom: 1.5rem;
}
</style>
