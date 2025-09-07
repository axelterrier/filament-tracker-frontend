<template>
    <ion-grid>
        <ion-row>
            <ion-col size-md="12" size-sm="12">
                <ion-card>
                    <ion-card-content>
                        <!-- Barre de recherche -->
                        <ion-row class="header-controls">
                            <ion-col size="12">
                                <ion-searchbar v-model="filterText" :debounce="300"
                                    placeholder="Rechercher (type, matériau, couleur...)" show-clear-button="focus" />
                            </ion-col>
                        </ion-row>

                        <!-- Barre d’actions groupées -->
                        <ion-row v-if="selectedCount >= 2"
                            class="bulk-bar ion-align-items-center ion-justify-content-between">
                            <ion-col size="12" class="bulk-bar-inner">
                                <span><strong>{{ selectedCount }}</strong> sélectionnés</span>
                                <div class="bulk-actions">
                                    <ion-button size="small" @click="bulkEdit">Multi-éditer</ion-button>
                                    <ion-button size="small" color="danger" @click="bulkDelete">Supprimer</ion-button>
                                    <ion-button size="small" fill="outline" @click="bulkExport">Exporter
                                        CSV</ion-button>
                                    <ion-button size="small" fill="clear" @click="bulkOther">Autre…</ion-button>
                                </div>
                            </ion-col>
                        </ion-row>

                        <!-- WRAPPER SCROLLABLE -->
                        <div class="table-scroll">
                            <ion-grid class="filament-table">
                                <!-- En-tête -->
                                <ion-row class="header-row">
                                    <ion-col class="col-check">
                                        <ion-checkbox :checked="isAllSelectedOnPage"
                                            :indeterminate="isIndeterminateOnPage" @ionChange="toggleSelectAllOnPage" />
                                    </ion-col>

                                    <ion-col size="2" @click="toggleSort('filament_detailed_type')" class="sortable">
                                        Filament
                                        <ion-icon :icon="sortIcon('filament_detailed_type')" />
                                    </ion-col>

                                    <ion-col size="1" @click="toggleSort('filament_type')" class="sortable">
                                        Matériau
                                        <ion-icon :icon="sortIcon('filament_type')" />
                                    </ion-col>

                                    <ion-col size="2" @click="toggleSort('filament_diameter')" class="sortable">
                                        Couleur
                                        <ion-icon :icon="sortIcon('filament_diameter')" />
                                    </ion-col>

                                    <ion-col size="1" @click="toggleSort('color_code')" class="sortable">
                                        Couleur (Hexa)
                                        <ion-icon :icon="sortIcon('color_code')" />
                                    </ion-col>

                                    <ion-col size="1" @click="toggleSort('remaining_or_spool')" class="sortable">
                                        Poids restant
                                        <ion-icon :icon="sortIcon('remaining_or_spool')" />
                                    </ion-col>

                                    <ion-col size="1" @click="toggleSort('print_temp_min')" class="sortable">
                                        Température
                                        <ion-icon :icon="sortIcon('print_temp_min')" />
                                    </ion-col>

                                    <ion-col size="2" @click="toggleSort('location')" class="sortable">
                                        Localisation
                                        <ion-icon :icon="sortIcon('location')" />
                                    </ion-col>

                                    <ion-col size="1" class="actions-col">Actions</ion-col>
                                </ion-row>

                                <!-- Lignes -->
                                <ion-row v-for="filament in processedFilaments" :key="filament.id" class="data-row">
                                    <ion-col class="col-check">
                                        <ion-checkbox :checked="isSelected(filament.id)"
                                            @ionChange="toggleSelect(filament.id)" />
                                    </ion-col>

                                    <ion-col size="2">
                                        <div class="color-dot" :style="{ backgroundColor: filament.color_code }"></div>
                                        {{ filament.filament_detailed_type || filament.filament_type }}
                                    </ion-col>

                                    <!-- FIX: size 1 (comme header) -->
                                    <ion-col size="1">{{ filament.filament_type }}</ion-col>

                                    <ion-col size="2">{{ filament.color_name || '-' }}</ion-col>

                                    <ion-col size="1"><span class="mono">{{ filament.color_code }}</span></ion-col>

                                    <ion-col size="1">{{ realWeight(filament) }} g</ion-col>

                                    <ion-col size="1">
                                        {{ filament.print_temp_min }}–{{ filament.print_temp_max }} °C
                                    </ion-col>

                                    <ion-col size="2">{{ filament.location || '-' }}</ion-col>

                                    <ion-col size="1" class="actions-col">
                                        <ion-buttons>
                                            <ion-button fill="clear" @click="viewDetails(filament)">
                                                <ion-icon :icon="eyeOutline" />
                                            </ion-button>
                                            <ion-button fill="clear" @click="editFilament(filament)">
                                                <ion-icon :icon="createOutline" />
                                            </ion-button>
                                            <ion-button color="danger" fill="clear" @click="confirmDelete(filament)">
                                                <ion-icon :icon="trashOutline" />
                                            </ion-button>
                                        </ion-buttons>
                                    </ion-col>
                                </ion-row>
                            </ion-grid>
                        </div>
                    </ion-card-content>
                </ion-card>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
