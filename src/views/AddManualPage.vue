<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>{{ t('addFilament.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list class="ion-padding">

        <ion-list-header>
          <ion-label>{{ t('addFilament.sectionTypeColor') }}</ion-label>
        </ion-list-header>

        <!-- Manufacturer -->
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.brand') }}</ion-label>
          <ion-select v-model="filament.tag_manufacturer" interface="popover"
            :placeholder="t('addFilament.brandPlaceholder')">
            <ion-select-option v-for="brand in brands" :key="brand.value" :value="brand.value">
              {{ brand.label }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Type -->
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.type') }}</ion-label>
          <ion-select v-model="filament.filament_type" interface="popover"
            :placeholder="$t('addFilament.typePlaceholder')">
            <ion-select-option value="PLA">PLA</ion-select-option>
            <ion-select-option value="PETG">PETG</ion-select-option>
            <ion-select-option value="ABS">ABS</ion-select-option>
            <ion-select-option value="ASA">ASA</ion-select-option>
            <ion-select-option value="PC">PC</ion-select-option>
            <ion-select-option value="TPU">TPU</ion-select-option>
            <ion-select-option value="PA">PA</ion-select-option>
            <ion-select-option value="Support Material">{{ t('addFilament.supportFilament') }}</ion-select-option>
          </ion-select>
        </ion-item>


        <!-- Type détaillé -->
        <ion-item v-if="detailedOptions.length">
          <ion-label position="stacked">{{ t('addFilament.typeDetailed') }}</ion-label>
          <ion-select v-model="filament.filament_detailed_type" interface="popover"
            :placeholder="$t('addFilament.typeDetailedPlaceholder')">
            <ion-select-option v-for="opt in detailedOptions" :key="opt" :value="opt">
              {{ opt }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Dropdown Couleur dynamique avec prévisualisation intégrée -->
        <ion-item v-if="colorOptions.length">
          <ion-label position="stacked">{{ t('addFilament.color') }}</ion-label>
          <ion-select v-model="filament.color_code" interface="popover"
            :placeholder="t('addFilament.colorPlaceholder')">
            <ion-select-option v-for="opt in colorOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </ion-select-option>
          </ion-select>

          <!-- Prévisualisation couleur sélectionnée -->
          <div slot="end" v-if="filament.color_code" :style="{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '1px solid #ccc',
            backgroundColor: filament.color_code,
            marginTop: '2%',
          }"></div>
        </ion-item>



        <!-- Caractéristiques physiques -->
        <ion-list-header>
          <ion-label><strong>{{ t('addFilament.sectionPhysical') }}</strong></ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.diameter') }}</ion-label>
          <ion-input v-model.number="filament.filament_diameter" type="number"
            :placeholder="$t('addFilament.diameterPlaceholder')" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.weight') }}</ion-label>
          <ion-input v-model.number="filament.spool_weight" type="number"
            :placeholder="$t('addFilament.weightPlaceholder')" />
        </ion-item>

        <!-- Températures -->
        <ion-list-header>
          <ion-label><strong>{{ t('addFilament.sectionTemps') }}</strong></ion-label>
        </ion-list-header>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.printTempMin') }}</ion-label>
          <ion-input v-model.number="filament.print_temp_min" type="number"
            :placeholder="$t('addFilament.printTempMinPlaceholder')" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.printTempMax') }}</ion-label>
          <ion-input v-model.number="filament.print_temp_max" type="number"
            :placeholder="$t('addFilament.printTempMaxPlaceholder')" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.dryTemp') }}</ion-label>
          <ion-input v-model.number="filament.dry_temp" type="number"
            :placeholder="$t('addFilament.dryTempPlaceholder')" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.dryTimeMinutes') }}</ion-label>
          <ion-input v-model.number="filament.dry_time_minutes" type="number"
            :placeholder="$t('addFilament.dryTimeMinutesPlaceholder')" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">{{ t('addFilament.dryBedTemp') }}</ion-label>
          <ion-input v-model.number="filament.dry_bed_temp" type="number"
            :placeholder="$t('addFilament.dryBedTempPlaceholder')" />
        </ion-item>

      </ion-list>

      <div class="ion-padding">
        <ion-button expand="block" size="large" @click="submit">{{ t('addFilament.submit') }}</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
// Core Imports
import { ref, watch, computed, getCurrentWatcher } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

// Ionic Components
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonBackButton,
  IonButtons,
  IonSelect,
  IonSelectOption,
  IonListHeader
} from '@ionic/vue';

// Styles
import 'vue-color-kit/dist/vue-color-kit.css';

// Router & i18n
const router = useRouter();
const { t } = useI18n();

// génère un entier entre 0 et 0xFFFFFF, le convertit en hex et garantit 6 chiffres
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF)
    .toString(16)
    .padStart(6, '0')
}

// Reactive State
const filament = ref({
  uid: '',
  filament_type: '',
  filament_detailed_type: '',
  color_code: getRandomColor(),
  extra_color_info: '',
  filament_diameter: null,
  spool_weight: null,
  filament_length: null,
  dry_temp: null,
  dry_time_minutes: null,
  dry_bed_temp: null,
  nozzle_diameter: null,
  print_temp_min: null,
  print_temp_max: null,
  tag_manufacturer: null
});

// Filament Type Options
const filamentTypes = {
  PLA: [
    'Basic',
    'Matte',
    'Silk+',
    'Translucent',
    'Silk Multi-Color',
    'Wood',
    'Basic Gradient',
    'Galaxy',
    'Metal',
    'Marble',
    'Glow',
    'Sparkle',
    'Aero',
    'CF',
    'CMYK'
  ],
  PETG: [
    'HF',
    'Translucent',
    'CF'
  ],
  ABS: [
    'Basic',
    'GF'
  ],
  ASA: [
    'Basic',
    'Aero',
    'CF'
  ],
  PC: [
    'Basic',
    'FR'
  ],
  TPU: [
    'for AMS'
  ],
  PA: [
    'HT-CF',
    '6-GF'
  ],
  'Support Material': [
    'PLA/PETG',
    'PLA (New Version)',
    'ABS',
    'PA/PET',
    'PVA'
  ]
};

// … juste après filamentTypes
const filamentColors = {
  PLA: {
    Basic: [
      { value: '#FFFFFF', label: 'Blanc jade' },
      { value: '#F7E6DE', label: 'Beige' },
      { value: '#E4BD68', label: 'Or' },
      { value: '#A6A9AA', label: 'Argent' },
      { value: '#8E9089', label: 'Gris' },
      { value: '#847D48', label: 'Bronze' },
      { value: '#9D432C', label: 'Marron' },
      { value: '#C12E1F', label: 'Rouge' },
      { value: '#EC008C', label: 'Magenta' },
      { value: '#F55A74', label: 'Rose' },
      { value: '#FF6A13', label: 'Orange' },
      { value: '#F4EE2A', label: 'Jaune' },
      { value: '#16C344', label: 'Vert bambou' },
      { value: '#3F8E43', label: 'Vert gui' },
      { value: '#164B35', label: 'Vert' },
      { value: '#0086D6', label: 'Cyan' },
      { value: '#0A2989', label: 'Bleu' },
      { value: '#5E43B7', label: 'Violet' },
      { value: '#5B6579', label: 'Gris bleu' },
      { value: '#000000', label: 'Noir' },
    ],
    Matte: [
      { value: '#FFFFFF', label: 'Blanc ivoire' },
      { value: '#CBC6B8', label: 'Blanc os' },
      { value: '#E8DBB7', label: 'Beige désert' },
      { value: '#D3B7A7', label: 'Brun latte' },
      { value: '#AE835B', label: 'Caramel' },
      { value: '#B15533', label: 'Terre cuite' },
      { value: '#7D6556', label: 'Brun foncé' },
      { value: '#4D3324', label: 'Chocolat foncé' },
      { value: '#AE96D4', label: 'Violet lilas' },
      { value: '#E8AFCF', label: 'Rose sakura' },
      { value: '#F99963', label: 'Orange mandarine' },
      { value: '#F7D959', label: 'Jaune citron' },
      { value: '#950051', label: 'Prune' },
      { value: '#DE4343', label: 'Rouge écarlate' },
      { value: '#BB3D43', label: 'Rouge foncé' },
      { value: '#68724D', label: 'Vert foncé' },
      { value: '#61C680', label: 'Vert gazon' },
      { value: '#C2E189', label: 'Vert pomme' },
      { value: '#A3D8E1', label: 'Bleu glace' },
      { value: '#56B7E6', label: 'Bleu ciel' },
      { value: '#0078BF', label: 'Bleu marine' },
      { value: '#042F56', label: 'Bleu foncé' },
      { value: '#9B9EA0', label: 'Gris cendre' },
      { value: '#757575', label: 'Gris nardo' },
      { value: '#000000', label: 'Charbon' },
    ],
    "Silk+": [
      { value: '#F4A925', label: 'Doré' },
      { value: '#C8C8C8', label: 'Argenté' },
      { value: '#5F6367', label: 'Gris titane' },
      { value: '#008BDA', label: 'Bleu' },
      { value: '#8671CB', label: 'Violet' },
      { value: '#D02727', label: 'Rouge bonbon' },
      { value: '#018814', label: 'Vert bonbon' },
      { value: '#BA9594', label: 'Doré rose' },
      { value: '#A8C6EE', label: 'Bleu layette' },
      { value: '#F7ADA6', label: 'Rose' },
      { value: '#96DCB9', label: 'Menthe' },
      { value: '#F3CFB2', label: 'Champagne' },
      { value: '#FFFFFF', label: 'Blanc' },
    ],
    Translucent: [
      { value: '#009FA1', label: 'Teal' },
      { value: '#96D8AF', label: 'Light Jade' },
      { value: '#0047BB', label: 'Blue' },
      { value: '#F5DBAB', label: 'Mellow Yellow' },
      { value: '#8344B0', label: 'Purple' },
      { value: '#F5B6CD', label: 'Cherry Pink' },
      { value: '#F74E02', label: 'Orange' },
      { value: '#B8CDE9', label: 'Ice Blue' },
      { value: '#B50011', label: 'Red' },
      { value: '#B8ACD6', label: 'Lavender' },
    ],
    "Silk Multi-Color": [
      { value: ['#000000', '#A34342'], label: 'Velvet Eclipse' },
      { value: ['#0047BB', '#7D1B49'], label: 'Midnight Blaze' },
      { value: ['#FF9425', '#FCA2BF'], label: 'Gilded Rose' },
      { value: ['#60A4E8', '#4CE4A0'], label: 'Blue Hawaii' },
      { value: ['#0047BB', '#BB22A3'], label: 'Neon City' },
      { value: ['#7F3696', '#006EC9'], label: 'Aurora Purple' },
      { value: ['#F772A4', '#00918B'], label: 'South Beach' },
      { value: ['#EC984C', '#6CD4BC', '#A66EB9', '#D87694'], label: 'Dawn Radiance' },
    ],
    Wood: [
      { value: '#4F3F24', label: 'Black Walnut' },
      { value: '#4C241C', label: 'Rosewood' },
      { value: '#995F11', label: 'Clay Brown' },
      { value: '#918669', label: 'Classic Birch' },
      { value: '#D6CCA3', label: 'White Oak' },
      { value: '#C98935', label: 'Ochre Yellow' },
    ],
    "Basic Gradient": [
      { value: ['#9CDBD9', '#FFFFFF'], label: 'Arctic Whisper' },
      { value: ['#E94B3C', '#FFFFFF'], label: 'Solar Breeze' },
      { value: ['#307FE2', '#54FF9B'], label: 'Ocean to Meadow' },
      { value: ['#E7C1D5', '#8EC9E9'], label: 'Cotton Candy Cloud' },
      { value: ['#6FCAEF', '#8573DD'], label: 'Blueberry Bubblegum' },
      { value: ['#B6FF43', '#4EC939'], label: 'Mint Lime' },
      { value: ['#F78F77', '#E4505A'], label: 'Pink Citrus' },
      { value: ['#ED9558', '#CE4406'], label: 'Dusk Glare' },
    ],
    Galaxy: [
      { value: '#684A43', label: 'Brown' },
      { value: '#3B665E', label: 'Green' },
      { value: '#424379', label: 'Nebulae' },
      { value: '#594177', label: 'Purple' },
    ],
    Metal: [
      { value: '#B39B84', label: 'Iridium Gold Metallic' },
      { value: '#AA6443', label: 'Copper Brown Metallic' },
      { value: '#1D7C6A', label: 'Oxide Green Metallic' },
      { value: '#39699E', label: 'Cobalt Blue Metallic' },
      { value: '#43403D', label: 'Iron Gray Metallic' },
    ],
    Marble: [
      { value: '#F7F3F0', label: 'White Marble' },
      { value: '#AD4E38', label: 'Red Granite' },
    ],
    Glow: [
      { value: '#A1FFAC', label: 'Glow Green' },
      { value: '#F8FF80', label: 'Glow Yellow' },
      { value: '#F17B8F', label: 'Glow Pink' },
      { value: '#7AC0E9', label: 'Glow Blue' },
      { value: '#FF9D5B', label: 'Glow Orange' },
    ],
    Sparkle: [
      { value: '#CEA629', label: 'Classic Gold Sparkle' },
      { value: '#8E9089', label: 'Slate Gray Sparkle' },
      { value: '#792B36', label: 'Crimson Red Sparkle' },
      { value: '#483D8B', label: 'Royal Purple Sparkle' },
      { value: '#3F5443', label: 'Alpine Green Sparkle' },
      { value: '#2D2B28', label: 'Onyx Black Sparkle' },
    ],
    Aero: [
      { value: '#ffffff', label: 'White' },
      { value: '#fff000', label: 'Gray' }
    ],
    CF: [
      { value: '#951E23', label: 'Burgundy Red' },
      { value: '#5C9748', label: 'Matcha Green' },
      { value: '#6E88BC', label: 'Jeans Blue' },
      { value: '#2842AD', label: 'Royal Blue' },
      { value: '#69398E', label: 'Iris Purple' },
      { value: '#4D5054', label: 'Lava Gray' },
      { value: '#000000', label: 'Black' },
    ],
    // …
  },
  PETG: {
    HF: [
      { value: '#0000FF', label: 'Bleu HF' },
      // …
    ],
    Translucent: [
      { value: '#FFA50080', label: 'Orange Translucide' },
      // …
    ],
    // …
  },
  // autres types…
};

const colorOptions = computed(() => {
  const type = filament.value.filament_type;
  const detail = filament.value.filament_detailed_type;
  return (filamentColors[type] && filamentColors[type][detail]) || [];
});

// Réinitialiser la couleur quand on change de sous‑type
watch(
  () => filament.value.filament_detailed_type,
  () => {
    filament.value.color_code = null;
  }
);

// Filament brands
const brands = [
  { value: 'eSun', label: 'eSun' },
  { value: 'Prusa', label: 'Prusa' },
  { value: 'Polymaker', label: 'Polymaker' },
  { value: 'Bambu', label: 'Bambu' },
  { value: 'ColorFabb', label: 'ColorFabb' },
  // ajoutez autant que nécessaire
];

// Computed Detailed Options
const detailedOptions = computed(() =>
  filamentTypes[filament.value.filament_type] || []
);

// Watchers
watch(
  () => filament.value.filament_type,
  () => {
    filament.value.filament_detailed_type = null;
  }
);

// Helper Functions
/**
 * Generate a unique identifier.
 */
function generateUid() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Form Submission
async function submit() {
  // Assign UIDs before sending
  filament.value.uid = generateUid();
  filament.value.tray_uid = generateUid();

  try {
    const res = await fetch('http://localhost:5000/api/filaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filament.value)
    });

    if (res.status === 400) {
      const err = await res.json();
      console.error('400 Bad Request:', err.error);
      alert(`${t('error')}: ${err.error}`);
      return;
    }

    if (!res.ok) {
      console.error('Error adding filament:', res.status);
      return;
    }

    const data = await res.json();
    console.log('Added:', data);
    window.dispatchEvent(new Event('refresh-filaments'));
    router.push('/home');
  } catch (error) {
    console.error('Submission error:', error);
  }
}
</script>


<style scoped>
ion-list-header {
  margin: 20px 0 10px
}

ion-item {
  --inner-padding-end: 0px
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 5px
}

.color-preview {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--ion-color-medium-tint);
  cursor: pointer
}

.color-popover {
  margin-top: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  background: var(--ion-background-color);
  padding: 12px
}
</style>
