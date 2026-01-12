import type { IconName } from "lucide-react/dynamic";
export type MenuItem = {
	id: number;
	idSistema: number;
	idPadre: number | null;
	nombre: string;
	nivel: number;
	orden: number;
	createdAt: string;
	updatedAt: string;
	hijos: MenuItem[];
	componente: string;
	icono: IconName;
};

export type MenuSistema = {
	nombreSistema: string;
	menuRaiz: MenuItem[];
};
