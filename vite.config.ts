import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { feedbackApiPlugin } from './server/viteFeedbackPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), feedbackApiPlugin()],
})
