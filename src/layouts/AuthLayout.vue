<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light auth-screen">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="text-center mb-4">
            <h1 class="text-primary fw-bold">
              <i class="bi bi-qr-code-scan me-2"></i>
              AttendMe
            </h1>
            <p class="text-muted">System sprawdzania obecności</p>
          </div>
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>