Chart.register(ArcElement, Tooltip, Legend)

import {
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonButtons, IonIcon, IonSearchbar, IonCheckbox, alertController
} from '@ionic/vue'

import { eyeOutline, createOutline, trashOutline, chevronUpOutline, chevronDownOutline } from 'ionicons/icons'

const filaments = ref([])
const filterText = ref('')
const sortKey = ref('')
const sortAsc = ref(true)
const openActionId = ref(null)
const router = useRouter()
const selected = ref(new Set())

async function fetchFilaments() {
    try {
        const res = await fetch('http://localhost:5000/api/filaments')
        filaments.value = await res.json()
    } catch (err) {
        console.error('Erreur chargement filaments :', err)
    }
}

onMounted(() => {
    fetchFilaments()
    window.addEventListener('refresh-filaments', fetchFilaments)
})
onBeforeUnmount(() => {
    window.removeEventListener('refresh-filaments', fetchFilaments)
})

const toNumber = (v) => {
    const n = typeof v === 'string' ? parseFloat(v) : Number(v)
    return Number.isFinite(n) ? n : 0
}
const realWeight = (f) => (f.remaining_weight ?? f.remaining_weight === 0)
    ? toNumber(f.remaining_weight)
    : toNumber(f.spool_weight)

const processedFilaments = computed(() => {
    const term = filterText.value.toLowerCase().trim()
    let list = filaments.value
        .map(f => ({ ...f, remaining_or_spool: realWeight(f) }))
        .filter(f =>
            !term ||
            (f.filament_type && f.filament_type.toLowerCase().includes(term)) ||
            (f.filament_detailed_type && f.filament_detailed_type.toLowerCase().includes(term)) ||
            (f.extra_color_info && f.extra_color_info.toLowerCase().includes(term))
        )

    if (sortKey.value) {
        const key = sortKey.value
        list = list.slice().sort((a, b) => {
            let va = a[key]; let vb = b[key]
            if (typeof va === 'string') va = va.toLowerCase()
            if (typeof vb === 'string') vb = vb.toLowerCase()
            if (va < vb) return sortAsc.value ? -1 : 1
            if (va > vb) return sortAsc.value ? 1 : -1
            return 0
        })
    }
    return list
})

function toggleSort(key) {
    if (sortKey.value === key) sortAsc.value = !sortAsc.value
    else { sortKey.value = key; sortAsc.value = true }
}
function sortIcon(key) {
    if (sortKey.value !== key) return chevronDownOutline
    return sortAsc.value ? chevronUpOutline : chevronDownOutline
}

function isSelected(id) { return selected.value.has(id) }
function toggleSelect(id) {
    if (selected.value.has(id)) selected.value.delete(id)
    else selected.value.add(id)
    selected.value = new Set(selected.value)
}

const pageIds = computed(() => processedFilaments.value.map(f => f.id))
const selectedOnPageCount = computed(() => pageIds.value.filter(id => selected.value.has(id)).length)
const isAllSelectedOnPage = computed(() => pageIds.value.length > 0 && selectedOnPageCount.value === pageIds.value.length)
const isIndeterminateOnPage = computed(() => selectedOnPageCount.value > 0 && !isAllSelectedOnPage.value)
const selectedCount = computed(() => selected.value.size)

function toggleSelectAllOnPage(ev) {
    const checked = ev.detail?.checked ?? !isAllSelectedOnPage.value
    const next = new Set(selected.value)
    if (checked) pageIds.value.forEach(id => next.add(id))
    else pageIds.value.forEach(id => next.delete(id))
    selected.value = next
}

function bulkEdit() {
    const ids = Array.from(selected.value)
    router.push({ path: '/bulk-edit', query: { ids: ids.join(',') } })
}

