import type { IconName } from "lucide-react/dynamic";

export interface ActiveModuleResponse {
	codigo: string;
	nombre: string;
	mfName: string | null;
	mfManifestUrlTpl: string | null;
	icono: string | null;
	apiPrefix: string;
}

export type UsuarioConMenuResponse = {
	usuario: {
		otro: string;
		id: number;
		email: string;
		nombreCompleto: string;
	};
	modulosActivos?: ActiveModuleResponse[];
	menu: MenuItem[];
	token: string;
};

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

export type Login = {
	correo: string;
	contrasena: string;
	areaId?: number;
	sistemaId?: number;
	tenantSlug?: string;
};

export type LoginAreas = {
	correo: string;
	contrasena: string;
};

export type Areas = {
	id: number;
	nombre: string;
};

export type ContrasenaTemporal = {
	correo: string;
	contrasenaTemporal: string;
	contrasenaNueva: string;
};
