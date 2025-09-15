<!-- MqttHelpModal.vue -->
<template>
  <ion-modal
    :is-open="open"
    ref="modalEl"
    class="mqtt-help"
    :backdrop-dismiss="true"
    @didDismiss="emit('update:open', false)"
  >
    <ion-header translucent ref="headerEl">
      <ion-toolbar>
        <ion-title class="toolbar-title">
          <ion-icon :icon="informationCircleOutline" />
          <span>Aide connexion MQTT</span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" aria-label="Fermer" @click="emit('update:open', false)">
            <ion-icon :icon="closeOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="help-content" @keydown.stop="onKey">
      <div class="container" ref="containerEl">
        <!-- Stepper -->
        <div class="stepper" ref="stepperEl">
          <div class="stepper-top">
            <div class="steps">
              <button
                v-for="i in totalSteps"
                :key="i"
                class="step"
                :class="{ active: step === (i-1) }"
                @click="step = i-1"
                :aria-current="step === (i-1) ? 'step' : undefined"
                :aria-label="`Étape ${i} sur ${totalSteps}`"
              />
            </div>
            <div class="stepper-text">Étape {{ step + 1 }} / {{ totalSteps }}</div>
          </div>
          <div class="progress">
            <div class="bar" :style="{ width: ((step+1)/totalSteps*100)+'%' }" />
          </div>
        </div>

        <!-- Slides -->
        <section v-show="step === 0" class="slide" :ref="el => slides[0] = el">
          <p class="eyebrow">Introduction</p>
          <h2>Pourquoi se connecter en MQTT&nbsp;?</h2>
          <p class="lead">
            Écoute <strong>passive</strong> de l’état de l’imprimante et
            <strong>synchronisation automatique</strong> des infos filaments.
          </p>
          <ul class="bullets">
            <li>Local, sans cloud requis</li>
            <li>Statut quasi temps réel</li>
            <li>Données filaments cohérentes</li>
            <li>Mode <strong>LAN only</strong> désactivable ensuite</li>
          </ul>
        </section>

        <section v-show="step === 1" class="slide" :ref="el => slides[1] = el">
          <p class="eyebrow">Pré-requis</p>
          <h2>Activer le mode LAN</h2>
          <ol class="numbers">
            <li>Sur l’imprimante → <strong>Réseau Wi-Fi</strong></li>
            <li>Active <strong>LAN</strong> / <em>LAN Only</em></li>
          </ol>
        </section>

        <section v-show="step === 2" class="slide" :ref="el => slides[2] = el">
          <p class="eyebrow">Infos à récupérer</p>
          <h2>Note les informations utiles</h2>
          <p class="muted">Disponibles directement sur l’imprimante :</p>
          <ul class="bullets">
            <li><strong>Adresse IP</strong> — onglet Wi-Fi</li>
            <li><strong>Code LAN</strong> — onglet Wi-Fi</li>
            <li><strong>Numéro de série</strong> — onglet Imprimante</li>
          </ul>
        </section>

        <section v-show="step === 3" class="slide" :ref="el => slides[3] = el">
          <p class="eyebrow">Connexion</p>
          <h2>Ports &amp; TLS</h2>
          <ul class="bullets">
            <li>Sans TLS&nbsp;: <code>1883</code></li>
            <li>Avec TLS (recommandé)&nbsp;: <code>8883</code></li>
          </ul>
          <p class="hint">
            Renseigne IP, Serial, LAN code, choisis TLS, puis
            <em>Enregistrer &amp; (Re)connecter</em>.
          </p>
        </section>

        <section v-show="step === 4" class="slide" :ref="el => slides[4] = el">
          <p class="eyebrow">Comportement</p>
          <h2>Mode de connexion</h2>
          <ul class="bullets">
            <li><strong>Stockage</strong> : infos conservées en local uniquement</li>
            <li><strong>Auto-connexion</strong> : au démarrage, tentative avec les dernières infos</li>
          </ul>
        </section>

        <!-- Footer -->
        <div class="footer" ref="footerEl">
          <div class="left">
            <ion-button fill="outline" size="small" :disabled="step === 0" @click="prev">
              Précédent
            </ion-button>
          </div>
          <div class="right">
            <ion-button v-if="step < totalSteps - 1" size="small" @click="next">Suivant</ion-button>
            <ion-button v-else size="small" color="primary" @click="emit('update:open', false)">
              Terminer
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent
} from '@ionic/vue'
import { closeOutline, informationCircleOutline } from 'ionicons/icons'

const props = defineProps<{ open: boolean }>()
const emit  = defineEmits<{ (e:'update:open', v:boolean):void }>()

const step = ref(0)
const totalSteps = 5

const modalEl     = ref<HTMLIonModalElement|null>(null)
const headerEl    = ref<HTMLElement|null>(null)
const containerEl = ref<HTMLElement|null>(null)

const stepperEl = ref<HTMLElement|null>(null)
const footerEl  = ref<HTMLElement|null>(null)
const slides    = ref<Array<HTMLElement|null>>([null,null,null,null,null])

