import path from 'node:path'
import federation from '@originjs/vite-plugin-federation'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * mf_chat - Remote Application (Módulo de Chat)
 *
 * Expone COMPONENTES PUROS que heredan el contexto del host:
 * - ChatButton: Botón con badge de mensajes no leídos
 * - ChatDrawer: Drawer lateral con el chat completo
 *
 * Los componentes NO tienen Router ni ThemeProvider propios.
 * Heredan tema y estado del MF host (shell).
 *
 * Variables de entorno:
 * - VITE_PORT: Puerto del servidor (default: 5021)
 * - VITE_MF_STORE_URL: URL del remoteEntry.js de mf_store
 * - VITE_MF_UI_URL: URL del remoteEntry.js de mf_ui
 * - VITE_SOCKET_URL: URL del servidor Socket.IO
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'
  const isProduction = mode === 'production'

  return {
    base: '/',
    plugins: [
      react(),
      federation({
        name: 'mf_chat',
        filename: 'remoteEntry.js',
        exposes: {
          // Componentes puros que heredan contexto del host
          './ChatButton': './src/components/shared/ChatButton.tsx',
          './ChatDrawer': './src/components/ChatDrawer/index.ts',
        },
        remotes: {
          mf_store: env.VITE_MF_STORE_URL,
          mf_ui: env.VITE_MF_UI_URL,
        },
        shared: {
          react: {},
          'react-dom': {},
          '@mui/material': {},
          '@mui/icons-material': {},
          '@emotion/react': {},
          '@emotion/styled': {},
          'react-redux': {},
          '@reduxjs/toolkit': {},
          'lucide-react': {},
          'socket.io-client': {},
          sonner: {},
        },
      }),
    ],
    build: {
      target: 'esnext',
      minify: isProduction ? 'esbuild' : false,
      sourcemap: isDev,
      cssCodeSplit: true,
      modulePreload: false,
      outDir: 'dist',
      assetsDir: 'assets',
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 5021,
      strictPort: true,
      host: true,
      cors: true,
    },
    preview: {
      port: Number(env.VITE_PORT) || 5021,
      strictPort: true,
      host: true,
      cors: true,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@emotion/styled',
        '@mui/icons-material',
        'socket.io-client',
        'sonner',
      ],
    },
  }
})
