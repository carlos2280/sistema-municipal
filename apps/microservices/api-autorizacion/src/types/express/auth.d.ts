export interface CustomJwtPayload extends jwt.JwtPayload {
    sistemaId: number;
    userId: number;
    email: string;
    nombre: string;
    areaId: number;
    tenantId: number;
    tenantSlug: string;
}