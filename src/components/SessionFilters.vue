<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import type { TimeFilter } from '@/utils/dateFilters'

const props = defineProps<{
  timeFilter: TimeFilter
  searchText: string
}>()

const emit = defineEmits<{
  'update:timeFilter': [value: TimeFilter]
  'update:searchText': [value: string]
}>()

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: 'today', label: 'Dziś' },
  { value: 'tomorrow', label: 'Jutro' },
  { value: 'next_week', label: 'Następny tydzień' },
  { value: 'past', label: 'Minione' },
  { value: 'all', label: 'Wszystkie' },
]
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-3 mb-4">
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="opt in TIME_OPTIONS"
        :key="opt.value"
        @click="emit('update:timeFilter', opt.value)"
        :class="[
          'px-3 py-1.5 rounded-lg text-sm font-medium transition',
          props.timeFilter === opt.value
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
        ]"
      >
        {{ opt.label }}
      </button>
    </div>
    <div class="relative flex-1 min-w-[200px]">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        :value="props.searchText"
        @input="emit('update:searchText', ($event.target as HTMLInputElement).value)"
        placeholder="Szukaj (przedmiot, lokalizacja)..."
        class="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  </div>
</template>
