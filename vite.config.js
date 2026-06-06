import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        products: resolve(__dirname, 'products.html'),
        whyUs: resolve(__dirname, 'why-us.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
})
