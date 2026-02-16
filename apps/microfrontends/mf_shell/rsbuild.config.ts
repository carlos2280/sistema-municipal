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

  return {
    plugins: [
      pluginReact(),
      pluginModuleFederation({
        name: 'mf_shell',
        dts: false,
        remotes: {
          mf_store: `mf_store@${env('VITE_MF_STORE_URL', parsed, 'http://localhost:5010/mf-manifest.json')}`,
          mf_ui: `mf_ui@${env('VITE_MF_UI_URL', parsed, 'http://localhost:5011/mf-manifest.json')}`,
          mf_contabilidad: `mf_contabilidad@${env('VITE_MF_CONTABILIDAD_URL', parsed, 'http://localhost:5020/mf-manifest.json')}`,
          mf_chat: `mf_chat@${env('VITE_MF_CHAT_URL', parsed, 'http://localhost:5021/mf-manifest.json')}`,
        },
        shared: {
          react: { singleton: true, requiredVersion: false },
          'react-dom': { singleton: true, requiredVersion: false },
          '@mui/material': { singleton: true, requiredVersion: false },
          '@mui/icons-material': { singleton: true, requiredVersion: false },
          '@emotion/react': { singleton: true, requiredVersion: false },
          '@emotion/styled': { singleton: true, requiredVersion: false },
          'react-redux': { singleton: true, requiredVersion: false },
          '@reduxjs/toolkit': { singleton: true, requiredVersion: false },
          'socket.io-client': { singleton: true, requiredVersion: false },
        },
      }),
    ],
    source: { entry: { index: './src/main.tsx' }, define: { ...publicVars, ...processEnvDefines } },
    resolve: { alias: { '@': './src' } },
    server: { port: 5000, strictPort: true, host: '0.0.0.0' },
    output: { distPath: { root: 'dist' } },
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
