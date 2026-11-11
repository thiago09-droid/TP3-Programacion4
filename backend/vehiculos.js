import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarId,
  validarFiltrosVehiculos,
  validarVehiculo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET /vehiculos: Listado de vehículos con filtros opcionales
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosVehiculos,
  verificarValidaciones,
  async (req, res) => {
    try {
      const { marca, modelo, patente } = req.query;
      const filtros = [];
      const parametros = [];

      if (marca) {
        filtros.push("marca LIKE ?");
        parametros.push(`%${marca}%`);
      }
      if (modelo) {
        filtros.push("modelo LIKE ?");
        parametros.push(`%${modelo}%`);
      }
      if (patente) {
        filtros.push("patente LIKE ?");
        parametros.push(`%${patente}%`);
      }

      let sql = "SELECT id, marca, modelo, patente, anio, capacidad_carga, created_at FROM vehiculos";
      if (filtros.length > 0) {
        sql += " WHERE " + filtros.join(" AND ");
      }
      sql += " ORDER BY id DESC";

      const [vehiculos] = await db.execute(sql, parametros);
      res.json(vehiculos);
    } catch (err) {
      console.error("Error en GET /vehiculos:", err);
      res.status(500).json({ mensaje: "Error al obtener vehículos" });
    }
  }
);

// GET /vehiculos/:id: Detalle de un vehículo
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [vehiculos] = await db.execute(
        "SELECT id, marca, modelo, patente, anio, capacidad_carga, created_at FROM vehiculos WHERE id = ?",
        [id]
      );

      if (vehiculos.length === 0) {
        return res.status(404).json({ mensaje: "Vehículo no encontrado" });
      }

      res.json(vehiculos[0]);
    } catch (err) {
      console.error("Error en GET /vehiculos/:id:", err);
      res.status(500).json({ mensaje: "Error al obtener detalle del vehículo" });
    }
  }
);

// GET /vehiculos/:id/viajes: Historial de viajes del vehículo
router.get(
  "/:id/viajes",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      // Comprobar que el vehículo exista
      const [vehiculos] = await db.execute("SELECT id, marca, modelo, patente FROM vehiculos WHERE id = ?", [id]);
      if (vehiculos.length === 0) {
        return res.status(404).json({ mensaje: "Vehículo no encontrado" });
      }

      const sql = `
        SELECT 
          v.id,
          v.vehiculo_id,
          v.conductor_id,
          v.fecha_salida,
          v.fecha_llegada,
          v.origen,
          v.destino,
          v.kilometros,
          v.observaciones,
          c.nombre AS conductor_nombre,
          c.apellido AS conductor_apellido,
          c.documento AS conductor_documento,
          c.licencia AS conductor_licencia
        FROM viajes v
        JOIN conductores c ON v.conductor_id = c.id
        WHERE v.vehiculo_id = ?
        ORDER BY v.fecha_salida DESC
      `;

      const [viajes] = await db.execute(sql, [id]);
      res.json({
        vehiculo: vehiculos[0],
        viajes,
      });
    } catch (err) {
      console.error("Error en GET /vehiculos/:id/viajes:", err);
      res.status(500).json({ mensaje: "Error al obtener historial de viajes del vehículo" });
    }
  }
);

// GET /vehiculos/:id/kilometros: Cálculo total de kilómetros recorridos por vehículo
router.get(
  "/:id/kilometros",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [vehiculos] = await db.execute("SELECT id, marca, modelo, patente FROM vehiculos WHERE id = ?", [id]);
      if (vehiculos.length === 0) {
        return res.status(404).json({ mensaje: "Vehículo no encontrado" });
      }

      const sql = `
        SELECT 
          COALESCE(SUM(kilometros), 0) AS total_kilometros,
          COUNT(id) AS cantidad_viajes
        FROM viajes
        WHERE vehiculo_id = ?
      `;

      const [resultado] = await db.execute(sql, [id]);

      res.json({
        vehiculo_id: id,
        marca: vehiculos[0].marca,
        modelo: vehiculos[0].modelo,
        patente: vehiculos[0].patente,
        total_kilometros: Number(resultado[0].total_kilometros),
        cantidad_viajes: Number(resultado[0].cantidad_viajes),
      });
    } catch (err) {
      console.error("Error en GET /vehiculos/:id/kilometros:", err);
      res.status(500).json({ mensaje: "Error al calcular kilómetros del vehículo" });
    }
  }
);

