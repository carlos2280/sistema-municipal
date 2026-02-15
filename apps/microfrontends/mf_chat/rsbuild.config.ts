import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig(() => {
  const { parsed, publicVars } = loadEnv({ prefixes: ['VITE_'] });

  return {
    plugins: [
      pluginReact(),
      pluginModuleFederation({
        name: 'mf_chat',
        dts: false,
        exposes: {
          './ChatButton': './src/components/shared/ChatButton.tsx',
          './ChatDrawer': './src/components/ChatDrawer/index.ts',
        },
        remotes: {
          mf_store: `mf_store@${parsed.VITE_MF_STORE_URL || 'http://localhost:5010/mf-manifest.json'}`,
          mf_ui: `mf_ui@${parsed.VITE_MF_UI_URL || 'http://localhost:5011/mf-manifest.json'}`,
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
          'lucide-react': { singleton: true, requiredVersion: false },
          'socket.io-client': { singleton: true, requiredVersion: false },
          sonner: { singleton: true, requiredVersion: false },
        },
      }),
    ],
    source: { entry: { index: './src/main.tsx' }, define: publicVars },
    resolve: { alias: { '@': './src' } },
    server: {
      port: 5021,
      strictPort: true,
      host: '0.0.0.0',
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
    output: { distPath: { root: 'dist' } },
    html: { title: 'MF Chat - Sistema Municipal' },
  };
});
