// src/types/vite-plugin-dts.d.ts
declare module "vite-plugin-dts" {
	import type { Plugin } from "vite";
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	export default function dts(options?: any): Plugin;
}
