<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Ładowanie...</span>
    </div>
    <p v-if="message" class="mt-3 text-muted">{{ message }}</p>
  </div>
</template>