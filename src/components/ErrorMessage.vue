<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

defineProps<{
  message: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
    <AlertCircle class="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
    <div class="flex-1">
      <p class="text-red-700 text-sm">{{ message }}</p>
      <button
        @click="emit('retry')"
        class="mt-2 text-sm text-red-600 underline hover:text-red-800"
      >
        Spróbuj ponownie
      </button>
    </div>
  </div>
</template>
