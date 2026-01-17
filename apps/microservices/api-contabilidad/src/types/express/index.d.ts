import type { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
    sistemaId: number;
    userId: number;
    email: string;
    nombre: string;
    areaId: number;
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: CustomJwtPayload;
        tokenTemporal?: string;
    }
}