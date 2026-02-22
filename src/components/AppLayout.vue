<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { GraduationCap, User, LogOut, Menu, X } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

const roleBadge = computed(() =>
  auth.isTeacher ? 'Wykładowca' : auth.isStudent ? 'Student' : 'Użytkownik'
)

function handleLogout(): void {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Pasek nawigacji -->
    <nav class="bg-indigo-700 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2 font-bold text-xl hover:opacity-90">
            <GraduationCap class="w-7 h-7" />
            <span>AttendMe</span>
          </router-link>

          <!-- Menu desktop -->
          <div class="hidden sm:flex items-center gap-4">
            <div class="flex items-center gap-2 text-indigo-200">
              <User class="w-4 h-4" />
              <span class="text-sm">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</span>
              <span class="text-xs bg-indigo-600 px-2 py-0.5 rounded-full">{{ roleBadge }}</span>
            </div>
            <button
              @click="handleLogout"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-sm"
            >
              <LogOut class="w-4 h-4" />
              Wyloguj
            </button>
          </div>

          <!-- Przycisk menu mobilnego -->
          <button class="sm:hidden" @click="menuOpen = !menuOpen">
            <X v-if="menuOpen" class="w-6 h-6" />
            <Menu v-else class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Menu mobilne -->
      <div v-if="menuOpen" class="sm:hidden border-t border-indigo-600 px-4 py-3 space-y-3">
        <div class="flex items-center gap-2 text-indigo-200">
          <User class="w-4 h-4" />
          <span class="text-sm">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</span>
          <span class="text-xs bg-indigo-600 px-2 py-0.5 rounded-full">{{ roleBadge }}</span>
        </div>
        <button
          @click="handleLogout"
          class="flex items-center gap-1 text-sm text-indigo-200 hover:text-white"
        >
          <LogOut class="w-4 h-4" />
          Wyloguj
        </button>
      </div>
    </nav>

    <!-- Treść strony -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <router-view />
    </main>
  </div>
</template>
