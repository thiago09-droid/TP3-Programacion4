import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import authRouter, { authConfig } from "./auth.js";
import vehiculosRouter from "./vehiculos.js";
import conductoresRouter from "./conductores.js";
import viajesRouter from "./viajes.js";

// Conexión a la base de datos MySQL
conectarDB();

const app = express();
const port = process.env.PORT || 3000;

// Interpretar cuerpo de peticiones como JSON
app.use(express.json());

// Habilitar CORS para permitir peticiones desde el frontend Vite
app.use(cors());

// Configurar Passport con estrategia JWT
authConfig();

// Ruta raíz informativa
app.get("/", (req, res) => {
  res.json({
    nombre: "API de Gestión de Transporte",
    materia: "Programación IV - UTN TUP FRLaR",
    tp: "Trabajo Práctico N.º 3",
    estado: "Activo",
    endpoints: {
      auth: "/auth",
      vehiculos: "/vehiculos",
      conductores: "/conductores",
      viajes: "/viajes",
    },
  });
});

// Registrar routers de entidades
app.use("/auth", authRouter);
app.use("/vehiculos", vehiculosRouter);
app.use("/conductores", conductoresRouter);
app.use("/viajes", viajesRouter);

// Manejador para rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ mensaje: `Ruta ${req.originalUrl} no encontrada` });
});

// Manejador global de errores internos (500)
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res.status(500).json({
    mensaje: "Error interno del servidor",
    error: err.message,
  });
});

app.listen(port, () => {
  console.log(`Servidor backend ejecutándose en el puerto ${port}`);
});
