import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig(() => {
  const { publicVars } = loadEnv({ prefixes: ['VITE_'] });

  return {
    plugins: [
      pluginReact(),
      pluginModuleFederation({
        name: 'mf_ui',
        dts: false,
        exposes: {
          './theme': './src/theme/index.ts',
          './components': './src/components/index.ts',
          './atoms': './src/components/atoms/index.ts',
          './molecules': './src/components/molecules/index.ts',
        },
        shared: {
          react: { singleton: true, requiredVersion: false },
          'react-dom': { singleton: true, requiredVersion: false },
          '@mui/material': { singleton: true, requiredVersion: false },
          '@emotion/react': { singleton: true, requiredVersion: false },
          '@emotion/styled': { singleton: true, requiredVersion: false },
        },
      }),
    ],
    source: { entry: { index: './src/main.tsx' }, define: publicVars },
    resolve: { alias: { '@': './src' } },
    server: {
      port: 5011,
      strictPort: true,
      host: '0.0.0.0',
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
    output: { distPath: { root: 'dist' } },
    html: { title: '[M] UI' },
  };
});
