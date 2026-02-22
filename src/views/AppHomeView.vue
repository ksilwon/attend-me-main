<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
</script>

<template>
  <div class="card p-3">
    <h1 class="h4 mb-2">Panel</h1>

    <p class="mb-3">
      Zalogowano jako: <strong>{{ auth.user?.loginName }}</strong>
      <span class="text-muted">({{ auth.user?.roles.join(', ') }})</span>
    </p>

    <div class="d-flex gap-2 flex-wrap">
      <a v-if="auth.user?.roles.includes('teacher') || auth.user?.roles.includes('admin')"
         class="btn btn-primary"
         href="#/app/teacher/sessions">
        Panel wykładowcy
      </a>

      <a v-if="auth.user?.roles.includes('student')"
         class="btn btn-success"
         href="#/app/student/sessions">
        Panel studenta
      </a>
    </div>
  </div>
</template>