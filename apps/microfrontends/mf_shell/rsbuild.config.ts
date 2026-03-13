import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

// Reads from process.env (Railway) first, then .env files (local), then fallback
const env = (key: string, parsed: Record<string, string>, fallback: string) =>
  process.env[key] || parsed[key] || fallback;

export default defineConfig(() => {
  const { parsed, publicVars } = loadEnv({ prefixes: ['VITE_'] });

  // Inject VITE_* from process.env into client bundle (import.meta.env.VITE_*)
  const processEnvDefines: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('VITE_')) {
      processEnvDefines[`import.meta.env.${key}`] = JSON.stringify(process.env[key]);
    }
  }

  // Mapa genérico de URLs de MFs: VITE_MF_XXX_URL → { mf_xxx: "http://..." }
  // Permite acceso dinámico en runtime sin hardcodear nombres de MFs.
  const allEnv: Record<string, string | undefined> = { ...parsed };
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith('VITE_MF_') && k.endsWith('_URL') && v) allEnv[k] = v;
  }
  const mfUrlMap: Record<string, string> = {};
  for (const [key, val] of Object.entries(allEnv)) {
    const match = key.match(/^VITE_(MF_.+)_URL$/);
    if (match && val) {
      mfUrlMap[match[1].toLowerCase()] = val;
    }
  }

  return {
    plugins: [
      pluginReact(),
      pluginModuleFederation({
        name: 'mf_shell',
        dts: false,
        remotes: {
          // Core remotes (siempre disponibles)
          mf_store: `mf_store@${env('VITE_MF_STORE_URL', parsed, 'http://localhost:5010/mf-manifest.json')}`,
          mf_ui: `mf_ui@${env('VITE_MF_UI_URL', parsed, 'http://localhost:5011/mf-manifest.json')}`,
          // mf_contabilidad, mf_chat y mf_configuracion se registran dinámicamente en runtime
          // según los módulos contratados por el tenant (ver dynamicModuleLoader.ts)
          mf_configuracion: `mf_configuracion@${env('VITE_MF_CONFIGURACION_URL', parsed, 'http://localhost:5040/mf-manifest.json')}`,
        },
        shared: {
          // eager:true en el host garantiza que el shared scope se inicializa
          // antes de que cualquier remote intente consumir estas libs (evita
          // "factory is undefined" en Module Federation con pnpm).
          react: { singleton: true, eager: true, requiredVersion: false },
          'react-dom': { singleton: true, eager: true, requiredVersion: false },
          '@mui/material': { singleton: true, eager: true, requiredVersion: false },
          '@mui/icons-material': { singleton: true, eager: true, requiredVersion: false },
          '@emotion/react': { singleton: true, eager: true, requiredVersion: false },
          '@emotion/styled': { singleton: true, eager: true, requiredVersion: false },
          'react-redux': { singleton: true, eager: true, requiredVersion: false },
          '@reduxjs/toolkit': { singleton: true, eager: true, requiredVersion: false },
          'socket.io-client': { singleton: true, requiredVersion: false },
          sonner: { singleton: true, eager: true, requiredVersion: false },
        },
      }),
    ],
    source: { entry: { index: './src/main.tsx' }, define: { ...publicVars, ...processEnvDefines, __MF_URL_MAP__: JSON.stringify(mfUrlMap) } },
    resolve: { alias: { '@': './src' } },
    server: { port: 5030, strictPort: true, host: '0.0.0.0' },
    output: { distPath: { root: 'dist' }, assetPrefix: 'auto' },
    html: {
      title: '[M] SHELL',
      favicon: './public/logo.svg',
      tags: [
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap' } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap' } },
      ],
    },
  };
});
