import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Content-Security-Policy aplicada só no build de produção (no dev o HMR do Vite
// usa scripts inline e a CSP atrapalharia). O script-src 'self' bloqueia scripts
// injetados, dificultando roubo do token do localStorage via XSS.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "connect-src 'self' https:",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ')

const cspPlugin = {
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml() {
    return [{
      tag: 'meta',
      attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
      injectTo: 'head-prepend',
    }]
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [cspPlugin, react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/cred': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
