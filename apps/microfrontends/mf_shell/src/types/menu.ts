export type MenuItem = {
	id: number;
	idSistema: number;
	idPadre: number | null;
	nombre: string;
	nivel: number;
	orden: number;
	// path: string;
	// ruta: string;
	createdAt: string; // or Date if you parse it
	updatedAt: string; // or Date if you parse it
	hijos: MenuItem[];
	componente: string;
};
