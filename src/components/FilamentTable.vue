<template>
    <ion-grid>
        <ion-row>
            <!-- Colonne gauche : liste des filaments -->
            <ion-col size-md="6" size-sm="12">
                <ion-card class="spaced-card">
                    <ion-card-header>
                        <ion-card-title>Mes filaments</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-searchbar v-model="filterText" placeholder="Filtrer par type, couleur…" debounce="300" />

                        <ion-list lines="inset">
                            <ion-item v-for="filament in processedFilaments" :key="filament.id" class="ion-text-wrap">
                                <div slot="start" :style="{
                                    backgroundColor: filament.color_code,
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    border: '1px solid #ccc'
                                }" :title="filament.color_code"></div>

                                <ion-label>
                                    <h2 style="margin: 0; font-size: 1.1em;">
                                        {{ filament.filament_detailed_type || filament.filament_type }}
                                    </h2>
                                    <p style="margin: 4px 0;">
                                        <strong>Ø :</strong> {{ filament.filament_diameter }} mm |
                                        <strong>Poids :</strong> {{ filament.spool_weight }} g |
                                        <strong>Temp :</strong> {{ filament.print_temp_min }}–{{ filament.print_temp_max
                                        }} °C
                                    </p>
                                    <p v-if="filament.extra_color_info" style="margin: 0;">
                                        <strong>Couleur :</strong> {{ filament.extra_color_info }}
                                    </p>
                                </ion-label>

                                <ion-button fill="clear" size="small" slot="end" @click="toggleActions(filament.id)"
                                    :style="{ transform: openActionId === filament.id ? 'rotate(-180deg)' : 'rotate(0deg)' }">
                                    <ion-icon :icon="chevronForward" />
                                </ion-button>

                                <transition name="slide-actions">
                                    <ion-buttons v-if="openActionId === filament.id" slot="end">
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
                                </transition>
                            </ion-item>
                        </ion-list>
                    </ion-card-content>
                </ion-card>
            </ion-col>

            <!-- Colonne droite : statistiques ET répartition -->
            <ion-col size-md="6" size-sm="12">
                <!-- Carte Statistiques -->
                <ion-card class="spaced-card">
                    <ion-card-header>
                        <ion-card-title>Statistiques</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <p><strong>Nombre de bobines :</strong> {{ totalFilaments }}</p>
                        <p><strong>Poids total :</strong> {{ totalWeightKg }} kg</p>
                    </ion-card-content>
                </ion-card>

                <!-- Carte Répartition (camembert) -->
                <ion-card class="spaced-card">
                    <ion-card-header>
                        <ion-card-title>Répartition</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <Pie :data="chartData" :options="chartOptions" />
                    </ion-card-content>
                </ion-card>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Pie } from 'vue-chartjs'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
Chart.register(ArcElement, Tooltip, Legend)

import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonButtons,
    IonIcon,
    IonSearchbar,
    alertController
} from '@ionic/vue';
import {
    eyeOutline,
    createOutline,
    trashOutline,
    chevronForward,
    caretUpOutline,
    caretDownOutline
} from 'ionicons/icons';

const filaments = ref([]);
const filterText = ref('');
const sortKey = ref('');
const sortAsc = ref(true);
const openActionId = ref(null);
const router = useRouter();
const props = defineProps({
    data: Object
})

async function fetchFilaments() {
    try {
        const res = await fetch('http://localhost:5000/api/filaments');
        filaments.value = await res.json();
    } catch (err) {
        console.error('Erreur chargement filaments :', err);
    }
}

//Fonction de cycle de vie pour charger les filaments au montage du composant
onMounted(() => {
    fetchFilaments();
    window.addEventListener('refresh-filaments', fetchFilaments);
});

onBeforeUnmount(() => {
    window.removeEventListener('refresh-filaments', fetchFilaments);
});

//Constantes calculées pour les statisstiques
const processedFilaments = computed(() => {

    let list = filaments.value.filter(f => {
        const term = filterText.value.toLowerCase();
        return (
            (f.filament_type && f.filament_type.toLowerCase().includes(term)) ||
            (f.filament_detailed_type && f.filament_detailed_type.toLowerCase().includes(term)) ||
            (f.extra_color_info && f.extra_color_info.toLowerCase().includes(term))
        );
    });
    if (sortKey.value) {
        list = list.slice().sort((a, b) => {
            let va = a[sortKey.value];
            let vb = b[sortKey.value];
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return sortAsc.value ? -1 : 1;
            if (va > vb) return sortAsc.value ? 1 : -1;
            return 0;
        });
    }
    return list;
});

const totalFilaments = computed(() => processedFilaments.value.length);

const totalWeight = computed(() =>
    processedFilaments.value.reduce(
        (sum, f) => sum + (parseFloat(f.spool_weight) || 0), 0
    )
);

const totalWeightKg = computed(() => (totalWeight.value / 1000).toFixed(2));

const distributionByMaterial = computed(() => {
    const dist = {};
    processedFilaments.value.forEach(f => {
        const key = f.filament_type || "Inconnu";
        dist[key] = (dist[key] || 0) + 1;
    });
    return dist;
});

//Données pour le graphique en camembert
const chartData = computed(() => ({
    labels: Object.keys(distributionByMaterial.value),
    datasets: [
        {
            data: Object.values(distributionByMaterial.value),
            // Optionnel : tu peux mettre tes propres couleurs
            backgroundColor: [
                "#f39c12", // orange "mango"
                "#27ae60", // vert foncé mais vif
                "#8e44ad", // violet vif
                "#3498db", // bleu "flat"
                "#e74c3c", // rouge pétant
                "#f1c40f", // jaune profond mais lisible
                "#16a085", // turquoise
                "#d35400", // orange foncé
                "#bdc3c7", // gris clair (pour "autres" ou catégories faibles)
            ],
            borderColor: "#222",       // change la couleur de la bordure
        }
    ]
}))


const chartOptions = {
    responsive: true,
    plugins: {
        legend: { position: 'bottom' }
    }
}

//Fonctions pour gérer les actions sur les filaments
function toggleActions(id) {
    openActionId.value = openActionId.value === id ? null : id;
}

function viewDetails(filament) {
    router.push(`/detail/${filament.id}`);
}

function editFilament(filament) {
    router.push(`/edit/${filament.id}`);
}

async function confirmDelete(filament) {
    const alert = await alertController.create({
        header: 'Confirmation',
        message: `Voulez-vous supprimer le filament ${filament.filament_type} ?`,
        buttons: [
            { text: 'Annuler', role: 'cancel' },
            { text: 'Supprimer', role: 'destructive', handler: () => deleteFilament(filament) }
        ]
    });
    await alert.present();
}

async function deleteFilament(filament) {
    try {
        const res = await fetch(`http://localhost:5000/api/filaments/${filament.id}`, { method: 'DELETE' });
        if (!res.ok) {
            console.error('Erreur suppression HTTP:', res.status);
            return;
        }
        filaments.value = filaments.value.filter(f => f.id !== filament.id);
        openActionId.value = null;
    } catch (e) {
        console.error('Erreur suppression :', e);
    }
}
</script>

<style>
.spaced-card {
    margin-bottom: 24px;
    /* ou 16px, à adapter selon le look voulu */
}

.spaced-card:last-child {
    margin-bottom: 0;
}
</style>