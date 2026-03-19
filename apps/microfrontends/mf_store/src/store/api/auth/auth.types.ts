import type { MenuItem } from "../platform/platform.types";
export type { MenuItem };

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

export type Login = {
	correo: string;
	contrasena: string;
	areaId?: number;
	sistemaId?: number;
	tenantSlug?: string;
	mfaCode?: string;
};

export type MfaRequiredResponse = {
	mfaRequired: true;
	userId: number;
};

// El backend envió email con link de enrollment y retorna setupToken para setup inline.
export type MfaSetupPendingResponse = {
	mfaSetupPending: true;
	userId: number;
	setupToken: string;
};

export type MfaSetupIniciarResponse = {
	qrDataUrl: string;
	secret: string;
	otpauthUri: string;
};

// activarMfa solo activa MFA; el login completo ocurre en paso posterior.
export type MfaSetupActivarResponse = {
	backupCodes: string[];
};

export type LoginAreas = {
	correo: string;
	contrasena: string;
};

export type Areas = {
	id: number;
	nombre: string;
	descripcion: string | null;
};

export type SistemaLogin = {
	id: number;
	nombre: string;
	codigo: string;
};

export type ContrasenaTemporal = {
	correo: string;
	contrasenaTemporal: string;
	contrasenaNueva: string;
};

export type CambiarSistemaResponse = {
	sistemaId: number;
	menu: {
		nombreSistema: string;
		codigoSistema: string;
		menuRaiz: MenuItem[];
	};
};
