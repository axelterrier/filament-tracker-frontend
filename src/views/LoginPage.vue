<template>
  <ion-page>
    <ion-content class="login-content">
      <ion-grid>
        <ion-row class="ion-justify-content-center ion-align-items-center" style="height: 100%;">
          <ion-col size="12" size-md="6" size-lg="4">
            <ion-card>
              <ion-card-header>
                <ion-card-title class="ion-text-center">
                  {{ t('login.title') }}
                </ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <ion-list>
                  <ion-item class="form-item">
                    <ion-label position="stacked">
                      {{ t('login.username') }}
                    </ion-label>
                    <ion-input
                      v-model="username"
                      type="text"
                      :placeholder="t('login.usernamePlaceHolder')"
                      clear-input
                      autocomplete="username"
                    />
                  </ion-item>
                  <ion-item class="form-item">
                    <ion-label position="stacked">
                      {{ t('login.title') }}
                    </ion-label>
                    <ion-input
                      v-model="password"
                      type="password"
                      :placeholder="t('login.passwordPlaceHolder')"
                      clear-input
                      autocomplete="current-password"
                    />
                  </ion-item>
                </ion-list>

                <div class="ion-text-center ion-margin-top">
                  <ion-button expand="block" size="large" @click="onLogin">
                    {{ t('login.submit') }}
                  </ion-button>
                </div>

                <ion-text color="danger" v-if="error" class="ion-text-center ion-padding-top">
                  {{ error }}
                </ion-text>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/store';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const { t } = useI18n();
const store = useMainStore();

/**
 * Redirection temporaire en attendant le backend
 */
function onLogin() {
  router.replace('/home');
}
</script>

<style scoped>
.login-content {
  --background: var(--ion-color-light-shade);
}
.dark .login-content {
  --background: var(--ion-color-dark-shade);
}

ion-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

ion-card-header {
  padding-bottom: 0;
}

ion-card-title {
  font-size: 1.5rem;
  font-weight: bold;
}

ion-item.form-item {
  margin-bottom: 1.5rem;
}

ion-input {
  font-size: 1rem;
}

ion-button {
  --border-radius: 8px;
}
</style>
