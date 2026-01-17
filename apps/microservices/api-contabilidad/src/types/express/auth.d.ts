import type { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
    sistemaId: number;
    userId: number;
    email: string;
    nombre: string;
    areaId: number;
}