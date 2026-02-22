/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'qrcode.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{
    value: string
    size?: number
    level?: string
  }>
  export default component
}

declare module 'vue-qrcode-reader' {
  import type { DefineComponent } from 'vue'
  export const QrcodeStream: DefineComponent<{}>
  export const QrcodeDropZone: DefineComponent<{}>
  export const QrcodeCapture: DefineComponent<{}>
}