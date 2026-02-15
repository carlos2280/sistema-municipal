import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig(() => {
  const { parsed, publicVars } = loadEnv({ prefixes: ['VITE_'] });

  return {
    plugins: [
      pluginReact(),
      pluginModuleFederation({
        name: 'mf_shell',
        dts: false,
        remotes: {
          mf_store: `mf_store@${parsed.VITE_MF_STORE_URL || 'http://localhost:5010/mf-manifest.json'}`,
          mf_ui: `mf_ui@${parsed.VITE_MF_UI_URL || 'http://localhost:5011/mf-manifest.json'}`,
          mf_contabilidad: `mf_contabilidad@${parsed.VITE_MF_CONTABILIDAD_URL || 'http://localhost:5020/mf-manifest.json'}`,
          mf_chat: `mf_chat@${parsed.VITE_MF_CHAT_URL || 'http://localhost:5021/mf-manifest.json'}`,
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
    source: { entry: { index: './src/main.tsx' }, define: publicVars },
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
