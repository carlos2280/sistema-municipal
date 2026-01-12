import path from "node:path";
import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * mf_store - Remote Application (State Management)
 * Expone el store de Redux para ser consumido por otros microfrontends
 */
const DEV_PORT = 5010;

export default defineConfig(({ mode }) => {
	const isDev = mode === "development";
	const isProduction = mode === "production";

	return {
		base: "/",
		plugins: [
			react(),
			federation({
				name: "mf_store",
				filename: "remoteEntry.js",
				exposes: {
					"./store": "./src/store/index.ts",
				},
				shared: {
					react: {},
					"react-dom": {},
					"react-redux": {},
					"@reduxjs/toolkit": {},
				},
			}),
		],
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
			port: DEV_PORT,
			strictPort: true,
			host: true,
			cors: true,
		},
		preview: {
			port: DEV_PORT,
			strictPort: true,
			host: true,
			cors: true,
		},
	};
});
