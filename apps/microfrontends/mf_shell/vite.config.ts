import path from "node:path";
import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/**
 * mf_shell - Host Application
 * Aplicación contenedora principal que consume los microfrontends remotos
 *
 * Variables de entorno requeridas:
 * - VITE_MF_STORE_URL: URL del remoteEntry.js de mf_store
 * - VITE_MF_UI_URL: URL del remoteEntry.js de mf_ui
 * - VITE_MF_CONTABILIDAD_URL: URL del remoteEntry.js de mf_contabilidad
 */
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const isDev = mode === "development";
	const isProduction = mode === "production";

	// URLs tomadas de variables de entorno
	const remoteUrls = {
		mf_store: env.VITE_MF_STORE_URL,
		mf_ui: env.VITE_MF_UI_URL,
		mf_contabilidad: env.VITE_MF_CONTABILIDAD_URL,
	};

	return {
		base: "/",
		plugins: [
			react(),
			federation({
				name: "mf_shell",
				remotes: remoteUrls,
				shared: {
					react: {},
					"react-dom": {},
					"@mui/material": {},
					"@emotion/react": {},
					"@emotion/styled": {},
					"react-redux": {},
					"@reduxjs/toolkit": {},
				},
			}),
		],
		assetsInclude: ["**/*.ttf", "**/*.woff", "**/*.woff2"],
		build: {
			target: "esnext",
			minify: isProduction ? "esbuild" : false,
			sourcemap: isDev,
			cssCodeSplit: true,
			modulePreload: false,
			outDir: "dist",
			assetsDir: "assets",
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		server: {
			port: Number(env.VITE_PORT) || 5000,
			strictPort: true,
			host: true,
			cors: true,
		},
		preview: {
			port: Number(env.VITE_PORT) || 5000,
			strictPort: true,
			host: true,
			cors: true,
		},
	};
});
