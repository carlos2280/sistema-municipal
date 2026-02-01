import path from "node:path";
import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * mf_ui - Remote Application (UI Components)
 * Expone componentes UI y theme para ser consumidos por otros microfrontends
 */
const DEV_PORT = 5011;

export default defineConfig(({ mode }) => {
	const isDev = mode === "development";
	const isProduction = mode === "production";

	return {
		base: "/",
		plugins: [
			react(),
			federation({
				name: "mf_ui",
				filename: "remoteEntry.js",
				exposes: {
					// Theme system completo
					"./theme": "./src/theme/index.ts",
					// Todos los componentes
					"./components": "./src/components/index.ts",
					// Componentes atómicos individuales (para tree-shaking)
					"./atoms": "./src/components/atoms/index.ts",
					"./molecules": "./src/components/molecules/index.ts",
				},
				shared: ["react", "react-dom", "@mui/material", "@emotion/react", "@emotion/styled"],
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
