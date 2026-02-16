import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig(() => {
  const { publicVars } = loadEnv({ prefixes: ['VITE_'] });

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
    source: { entry: { index: './src/main.tsx' }, define: { ...publicVars, ...processEnvDefines } },
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
