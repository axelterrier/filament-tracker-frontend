<template>
    <ion-card>
        <ion-card-header>
            <ion-card-title>Mes filaments</ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <ion-list lines="inset">
                <ion-item v-for="filament in filaments" :key="filament.id" class="ion-text-wrap">
                    <!-- Infos -->
                    <ion-label>
                        <h2>
                            <strong>{{ filament.filament_detailed_type || filament.filament_type }}</strong>
                        </h2>
                        <p>
                            <strong>Ø :</strong> {{ filament.filament_diameter }} mm |
                            <strong>Poids :</strong> {{ filament.spool_weight }} g |
                            <strong>Temp :</strong> {{ filament.print_temp_min }}–{{ filament.print_temp_max }} °C
                        </p>
                        <p v-if="filament.extra_color_info">
                            <strong>Couleur :</strong> {{ filament.extra_color_info }}
                        </p>
                    </ion-label>

                    <!-- Couleur -->
                    <div :style="{
                        backgroundColor: filament.color_code,
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        marginRight: '12px',
                        border: '1px solid #ccc'
                    }" :title="filament.color_code" slot="end" />

                    <!-- Bouton pour afficher les actions -->
                    <ion-button fill="clear" size="small" slot="end" @click="toggleActions(filament.id)"
                        :style="{ transition: 'transform 0.2s ease', transform: openActionId === filament.id ? 'rotate(-180deg)' : 'rotate(0deg)' }">
                        <ion-icon :icon="chevronForward" />
                    </ion-button>

                    <!-- Actions conditionnelles -->
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
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted, onBeforeUnmount } from 'vue';
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
    alertController
} from '@ionic/vue';
import {
    eyeOutline,
    createOutline,
    trashOutline,
    chevronForward
} from 'ionicons/icons';

const filaments = ref([]);
const openActionId = ref(null);
const router = useRouter();

async function fetchFilaments() {
    try {
        const res = await fetch('http://localhost:5000/api/filaments');
        filaments.value = await res.json();
    } catch (err) {
        console.error('Erreur chargement filaments :', err);
    }
}

onMounted(() => {
    fetchFilaments();
    window.addEventListener('refresh-filaments', fetchFilaments);
});

onBeforeUnmount(() => {
    window.removeEventListener('refresh-filaments', fetchFilaments);
});

function toggleActions(id) {
    openActionId.value = openActionId.value === id ? null : id;
}

function viewDetails(filament) {
    router.push(`/detail/${filament.id}`);
    console.log('Voir détails :', filament);
}

function editFilament(filament) {
    router.push(`/edit/${filament.id}`);
    console.log('Édition :', filament);
}

async function confirmDelete(filament) {
    const alert = await alertController.create({
        header: 'Confirmation',
        message: `Voulez-vous supprimer le filament ${filament.filament_type} ?`,
        buttons: [
            { text: 'Annuler', role: 'cancel' },
            {
                text: 'Supprimer',
                role: 'destructive',
                handler: () => deleteFilament(filament)
            }
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
