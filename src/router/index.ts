import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import FilamentsPage from '../views/FilamentsPage.vue'
import SettingsPage from '@/views/SettingsPage.vue'
import StatisticPage from '@/views/StatisticPage.vue'
import AddManual from '@/views/AddManualPage.vue'
import DetailPage from '@/views/DetailPage.vue';
import EditPage from '@/views/EditPage.vue';
import DragAndDropPage from '@/views/DragAndDropPage.vue';
import AnalyseProjectPage from '@/views/AnalyseProjectPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/filaments'
  },

  {
    path: '/filaments',
    name: 'filaments',
    component: FilamentsPage
  },
  {
  path: '/settings',
  name: 'Settings',
  component: SettingsPage
  },
  {
    path: '/statistic',
    name: 'Statistic',
    component: StatisticPage
  },
  {
    path: '/manual',
    name: 'Manual',
    component: AddManual
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: DetailPage
  },
  {
    path: '/edit/:id',
    name: 'Edit',
    component: EditPage
  },
  {
    path: '/drag-and-drop',
    name: 'DragAndDrop',
    component: DragAndDropPage
  },
  {
    path: '/3mf-analyse',
    name: 'AnalyseProjectPage',
    component: AnalyseProjectPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
