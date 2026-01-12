

import { CustomJwtPayload } from './auth'; // ajusta la ruta si es necesario

declare module 'express-serve-static-core' {
    interface Request {
        user?: CustomJwtPayload;
        tokenTemporal?: string; // 👈 Añadido
    }
}