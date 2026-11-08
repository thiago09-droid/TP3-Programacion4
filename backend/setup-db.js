import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const passwordsToTry = [
  process.env.DB_PASS,
  "root",
  "1234",
  "123456",
  "admin",
  "mysql",
  "12345678",
  "root1234",
  "utn"
].filter((p) => p !== undefined && p !== "");

async function ejecutarSetup() {
  console.log("Buscando contraseña de MySQL root...");

  let connection = null;
  let correctPassword = null;

  for (const pass of passwordsToTry) {
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: pass,
        port: Number(process.env.DB_PORT) || 3306,
        multipleStatements: true,
      });
      correctPassword = pass;
      console.log(`✓ Conexión exitosa a MySQL con la contraseña: "${pass}"`);
      break;
    } catch (e) {
      // Intento fallido
    }
  }

  if (!connection) {
    console.log("No se pudo conectar con las contraseñas comunes. Recuerda configurar DB_PASS en tu archivo .env");
    return;
  }

  try {
    const sqlPath = path.join(__dirname, "database.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    console.log("Ejecutando script database.sql...");
    await connection.query(sql);

    console.log("✓ Base de datos 'gestion_transporte' y tablas creadas exitosamente con datos de prueba.");

    // Actualizar .env con la contraseña correcta
    const envPath = path.join(__dirname, ".env");
    let envContent = fs.readFileSync(envPath, "utf-8");
    envContent = envContent.replace(/^DB_PASS=.*$/m, `DB_PASS=${correctPassword}`);
    fs.writeFileSync(envPath, envContent);
    console.log("✓ Archivo .env actualizado con DB_PASS=" + correctPassword);

    await connection.end();
  } catch (error) {
    console.error("✗ Error al configurar la base de datos:", error.message);
  }
}

ejecutarSetup();
