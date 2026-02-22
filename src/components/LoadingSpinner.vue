<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

withDefaults(defineProps<{ message?: string }>(), {
  message: 'Ładowanie...',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 gap-3">
    <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
    <p class="text-gray-500 text-sm">{{ message }}</p>
  </div>
</template>
