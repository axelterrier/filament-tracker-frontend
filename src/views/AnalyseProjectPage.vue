<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Analyse Projet 3MF</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content v-if="!colors.length">
            <!-- Zone de drop -->
            <div class="dropzone" @dragover.prevent @drop.prevent="handleDrop" @click="triggerFileInput">
                <ion-icon :icon="cloudUploadOutline" size="large"></ion-icon>
                <p>Glissez votre fichier .3mf ici ou cliquez pour parcourir</p>
                <input ref="fileInputRef" type="file" accept=".3mf" @change="uploadFiles" hidden />
            </div>

        </ion-content>
        <div v-if="isUploading">
            <ion-item>
                <ion-label>Analyse en cours...</ion-label>
                <ion-spinner slot="end" />
            </ion-item>
        </div>
        <div v-else-if="!colors.length">
            <ion-item>
                <ion-label>Aucune couleur détectée.</ion-label>
            </ion-item>
        </div>
        <ion-content v-if="matches.length">
            <ion-grid class="analysis-grid">
                <ion-row>
                    <ion-col size="12" size-md="6">
                        <ion-list>
                            <ion-list-header>
                                <ion-label>Filaments requis vs stock</ion-label>
                            </ion-list-header>

                            <!-- En-têtes -->
                            <ion-item lines="none" class="header-row">
                                <div class="col required-col"><strong>Requis</strong></div>
                                <div class="col arrow-col"></div>
                                <div class="col stock-col"><strong>En stock</strong></div>
                                <!-- <div class="col distance-col"><strong>Distance</strong></div> -->
                            </ion-item>

                            <!-- Lignes -->
                            <ion-item v-for="(m, idx) in matches" :key="idx"
                                :class="{ missing: m.status === 'missing' }" lines="full">
                                <div class="col required-col">
                                    <div class="line">
                                        <div class="material-block">
                                            <div class="name">{{ m.required.material }}</div>
                                            <div class="sub" v-if="m.required.color">
                                                <small>{{ normalizeHex(m.required.color) || m.required.color }}</small>
                                            </div>
                                        </div>
                                        <div class="swatch" slot="right" :style="{ backgroundColor: m.required.color }">
                                        </div>
                                    </div>
                                </div>

                                <div class="col arrow-col">
                                    <ion-icon :icon="arrowForwardOutline" />
                                </div>

                                <div class="col stock-col">
                                    <div class="line">
                                        <div class="material-block">
                                            <div class="name">
                                                <div v-if="m.match">
                                                    {{ m.match.filament_detailed_type }}
                                                </div>
                                                <div v-else class="material">Manquant</div>

                                            </div>
                                            <div class="sub" v-if="m.match && m.match.color">
                                                <small>{{ normalizeHex(m.match.color) || m.match.color }}</small>
                                            </div>
                                        </div>
                                        <div class="swatch" :style="m.match
                                            ? { backgroundColor: m.match.color }
                                            : { backgroundColor: 'transparent', border: '1px dashed #999' }"></div>
                                    </div>
                                </div>

                                <!-- Colonne distance (pas sur de l'utiliser dans le produit fini) -->
                                <!-- <div class="col distance-col">
                                    <div v-if="m.match" class="distance">
                                        (dist: {{ Math.round(m.distance) }})
                                    </div>
                                </div> -->
                            </ion-item>
                        </ion-list>
                    </ion-col>

                    <!-- Colonne droite vide / pour détails complémentaires -->
                    <ion-col size="12" size-md="6" class="right-panel">
                        <!-- Tu peux mettre ici un aperçu, résumé, actions, etc. -->
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>



    </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonSpinner,
} from '@ionic/vue'
import { cloudUploadOutline, arrowForwardOutline } from 'ionicons/icons'

// --- états ---
const rawFiles = ref([])
const filaments = ref([])
const isUploading = ref(false)
const colors = ref([])
const materials = ref([])
const errorMsg = ref('')
const stockFilaments = ref([])

// --- config ---
const DEBUG = true
const COLOR_THRESHOLD = 100 // ajustable : plus haut = plus tolérant sur la distance couleur

// --- ref DOM ---
const fileInputRef = ref(null)

// --- helpers couleur et matériau ---
function normalizeHex(h) {
    if (!h || typeof h !== 'string') return null
    let hex = h.trim()
    if (!hex.startsWith('#')) hex = '#' + hex
    if (hex.length === 4) {
        hex = '#' + [...hex.slice(1)].map(c => c + c).join('')
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null
    return hex.toLowerCase()
}

function hexToRgb(normalizedHex) {
    const hex = normalizeHex(normalizedHex)
    if (!hex) return [0, 0, 0]
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ]
}

function colorDistance(c1, c2) {
    const [r1, g1, b1] = hexToRgb(c1)
    const [r2, g2, b2] = hexToRgb(c2)
    return Math.sqrt(
        (r1 - r2) ** 2 +
        (g1 - g2) ** 2 +
        (b1 - b2) ** 2
    )
}

function normalizeMaterial(name) {
    if (!name || typeof name !== 'string') return ''
    return name
        .toLowerCase()
        .replace(/bambu\s*/g, '') // enlever "Bambu" si présent
        .trim()
}

function materialMatches(required, stock) {
    const r = normalizeMaterial(required)
    const s = normalizeMaterial(stock)
    if (!r || !s) return false
    return r === s || r.includes(s) || s.includes(r)
}

