import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import SettingsPage from '@/views/SettingsPage.vue'
import StatisticPage from '@/views/StatisticPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
