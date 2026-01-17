import type { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
    sistemaId: number;
    userId: number;
    email: string;
    nombre: string;
    areaId: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: CustomJwtPayload;
            tokenTemporal?: string;
        }
    }
}