// --- chargement du stock ---
const loadStock = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/filaments')
        if (!res.ok) throw new Error(`Échec récupération stock (${res.status})`)
        const json = await res.json()
        stockFilaments.value = Array.isArray(json) ? json : []
        if (DEBUG) {
            console.log('Stock filaments loaded:', stockFilaments.value)
        }
    } catch (e) {
        console.error('Erreur stock filaments', e)
        errorMsg.value = 'Impossible de charger le stock de filaments'
    }
}

onMounted(() => {
    loadStock()
})

// --- interaction fichier ---
const triggerFileInput = () => {
    if (DEBUG) console.log('fileInputRef.value =', fileInputRef.value)
    if (fileInputRef.value) {
        fileInputRef.value.click()
    } else {
        alert("Impossible d'accéder à l'input fichier (ref est null).")
    }
}

const handleDrop = (e) => {
    const dt = e.dataTransfer
    if (dt && dt.files && dt.files.length > 0) {
        rawFiles.value = [dt.files[0]]
        uploadFiles()
    }
}

// --- upload / parsing 3MF ---
const uploadFiles = async (event) => {
    if (event?.target?.files && event.target.files.length > 0) {
        rawFiles.value = [event.target.files[0]]
    }

    if (!rawFiles.value.length) {
        alert("Aucun fichier sélectionné.")
        return
    }

    const file = rawFiles.value[0]
    if (!file.name.toLowerCase().endsWith('.3mf')) {
        alert("Veuillez fournir un fichier .3mf.")
        return
    }

    const formData = new FormData()
    formData.append('file', file)

    isUploading.value = true
    errorMsg.value = ''

    try {
        const res = await fetch('http://localhost:5000/api/3mf/analyze', {
            method: 'POST',
            body: formData,
        })

        const text = await res.text()
        let result = {}
        try {
            result = JSON.parse(text)
        } catch {
            throw new Error(`Réponse non JSON :\n${text}`)
        }

        if (res.ok) {
            colors.value = Array.isArray(result.colors) ? result.colors : []
            materials.value = Array.isArray(result.materials) ? result.materials : []
            filaments.value = []
            rawFiles.value = []
            errorMsg.value = ''
            if (DEBUG) {
                console.log('Analyse 3MF:', { materials: materials.value, colors: colors.value })
            }
        } else {
            errorMsg.value = result.error || 'Échec de l’import'
        }
    } catch (err) {
        console.error('Upload error', err)
        alert(`Erreur réseau : ${err.message}`)
        errorMsg.value = 'Erreur réseau pendant l’analyse'
    } finally {
        isUploading.value = false
    }
}

// --- matching requis vs stock ---
const matches = computed(() => {
    const out = []
    if (DEBUG) {
        console.log('=== Matching debug ===')
        console.log(
            'Requis:',
            materials.value.map((m, i) => ({ material: m, color: colors.value[i] }))
        )
        console.log('Stock:', stockFilaments.value)
    }

    for (let i = 0; i < materials.value.length; i++) {
        const requiredMat = materials.value[i]
        const requiredColorRaw = colors.value[i]
        const requiredColor = normalizeHex(requiredColorRaw)

        if (!requiredMat) continue

        const candidates = stockFilaments.value.filter(
            (f) =>
                f.filament_detailed_type && materialMatches(requiredMat, f.filament_detailed_type)
        )

        let best = null
        let bestDist = Infinity

        for (const cand of candidates) {
            const stockColorNorm = normalizeHex(cand.color_code)
            if (!stockColorNorm || !requiredColor) continue
            const dist = colorDistance(requiredColor, stockColorNorm)
            if (DEBUG) {
                console.log(
                    `Compare required ${requiredMat}/${requiredColor} to stock ${cand.filament_detailed_type}/${stockColorNorm}: dist=${dist.toFixed(
                        1
                    )}`
                )
            }
            if (dist < bestDist) {
                bestDist = dist
                best = { ...cand, color: stockColorNorm }
            }
        }

        const hasGoodMatch = best && bestDist <= COLOR_THRESHOLD
        if (!hasGoodMatch && DEBUG) {
            console.warn(
                `No good match for ${requiredMat} ${requiredColorRaw} (best dist ${bestDist === Infinity ? '∞' : bestDist.toFixed(1)
                }, threshold ${COLOR_THRESHOLD})`
            )
        }

        out.push({
            required: {
                material: requiredMat,
                color: requiredColor || requiredColorRaw,
            },
            match: hasGoodMatch ? best : null,
            distance: bestDist,
            status: hasGoodMatch ? 'matched' : 'missing',
        })
    }

    return out
})
</script>



<style>
.dropzone {
    border: 2px dashed var(--ion-color-medium);
    padding: 2rem;
    text-align: center;
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 2rem;
    transition: border-color 0.2s ease;
}

.dropzone:hover {
    border-color: var(--ion-color-primary);
}

.tiny-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-left: auto;
    border: 1px solid #999;
    flex-shrink: 0;
}

.header-row {
  --background: transparent;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}


.col {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.required-col {
  flex: 2;
}

.arrow-col {
  flex: 0 0 40px;
  justify-content: center;
}

.stock-col {
  flex: 2;
}

.distance-col {
  flex: 0 0 80px;
  justify-content: flex-end;
  font-size: 0.75rem;
  opacity: 0.85;
  white-space: nowrap;
}

.line {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.material {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.swatch {
  margin-left: auto; /* pousse la pastille à l’extrémité droite */
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ccc;
  flex-shrink: 0;
}

ion-item.missing {
  background: rgba(255, 255, 255, 0.08);
  opacity: 0.6;
}

.material-block {
  display: flex;
  flex-direction: column;
}

.name {
  line-height: 1.1;
}

.sub {
  margin-top: 2px;
  font-size: 1rem;
  color: var(--ion-color-medium);
}
</style>