function next(){ if(step.value < totalSteps - 1) step.value++ }
function prev(){ if(step.value > 0) step.value-- }

// Navigation clavier
function onKey(e: KeyboardEvent){
  if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

/** Applique la hauteur calculée à la modale (via la CSS var --height) */
function applyHeight(px:number){
  const min = 320
  const max = Math.floor(window.innerHeight * 0.9)
  const target = Math.min(max, Math.max(min, px))
  modalEl.value?.style.setProperty('--height', `${target}px`)
}

/** Mesure précise : neutralise le 1fr le temps de la mesure */
async function resizeToSlide(){
  await nextTick()

  containerEl.value?.classList.add('measuring')
  await nextTick()

  const header  = headerEl.value?.offsetHeight ?? 0
  const stepper = stepperEl.value?.offsetHeight ?? 0
  const slide   = slides.value[step.value]?.scrollHeight ?? 0
  const footer  = footerEl.value?.offsetHeight ?? 0
  const padding = 12

  applyHeight(header + stepper + slide + footer + padding)

  containerEl.value?.classList.remove('measuring')
}

watch(step, resizeToSlide)
watch(() => props.open, v => {
  if (v) {
    step.value = 0
    // attendre l’animation d’ouverture pour une mesure fiable
    requestAnimationFrame(() => resizeToSlide())
  }
})

function onResize(){ resizeToSlide() }

onMounted(() => {
  document.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
  if (props.open) resizeToSlide()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
/* ===== MODALE ===== */
.mqtt-help{
  --width: 560px;
  --max-width: 94vw;
  --height: 480px;                /* fallback si JS KO */
  --backdrop-opacity: .32;
  --border-radius: 16px;
}
.mqtt-help::part(content){
  height: var(--height);          /* << applique la hauteur calculée */
  max-height: 90vh;
  border-radius:16px;
  box-shadow:0 12px 30px rgba(0,0,0,.28);
  display:flex;
  flex-direction:column;
  transition: height .18s ease;
}

/* Header */
.toolbar-title{ display:flex; align-items:center; gap:8px; font-weight:700; }

/* ===== CONTENT WRAPPER ===== */
.help-content{
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  background: var(--ion-background-color);
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;               /* évite scroll parasite qui fausse la mesure */
}
.container{
  flex: 1 1 auto;
  min-height: 0;
  padding: 12px 18px 10px;
  display: grid;
  grid-template-rows: auto 1fr auto; /* stepper | slide | footer */
  gap: 12px;
}
/* Pendant la mesure on neutralise le 1fr pour obtenir la hauteur intrinsèque */
.container.measuring{ grid-template-rows: auto auto auto; }
.container.measuring .slide{ overflow: visible; }

/* ===== STEPPER ===== */
.stepper{ display:flex; flex-direction:column; gap:8px; }
.stepper-top{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
.steps{ display:flex; gap:10px; }
.step{
  width:10px; height:10px; border-radius:999px;
  background: var(--ion-color-medium); opacity:.35; border:none; cursor:pointer;
}
.step.active{ opacity:1; background: var(--ion-color-primary); }
.stepper-text{ font-size:.82rem; opacity:.7; }
.progress{ width:100%; height:4px; background: rgba(120,120,120,.18); border-radius:999px; overflow:hidden; }
.progress .bar{ height:100%; background: var(--ion-color-primary); }

/* ===== SLIDES ===== */
.slide{
  max-width: 56ch;
  margin: 0 auto 4px 0;
  text-align: left;
  line-height: 1.55;
  overflow: auto; /* si une slide est longue */
}
.eyebrow{
  font-size:.78rem; letter-spacing:.02em; text-transform:uppercase;
  opacity:.65; margin: 4px 0 6px;
}
.slide h2{ font-size:1.2rem; margin: 0 0 8px; font-weight:800; }
.lead{ margin: 0 0 10px; }
.hint{ margin-top: 6px; opacity:.9; }
.muted{ opacity:.75; }
.bullets, .numbers{ margin: 8px 0 4px; padding-left: 1.1rem; }
.bullets li{ margin: 4px 0; }
.numbers{ list-style: decimal; }
code{
  padding: 0 6px; border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  background: color-mix(in oklab, var(--ion-color-primary) 12%, transparent);
  border: 1px solid rgba(var(--ion-color-primary-rgb), .25);
}

/* ===== FOOTER ===== */
.footer{
  display:grid;
  grid-template-columns: 1fr 1fr;
  align-items:center;
  gap:12px;
  padding: 6px 0 8px;
  border-top: 1px solid rgba(120,120,120,.16);
}
.left, .right{ display:flex; align-items:center; }
.left { justify-content:flex-start; }
.right{ justify-content:flex-end; }

/* XS */
@media (max-width:520px){
  .mqtt-help{ --width: 94vw; }
  .container{ padding: 10px 12px; }
  .footer{ grid-template-columns: 1fr; gap:8px; }
  .left, .right{ justify-content:center; }
}
</style>
