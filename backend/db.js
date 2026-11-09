import mysql from "mysql2/promise";

export let db = null;

// Conexión a la base de datos MySQL
export async function conectarDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_DATABASE || "gestion_transporte",
      port: Number(process.env.DB_PORT) || 3306,
    });
    console.log("Conectado a la base de datos MySQL (gestion_transporte)");
  } catch (e) {
    console.error("Error al conectar a la base de datos:", e.message);
  }
}
