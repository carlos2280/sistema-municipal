import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig(() => {
  const { publicVars } = loadEnv({ prefixes: ['VITE_'] });

  return {
    plugins: [
      pluginReact(),
      pluginModuleFederation({
        name: 'mf_store',
        dts: false,
        exposes: {
          './store': './src/store/index.ts',
        },
        shared: {
          react: { singleton: true, requiredVersion: false },
          'react-dom': { singleton: true, requiredVersion: false },
          'react-redux': { singleton: true, requiredVersion: false },
          '@reduxjs/toolkit': { singleton: true, requiredVersion: false },
        },
      }),
    ],
    source: { entry: { index: './src/main.tsx' }, define: publicVars },
    resolve: { alias: { '@': './src' } },
    server: {
      port: 5010,
      strictPort: true,
      host: '0.0.0.0',
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
    output: { distPath: { root: 'dist' } },
    html: { title: '[M] STORE' },
  };
});
