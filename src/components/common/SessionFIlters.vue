<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: {
    dateFilter: string
    searchText: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { dateFilter: string; searchText: string }): void
}>()

const dateFilter = ref(props.modelValue.dateFilter)
const searchText = ref(props.modelValue.searchText)

const filterOptions = [
  { value: 'today', label: 'Dziś' },
  { value: 'tomorrow', label: 'Jutro' },
  { value: 'week', label: 'Następny tydzień' },
  { value: 'past', label: 'Minione' },
  { value: 'all', label: 'Wszystkie' }
]

const currentFilter = computed(() => {
  return filterOptions.find((f) => f.value === dateFilter.value)?.label ?? 'Wszystkie'
})

watch([dateFilter, searchText], () => {
  emit('update:modelValue', {
    dateFilter: dateFilter.value,
    searchText: searchText.value
  })
})
</script>

<template>
  <div class="card mb-4">
    <div class="card-body">
      <div class="row g-3 align-items-center">
        <div class="col-md-6">
          <label class="form-label fw-semibold">
            <i class="bi bi-calendar3 me-1"></i>
            Zakres czasowy
          </label>
          <div class="btn-group w-100" role="group">
            <div class="dropdown w-100">
              <button
                class="btn btn-outline-primary dropdown-toggle w-100"
                type="button"
                data-bs-toggle="dropdown"
              >
                {{ currentFilter }}
              </button>
              <ul class="dropdown-menu w-100">
                <li v-for="option in filterOptions" :key="option.value">
                  <button
                    class="dropdown-item"
                    :class="{ active: dateFilter === option.value }"
                    @click="dateFilter = option.value"
                  >
                    {{ option.label }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label fw-semibold">
            <i class="bi bi-search me-1"></i>
            Szukaj
          </label>
          <input
            v-model="searchText"
            type="text"
            class="form-control"
            placeholder="Wpisz nazwę przedmiotu, grupy..."
          />
        </div>
      </div>
    </div>
  </div>
</template>
