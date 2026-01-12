export async function loadMicrofrontComponents(sistemaId: number) {
	switch (sistemaId) {
		case 1:
		case 2: {
			const contabilidad = await import("mf_contabilidad/routes").then(
				(mod) => mod.default,
			);
			return contabilidad;
		}
		default:
			return {
				sistemaId,
				components: {},
			};
	}
}
