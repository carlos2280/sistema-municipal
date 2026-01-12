// utils/token.ts
import { loadEnv } from '@/config/env';
import jwt from 'jsonwebtoken';
const { JWT_SECRET_TEMP } = loadEnv();
// const JWT_SECRET = process.env.JWT_SECRET || 'secreto-ultra-seguro';
const JWT_SECRET = JWT_SECRET_TEMP || 'secreto-ultra-seguro'; // fallback por seguridad


export const generarTokenTemporal = (correo: string) => {
    const payload = { correo };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};
