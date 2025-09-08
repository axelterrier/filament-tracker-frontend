<template>
  <ion-modal
    :is-open="open"
    @didDismiss="emit('update:open', false)"
    class="modern-help"
    :backdrop-dismiss="true"
  >
    <ion-header translucent>
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

    <!-- Contenu scrollable -->
    <ion-content class="help-content">
      <!-- Zone centrale (centrée verticalement si contenu court) -->
      <div class="stage">
        <!-- Étapes (centrées) -->
        <section v-show="step === 0" class="slide">
          <h2>Pourquoi se connecter en MQTT ?</h2>
          <p>
            Écoute <strong>passive</strong> de l’état de l’imprimante et
            <strong>synchronisation automatique</strong> des infos filaments.
          </p>
          <ul class="list">
            <li>Local, sans cloud requis</li>
            <li>Statut quasi temps réel</li>
            <li>Données filaments cohérentes</li>
          </ul>
        </section>

        <section v-show="step === 1" class="slide">
          <h2>Activer le mode LAN</h2>
          <ol class="list numbered">
            <li>Imprimante → <strong>Réseau</strong>.</li>
            <li>Active <strong>LAN</strong> / <em>LAN Only</em>.</li>
            <li>Active <strong>LAN Access Password</strong> et définis-le.</li>
          </ol>
        </section>

        <section v-show="step === 2" class="slide">
          <h2>Trouver l’adresse IP</h2>
          <ul class="list">
            <li><strong>Imprimante</strong> → Réseau &gt; Détails</li>
            <li><strong>Box/routeur</strong> → Appareils connectés</li>
            <li><strong>Bambu Studio</strong> → Infos de l’appareil</li>
          </ul>
          <p class="muted examples">Exemples : <code>192.168.1.46</code> • <code>192.168.0.23</code></p>
        </section>

        <section v-show="step === 3" class="slide">
          <h2>Serial & LAN code</h2>
          <ul class="list">
            <li><strong>Serial</strong> : étiquette / infos système</li>
            <li><strong>LAN code</strong> : mot de passe LAN défini</li>
          </ul>
          <p class="muted">Ce n’est pas ton mot de passe cloud.</p>
        </section>

        <section v-show="step === 4" class="slide">
          <h2>Ports & TLS</h2>
          <ul class="list">
            <li>Sans TLS : <code>1883</code></li>
            <li>Avec TLS (recommandé) : <code>8883</code></li>
          </ul>
          <p>Remplis IP, Serial, LAN code, choisis TLS, puis
            <em>Enregistrer & (Re)connecter</em>.
          </p>
        </section>
      </div>

      <!-- Footer sticky : boutons + points centrés -->
      <div class="footer">
        <div class="footer-inner">
          <div class="left">
            <ion-button fill="outline" size="small" :disabled="step === 0" @click="prev">
              PRÉCÉDENT
            </ion-button>
          </div>

          <div class="center">
            <div class="dots">
              <span v-for="i in totalSteps" :key="i" class="dot" :class="{ active: step === (i-1) }" />
            </div>
            <div class="step-text">Étape {{ step + 1 }} / {{ totalSteps }}</div>
          </div>

          <div class="right">
            <ion-button v-if="step < totalSteps - 1" size="small" @click="next">SUIVANT</ion-button>
            <ion-button v-else size="small" color="primary" @click="emit('update:open', false)">
              TERMINER
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonItem, IonCheckbox
} from '@ionic/vue'
import { closeOutline, informationCircleOutline } from 'ionicons/icons'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e:'update:open', v:boolean):void; (e:'never-show', v:boolean):void }>()

const step = ref(0)
const totalSteps = 5
const neverShow = ref(localStorage.getItem('mqtt_help_hide') === 'true')

function next(){ if(step.value < totalSteps - 1) step.value++ }
function prev(){ if(step.value > 0) step.value-- }
</script>

<style scoped>
/* Modale compacte, centrée */
.modern-help{
  --width: 680px;
  --max-width: 94vw;
  --height: 70vh;
  --max-height: 85vh;
  --backdrop-opacity: .32;
  --border-radius: 16px;
}
.modern-help::part(content){
  border-radius:16px;
  box-shadow:0 12px 30px rgba(0,0,0,.28);
  display:flex;              /* header + content en colonne */
  flex-direction:column;
}

/* Header */
.toolbar-title{ display:flex; align-items:center; gap:8px; font-weight:700; }

/* Corps */
.help-content{
  --padding-start: 18px;
  --padding-end: 18px;
  --padding-top: 12px;
  --padding-bottom: 0;
  background: var(--ion-background-color);
}

/* Centre la zone principale */
.stage{
  min-height: 48vh;          /* centre verticalement si contenu court */
  display:flex;
  align-items:center;
  justify-content:center;
}

/* Slide centrée */
.slide{
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
}
.slide h2{ font-size:1.14rem; margin:8px 0 10px; font-weight:700; }
.slide p{ margin:0 0 10px; line-height:1.55; }

/* Listes : centrées visuellement mais lisibles (gauche) */
.list{
  margin: 8px auto 8px;
  padding-left: 1.1rem;
  text-align: left;
  max-width: 520px;
}
.numbered{ list-style: decimal; }
.muted{ opacity:.75; }
.examples code{
  padding:1px 6px; border-radius:8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  background: color-mix(in oklab, var(--ion-color-primary) 12%, transparent);
  border: 1px solid rgba(var(--ion-color-primary-rgb), .25);
}

/* Footer sticky en bas du contenu */
.footer{
  position: sticky;
  bottom: 0;
  background: var(--ion-background-color);
  border-top: 1px solid rgba(120,120,120,.16);
  padding: 8px 0 6px;
}

.footer-inner{
  display:grid;
  grid-template-columns: 1fr auto 1fr;   /* gauche | centre | droite */
  align-items: center;
  gap: 8px;
  padding-top: 30px;
  padding-bottom: 30px;
}

/* Dots centrés */
.dots{
  display:flex; gap:10px; justify-content:center; align-items:center;
  margin-bottom: 4px;
}
.dot{
  width:10px; height:10px; border-radius:999px;
  background: var(--ion-color-medium);
  opacity:.35;
}
.dot.active{ background: var(--ion-color-primary); opacity:1; }
.step-text{ font-size:.85rem; opacity:.7; text-align:center; }

/* Boutons */
.left, .right{ display:flex; }
.left  { justify-content:flex-start; }
.right { justify-content:flex-end; }
.no-border{ --inner-border-width:0; --padding-start:8px; }

@media (max-width:520px){
  .modern-help{ --height: 78vh; }
  .footer-inner{
    grid-template-columns: 1fr; gap: 8px;
  }
  .left, .right{ justify-content:center; }
}


</style>
