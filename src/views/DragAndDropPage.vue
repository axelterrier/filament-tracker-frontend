<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Importer des bobines</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <!-- Zone de drop -->
      <div
        class="dropzone"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <ion-icon :icon="cloudUploadOutline" size="large"></ion-icon>
        <p>Glissez vos fichiers JSON ici ou cliquez pour parcourir</p>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          multiple
          @change="handleFileChange"
          hidden
        />
      </div>

      <!-- Liste des fichiers JSON valides -->
      <ion-list v-if="filaments.length">
        <ion-list-header>
          <ion-label>Fichiers chargés</ion-label>
        </ion-list-header>

        <ion-item v-for="(filament, index) in filaments" :key="index">
          <ion-label>
            <h3>{{ filament.material_code }} ({{ filament.type }})</h3>
            <p>UID : {{ filament.tag_uid }}</p>
          </ion-label>
          <ion-badge
            slot="end"
            :style="{ backgroundColor: filament.color_hex, color: '#000' }"
          >
            {{ filament.color_hex }}
          </ion-badge>
        </ion-item>
      </ion-list>

      <!-- Bouton d'import -->
      <ion-button
        expand="block"
        @click="uploadFiles"
        :disabled="!rawFiles.length"
        class="ion-margin-top"
      >
        Importer {{ rawFiles.length }} bobine(s)
      </ion-button>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonButton
} from '@ionic/vue'
import { cloudUploadOutline } from 'ionicons/icons'

const router = useRouter()

const fileInput = ref(null)
const filaments = ref([])      // prévisualisation des JSON valides
const rawFiles = ref([])       // fichiers à uploader

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  readFiles(event.target.files)
}

const handleDrop = (event) => {
  readFiles(event.dataTransfer.files)
}

const readFiles = (fileList) => {
  for (const file of fileList) {
    if (!file.name.endsWith('.json')) continue

    rawFiles.value.push(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        if (json.tag_uid && json.material_code && json.type) {
          filaments.value.push(json)
        }
      } catch (err) {
        console.warn(`Fichier invalide : ${file.name}`)
      }
    }
    reader.readAsText(file)
  }
}

const uploadFiles = async () => {
  const formData = new FormData()
  for (const file of rawFiles.value) {
    formData.append('files', file)
  }

  try {
    const res = await fetch('http://localhost:5000/api/filaments/import', {
      method: 'POST',
      body: formData
    })

    const text = await res.text()
    let result = {}

    try {
      result = JSON.parse(text)
    } catch {
      throw new Error(`Réponse non JSON :\n${text}`)
    }

    if (res.ok) {
      alert(`✅ Importé : ${result.imported} | Ignorés : ${result.skipped}`)

      // Remise à zéro
      filaments.value = []
      rawFiles.value = []

      // **Nouvelle ligne** : redirection vers /home
      router.push('/home')
    } else {
      alert(`Erreur serveur : ${result.error || 'Échec de l’import'}`)
    }

  } catch (err) {
    alert(`Erreur réseau : ${err.message}`)
  }
}
</script>


<style scoped>

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
</style>
