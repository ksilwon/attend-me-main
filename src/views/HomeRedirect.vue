<script setup lang="ts">
import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

watchEffect(() => {
  if (!auth.isInitializing) {
    router.replace(auth.isTeacher ? '/teacher' : '/student')
  }
})
</script>

<template>
  <div class="flex items-center justify-center py-12">
    <span class="text-gray-400">Przekierowywanie...</span>
  </div>
</template>