async function bulkDelete() {
    const count = selectedCount.value
    if (count === 0) return
    const alert = await alertController.create({
        header: 'Confirmation',
        message: `Supprimer ${count} filament(s) sélectionné(s) ?`,
        buttons: [
            { text: 'Annuler', role: 'cancel' },
            {
                text: 'Supprimer',
                role: 'destructive',
                handler: async () => {
                    try {
                        const ids = Array.from(selected.value)
                        await Promise.all(
                            ids.map(id =>
                                fetch(`http://localhost:5000/api/filaments/${id}`, { method: 'DELETE' })
                                    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`) })
                            )
                        )
                        filaments.value = filaments.value.filter(f => !selected.value.has(f.id))
                        selected.value = new Set()
                        openActionId.value = null
                    } catch (e) {
                        console.error('Erreur suppression groupée :', e)
                    }
                }
            }
        ]
    })
    await alert.present()
}

function bulkExport() {
    const ids = new Set(selected.value)
    const rows = filaments.value.filter(f => ids.has(f.id)).map(f => ({
        id: f.id,
        filament_type: f.filament_type ?? '',
        filament_detailed_type: f.filament_detailed_type ?? '',
        filament_diameter: f.filament_diameter ?? '',
        remaining_or_spool: realWeight(f),
        print_temp_min: f.print_temp_min ?? '',
        print_temp_max: f.print_temp_max ?? '',
        location: f.location ?? '',
        color_code: f.color_code ?? ''
    }))
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const csv = [
        headers.join(','),
        ...rows.map(r =>
            headers.map(h => {
                const v = (r[h] ?? '').toString()
                return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
            }).join(',')
        )
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const ts = new Date()
    const pad = n => String(n).padStart(2, '0')
    const name = `filaments_selected_${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}.csv`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = name; a.click()
    URL.revokeObjectURL(url)
}

function bulkOther() {
    console.log('Autre action groupée sur', Array.from(selected.value))
}

function viewDetails(filament) { router.push(`/detail/${filament.id}`) }
function editFilament(filament) { router.push(`/edit/${filament.id}`) }

async function confirmDelete(filament) {
    const alert = await alertController.create({
        header: 'Confirmation',
        message: `Voulez-vous supprimer le filament ${filament.filament_type} ?`,
        buttons: [
            { text: 'Annuler', role: 'cancel' },
            { text: 'Supprimer', role: 'destructive', handler: () => deleteFilament(filament) }
        ]
    })
    await alert.present()
}
async function deleteFilament(filament) {
    try {
        const res = await fetch(`http://localhost:5000/api/filaments/${filament.id}`, { method: 'DELETE' })
        if (!res.ok) return console.error('Erreur suppression HTTP:', res.status)
        filaments.value = filaments.value.filter(f => f.id !== filament.id)
        openActionId.value = null
        selected.value.delete(filament.id)
        selected.value = new Set(selected.value)
    } catch (e) { console.error('Erreur suppression :', e) }
}
</script>

<style>
.spaced-card {
    margin-bottom: 24px;
}

.spaced-card:last-child {
    margin-bottom: 0;
}

.header-controls {
    --inner-padding-start: 8px;
    align-items: center;
}

.bulk-bar {
    --background: var(--ion-color-light, #f4f5f8);
    border-radius: 12px;
    margin: 6px 0 12px;
    padding: 6px 10px;
}

.bulk-bar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.bulk-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

/* WRAPPER scroll horizontal */
.table-scroll {
    overflow-x: auto;
}

/* Tableau */
.filament-table {
    min-width: 1080px;
    /* base lisible */
    --ion-grid-padding: 0;
    --ion-grid-column-padding: 6px;
    font-size: 0.9rem;
    white-space: nowrap;
    /* évite les retours à la ligne dans l’en-tête */
}

.header-row {
    font-weight: bold;
    border-bottom: 1px solid var(--ion-color-medium);
    align-items: center;
    position: sticky;
    /* header “collant” */
    top: 0;
    z-index: 1;
    background: var(--ion-background-color);
}

.data-row {
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.data-row ion-col {
    display: flex;
    align-items: center;
}


.sortable {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
}

.color-dot {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-right: 6px;
    border: 1px solid #ccc;
}

/* alternance lignes */
.data-row:nth-child(even) {
    background-color: var(--ion-item-background, var(--ion-color-light));
}

.data-row:nth-child(odd) {
    background-color: var(--ion-background-color);
}

/* colonnes fixes */
.col-check {
    flex: 0 0 44px;
    max-width: 44px;
    padding-left: 0;
    padding-right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.col-check ion-checkbox {
    margin: 0;
}

.actions-col {
    flex: 0 0 120px;
    max-width: 120px;
}
</style>
