import { db } from "../../config/client";
import { perfiles } from "../";
import type { DbExecutor } from "../../types/db";


export async function seedPerfiles(db: DbExecutor) {
    const datos = [
        { nombre: "Contador" },
        { nombre: "Cajero" },
        { nombre: "Invitado" },
    ];

    try {
        console.log("🌱 Insertando perfiles...");
        await db.insert(perfiles).values(datos);
        console.log("✅ seedPerfiles insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando seedPerfiles:", error);
        throw error; // Propaga el error para que lo capture el maestro
    }
}