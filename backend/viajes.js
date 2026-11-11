import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarId,
  validarFiltrosViajes,
  validarViaje,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET /viajes: Listado de viajes con filtros (por vehículo, conductor o fechas)
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosViajes,
  verificarValidaciones,
  async (req, res) => {
    try {
      const { vehiculo_id, conductor_id, desde, hasta } = req.query;
      const filtros = [];
      const parametros = [];

      if (vehiculo_id) {
        filtros.push("v.vehiculo_id = ?");
        parametros.push(Number(vehiculo_id));
      }

      if (conductor_id) {
        filtros.push("v.conductor_id = ?");
        parametros.push(Number(conductor_id));
      }

      if (desde) {
        filtros.push("v.fecha_salida >= ?");
        parametros.push(desde);
      }

      if (hasta) {
        filtros.push("v.fecha_salida <= ?");
        parametros.push(hasta);
      }

      let sql = `
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
          v.created_at,
          veh.marca AS vehiculo_marca,
          veh.modelo AS vehiculo_modelo,
          veh.patente AS vehiculo_patente,
          c.nombre AS conductor_nombre,
          c.apellido AS conductor_apellido,
          c.documento AS conductor_documento,
          c.licencia AS conductor_licencia
        FROM viajes v
        JOIN vehiculos veh ON v.vehiculo_id = veh.id
        JOIN conductores c ON v.conductor_id = c.id
      `;

      if (filtros.length > 0) {
        sql += " WHERE " + filtros.join(" AND ");
      }

      sql += " ORDER BY v.fecha_salida DESC";

      const [viajes] = await db.execute(sql, parametros);
      res.json(viajes);
    } catch (err) {
      console.error("Error en GET /viajes:", err);
      res.status(500).json({ mensaje: "Error al obtener viajes" });
    }
  }
);

// GET /viajes/:id: Detalle de un viaje
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
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
          v.created_at,
          veh.marca AS vehiculo_marca,
          veh.modelo AS vehiculo_modelo,
          veh.patente AS vehiculo_patente,
          c.nombre AS conductor_nombre,
          c.apellido AS conductor_apellido,
          c.documento AS conductor_documento,
          c.licencia AS conductor_licencia
        FROM viajes v
        JOIN vehiculos veh ON v.vehiculo_id = veh.id
        JOIN conductores c ON v.conductor_id = c.id
        WHERE v.id = ?
      `;

      const [viajes] = await db.execute(sql, [id]);

      if (viajes.length === 0) {
        return res.status(404).json({ mensaje: "Viaje no encontrado" });
      }

      res.json(viajes[0]);
    } catch (err) {
      console.error("Error en GET /viajes/:id:", err);
      res.status(500).json({ mensaje: "Error al obtener detalle del viaje" });
    }
  }
);

// POST /viajes: Registro de un nuevo viaje
router.post(
  "/",
  validarAutenticacion,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    try {
      const {
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada,
        origen,
        destino,
        kilometros,
        observaciones,
      } = req.body;

      // Verificar que el vehículo exista
      const [vehiculos] = await db.execute("SELECT id FROM vehiculos WHERE id = ?", [vehiculo_id]);
      if (vehiculos.length === 0) {
        return res.status(400).json({ mensaje: "El vehículo especificado no existe" });
      }

      // Verificar que el conductor exista
      const [conductores] = await db.execute("SELECT id FROM conductores WHERE id = ?", [conductor_id]);
      if (conductores.length === 0) {
        return res.status(400).json({ mensaje: "El conductor especificado no existe" });
      }

      const sql = `
        INSERT INTO viajes 
        (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(sql, [
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada || null,
        origen,
        destino,
        kilometros,
        observaciones || null,
      ]);

      res.status(201).json({
        id: result.insertId,
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada: fecha_llegada || null,
        origen,
        destino,
        kilometros,
        observaciones: observaciones || null,
        mensaje: "Viaje registrado con éxito",
      });
    } catch (err) {
      console.error("Error en POST /viajes:", err);
      res.status(500).json({ mensaje: "Error al registrar el viaje" });
    }
  }
);

// PUT /viajes/:id: Modificación de viaje
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const {
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada,
        origen,
        destino,
        kilometros,
        observaciones,
      } = req.body;

      // Verificar existencia del viaje
      const [viajes] = await db.execute("SELECT id FROM viajes WHERE id = ?", [id]);
      if (viajes.length === 0) {
        return res.status(404).json({ mensaje: "Viaje no encontrado" });
      }

      // Verificar vehículo
      const [vehiculos] = await db.execute("SELECT id FROM vehiculos WHERE id = ?", [vehiculo_id]);
      if (vehiculos.length === 0) {
        return res.status(400).json({ mensaje: "El vehículo especificado no existe" });
      }

      // Verificar conductor
      const [conductores] = await db.execute("SELECT id FROM conductores WHERE id = ?", [conductor_id]);
      if (conductores.length === 0) {
        return res.status(400).json({ mensaje: "El conductor especificado no existe" });
      }

      const sql = `
        UPDATE viajes SET 
          vehiculo_id = ?, 
          conductor_id = ?, 
          fecha_salida = ?, 
          fecha_llegada = ?, 
          origen = ?, 
          destino = ?, 
          kilometros = ?, 
          observaciones = ? 
        WHERE id = ?
      `;

      await db.execute(sql, [
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada || null,
        origen,
        destino,
        kilometros,
        observaciones || null,
        id,
      ]);

      res.json({
        id,
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada: fecha_llegada || null,
        origen,
        destino,
        kilometros,
        observaciones: observaciones || null,
        mensaje: "Viaje actualizado con éxito",
      });
    } catch (err) {
      console.error("Error en PUT /viajes/:id:", err);
      res.status(500).json({ mensaje: "Error al actualizar el viaje" });
    }
  }
);

// DELETE /viajes/:id: Eliminación de viaje
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [viajes] = await db.execute("SELECT id FROM viajes WHERE id = ?", [id]);
      if (viajes.length === 0) {
        return res.status(404).json({ mensaje: "Viaje no encontrado" });
      }

      await db.execute("DELETE FROM viajes WHERE id = ?", [id]);

      res.json({ mensaje: "Viaje eliminado con éxito", id });
    } catch (err) {
      console.error("Error en DELETE /viajes/:id:", err);
      res.status(500).json({ mensaje: "Error al eliminar el viaje" });
    }
  }
);

export default router;
