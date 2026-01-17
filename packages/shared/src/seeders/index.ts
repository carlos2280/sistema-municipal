import { fileURLToPath } from "node:url";
import { closeDB, db } from "../config/client";
import { seedAreas } from "./areas.seeder";
import { seedDepartamentos } from "./departamentos.seeder";
import { seedDirecciones } from "./direcciones.seeder";
import { seedMenus } from "./menus.seeder";
import { seedCuentasSubgrupos } from "./mod_contabilidad/cuentasSubgrupos.seeder";
import { seedPlanesCuentas } from "./mod_contabilidad/planesCuentas.seeder";
import { seedTitulosCuentas } from "./mod_contabilidad/titulosCuentas.seeder";
import { seedOficinas } from "./oficinas.seeder";
import { seedPerfilAreaUsuario } from "./perfilAreaUsuario.seeder";
import { seedPerfiles } from "./perfiles.seeder";
import { seedSistemaPerfil } from "./sistemaPerfil.seeder";
import { seedSistemas } from "./sistemas.seeder";
import { seedUsuarios } from "./usuarios.seeder";
export async function runAllSeeders() {
    try {
        // Iniciar transacción (opcional pero recomendado)
        await db.transaction(async (tx) => {
            console.log("🏁 Iniciando ejecución de todos los seeders...");
            // API--->identidad
            await seedDirecciones(tx);
            await seedDepartamentos(tx);
            await seedOficinas(tx);
            await seedUsuarios(tx);
            await seedPerfiles(tx);
            await seedAreas(tx);
            await seedSistemas(tx);
            await seedMenus(tx);
            await seedPerfilAreaUsuario(tx);
            await seedSistemaPerfil(tx);


            // API--->Contabilidad

            await seedTitulosCuentas(tx);
            await seedCuentasSubgrupos(tx);
            await seedPlanesCuentas(tx);

            console.log("🎉 Todos los seeders ejecutados correctamente");
        });
    } catch (error) {
        console.error("❌ Error al ejecutar seeders:", error);
        process.exit(1);
    } finally {
        await closeDB(); // Cierra la conexión si es necesario
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runAllSeeders();
}