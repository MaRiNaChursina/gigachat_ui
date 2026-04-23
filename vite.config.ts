import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
// Для GitHub Pages в подкаталоге: VITE_BASE_PATH=/имя-репозитория/ (с слэшем в конце).
function normalizeBase(input: string | undefined) {
  const s = input?.trim()
  if (!s || s === '/') return '/'
  const withLeading = s.startsWith('/') ? s : `/${s}`
  return withLeading.replace(/\/?$/, '/')
}

const base = normalizeBase(process.env.VITE_BASE_PATH)

export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [react()]

  if (mode === 'analyze') {
    plugins.push(
      visualizer({
        filename: 'docs/bundle-stats.html',
        gzipSize: true,
        brotliSize: true,
        open: false,
        template: 'treemap',
      }),
    )
  }

  return {
    base,
    plugins,
    // GigaChat / NGW не отдают CORS для origin браузера (localhost) — в dev проксируем на тот же хост, что и Vite.
    server: {
      proxy: {
        '/__proxy/gigachat/oauth': {
          target: 'https://ngw.devices.sberbank.ru:9443',
          changeOrigin: true,
          // NGW может отдавать цепочку, которую локальный Node не доверяет по умолчанию.
          // Для dev-прокси отключаем strict TLS валидацию, чтобы избежать
          // "self-signed certificate in certificate chain".
          secure: false,
          rewrite: () => '/api/v2/oauth',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const auth = req.headers.authorization
              if (auth) proxyReq.setHeader('Authorization', auth)
              const rq = req.headers['rquid']
              if (rq) proxyReq.setHeader('RqUID', Array.isArray(rq) ? rq[0] : rq)
            })
          },
        },
        '/__proxy/gigachat/api': {
          target: 'https://gigachat.devices.sberbank.ru',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/__proxy\/gigachat\/api/, '/api'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const auth = req.headers.authorization
              if (auth) proxyReq.setHeader('Authorization', auth)
            })
          },
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('react-markdown')) return 'react-markdown'
            if (id.includes('highlight.js')) return 'hljs'
            if (id.includes('react-router')) return 'react-router'
          },
        },
      },
    },
  }
})