// POST /vehiculos: Alta de vehículo
router.post(
  "/",
  validarAutenticacion,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    try {
      const { marca, modelo, patente, anio, capacidad_carga } = req.body;

      // Verificar si la patente ya existe
      const [existente] = await db.execute("SELECT id FROM vehiculos WHERE patente = ?", [patente]);
      if (existente.length > 0) {
        return res.status(400).json({ mensaje: "Ya existe un vehículo registrado con esa patente" });
      }

      const [result] = await db.execute(
        "INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)",
        [marca, modelo, patente.toUpperCase(), anio, capacidad_carga]
      );

      res.status(201).json({
        id: result.insertId,
        marca,
        modelo,
        patente: patente.toUpperCase(),
        anio,
        capacidad_carga,
        mensaje: "Vehículo creado con éxito",
      });
    } catch (err) {
      console.error("Error en POST /vehiculos:", err);
      res.status(500).json({ mensaje: "Error al crear vehículo" });
    }
  }
);

// PUT /vehiculos/:id: Modificación de vehículo
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { marca, modelo, patente, anio, capacidad_carga } = req.body;

      // Verificar que el vehículo exista
      const [vehiculos] = await db.execute("SELECT id FROM vehiculos WHERE id = ?", [id]);
      if (vehiculos.length === 0) {
        return res.status(404).json({ mensaje: "Vehículo no encontrado" });
      }

      // Verificar que la patente no pertenezca a otro vehículo
      const [existente] = await db.execute(
        "SELECT id FROM vehiculos WHERE patente = ? AND id != ?",
        [patente, id]
      );
      if (existente.length > 0) {
        return res.status(400).json({ mensaje: "La patente ya pertenece a otro vehículo registrado" });
      }

      await db.execute(
        "UPDATE vehiculos SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_carga = ? WHERE id = ?",
        [marca, modelo, patente.toUpperCase(), anio, capacidad_carga, id]
      );

      res.json({
        id,
        marca,
        modelo,
        patente: patente.toUpperCase(),
        anio,
        capacidad_carga,
        mensaje: "Vehículo actualizado con éxito",
      });
    } catch (err) {
      console.error("Error en PUT /vehiculos/:id:", err);
      res.status(500).json({ mensaje: "Error al actualizar vehículo" });
    }
  }
);

// DELETE /vehiculos/:id: Eliminación de vehículo
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      // Verificar que el vehículo exista
      const [vehiculos] = await db.execute("SELECT id FROM vehiculos WHERE id = ?", [id]);
      if (vehiculos.length === 0) {
        return res.status(404).json({ mensaje: "Vehículo no encontrado" });
      }

      // Verificar si tiene viajes asociados (integridad referencial)
      const [viajes] = await db.execute("SELECT id FROM viajes WHERE vehiculo_id = ?", [id]);
      if (viajes.length > 0) {
        return res.status(400).json({
          mensaje: "No se puede eliminar el vehículo porque tiene viajes registrados asociados",
        });
      }

      await db.execute("DELETE FROM vehiculos WHERE id = ?", [id]);

      res.json({ mensaje: "Vehículo eliminado con éxito", id });
    } catch (err) {
      console.error("Error en DELETE /vehiculos/:id:", err);
      res.status(500).json({ mensaje: "Error al eliminar vehículo" });
    }
  }
);

export default router;
