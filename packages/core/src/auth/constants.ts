/**
 * Constantes de seguridad compartidas entre microservicios.
 * Centralizar aquí evita valores distintos por servicio.
 */

/** Rounds de bcrypt. Mínimo 12 para resistencia a fuerza bruta. */
export const BCRYPT_ROUNDS = 12;
