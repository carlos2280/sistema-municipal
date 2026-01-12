import path from 'node:path';
import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/**
 * mf_contabilidad - Remote Application (Módulo de Contabilidad)
 * Expone componentes y rutas del módulo de contabilidad
 * También consume mf_store para acceso al estado global
 *
 * Variables de entorno requeridas:
 * - VITE_PORT: Puerto del servidor (default: 5020)
 * - VITE_MF_STORE_URL: URL del remoteEntry.js de mf_store
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  const isProduction = mode === 'production';

  return {
    base: '/',
    plugins: [
      react(),
      federation({
        name: 'mf_contabilidad',
        filename: 'remoteEntry.js',
        exposes: {
          './Button': './src/components/Button.tsx',
          './routes': './src/routes/routes.tsx',
          './components': './src/page/index.ts',
        },
        remotes: {
          mf_store: env.VITE_MF_STORE_URL,
        },
        shared: {
          react: {},
          'react-dom': {},
          '@mui/material': {},
          '@mui/icons-material': {},
          '@mui/x-tree-view': {},
          '@emotion/react': {},
          '@emotion/styled': {},
          'react-redux': {},
          '@reduxjs/toolkit': {},
          'react-hook-form': {},
          'lucide-react': {},
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
      port: Number(env.VITE_PORT) || 5020,
      strictPort: true,
      host: true,
      cors: true,
    },
    preview: {
      port: Number(env.VITE_PORT) || 5020,
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
        '@mui/x-tree-view',
        '@mui/icons-material',
        'react-hook-form',
        'sonner',
      ],
    },
  };
});
