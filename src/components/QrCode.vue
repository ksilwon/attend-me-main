<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{
  value: string
  size?: number
}>(), {
  size: 250,
})

const dataUrl = ref('')

async function generate(): Promise<void> {
  if (!props.value) {
    dataUrl.value = ''
    return
  }
  try {
    dataUrl.value = await QRCode.toDataURL(props.value, {
      width: props.size,
      margin: 2,
      color: { dark: '#1e1b4b', light: '#ffffff' },
    })
  } catch {
    dataUrl.value = ''
  }
}

onMounted(generate)
watch(() => props.value, generate)
</script>

<template>
  <img
    v-if="dataUrl"
    :src="dataUrl"
    :width="props.size"
    :height="props.size"
    alt="Kod QR"
    class="mx-auto"
  />
</template>
