import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarId,
  validarFiltrosConductores,
  validarConductor,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET /conductores: Listado de conductores con filtro de búsqueda
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosConductores,
  verificarValidaciones,
  async (req, res) => {
    try {
      const { buscar, documento } = req.query;
      const filtros = [];
      const parametros = [];

      if (buscar) {
        filtros.push("(nombre LIKE ? OR apellido LIKE ? OR licencia LIKE ?)");
        parametros.push(`%${buscar}%`, `%${buscar}%`, `%${buscar}%`);
      }

      if (documento) {
        filtros.push("documento LIKE ?");
        parametros.push(`%${documento}%`);
      }

      let sql = `
        SELECT 
          id, 
          nombre, 
          apellido, 
          documento, 
          licencia, 
          DATE_FORMAT(fecha_alta_licencia, '%Y-%m-%d') AS fecha_alta_licencia, 
          DATE_FORMAT(fecha_vencimiento_licencia, '%Y-%m-%d') AS fecha_vencimiento_licencia, 
          created_at 
        FROM conductores
      `;

      if (filtros.length > 0) {
        sql += " WHERE " + filtros.join(" AND ");
      }
      sql += " ORDER BY id DESC";

      const [conductores] = await db.execute(sql, parametros);
      res.json(conductores);
    } catch (err) {
      console.error("Error en GET /conductores:", err);
      res.status(500).json({ mensaje: "Error al obtener conductores" });
    }
  }
);

// GET /conductores/:id: Detalle de un conductor
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
          id, 
          nombre, 
          apellido, 
          documento, 
          licencia, 
          DATE_FORMAT(fecha_alta_licencia, '%Y-%m-%d') AS fecha_alta_licencia, 
          DATE_FORMAT(fecha_vencimiento_licencia, '%Y-%m-%d') AS fecha_vencimiento_licencia, 
          created_at 
        FROM conductores 
        WHERE id = ?
      `;

      const [conductores] = await db.execute(sql, [id]);

      if (conductores.length === 0) {
        return res.status(404).json({ mensaje: "Conductor no encontrado" });
      }

      res.json(conductores[0]);
    } catch (err) {
      console.error("Error en GET /conductores/:id:", err);
      res.status(500).json({ mensaje: "Error al obtener detalle del conductor" });
    }
  }
);

// GET /conductores/:id/viajes: Historial de viajes del conductor
router.get(
  "/:id/viajes",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [conductores] = await db.execute(
        "SELECT id, nombre, apellido, documento, licencia FROM conductores WHERE id = ?",
        [id]
      );
      if (conductores.length === 0) {
        return res.status(404).json({ mensaje: "Conductor no encontrado" });
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
          veh.marca AS vehiculo_marca,
          veh.modelo AS vehiculo_modelo,
          veh.patente AS vehiculo_patente
        FROM viajes v
        JOIN vehiculos veh ON v.vehiculo_id = veh.id
        WHERE v.conductor_id = ?
        ORDER BY v.fecha_salida DESC
      `;

      const [viajes] = await db.execute(sql, [id]);
      res.json({
        conductor: conductores[0],
        viajes,
      });
    } catch (err) {
      console.error("Error en GET /conductores/:id/viajes:", err);
      res.status(500).json({ mensaje: "Error al obtener historial de viajes del conductor" });
    }
  }
);

// GET /conductores/:id/kilometros: Cálculo total de kilómetros recorridos por conductor
router.get(
  "/:id/kilometros",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [conductores] = await db.execute(
        "SELECT id, nombre, apellido, documento, licencia FROM conductores WHERE id = ?",
        [id]
      );
      if (conductores.length === 0) {
        return res.status(404).json({ mensaje: "Conductor no encontrado" });
      }

      const sql = `
        SELECT 
          COALESCE(SUM(kilometros), 0) AS total_kilometros,
          COUNT(id) AS cantidad_viajes
        FROM viajes
        WHERE conductor_id = ?
      `;

      const [resultado] = await db.execute(sql, [id]);

      res.json({
        conductor_id: id,
        nombre: conductores[0].nombre,
        apellido: conductores[0].apellido,
        documento: conductores[0].documento,
        licencia: conductores[0].licencia,
        total_kilometros: Number(resultado[0].total_kilometros),
        cantidad_viajes: Number(resultado[0].cantidad_viajes),
      });
    } catch (err) {
      console.error("Error en GET /conductores/:id/kilometros:", err);
      res.status(500).json({ mensaje: "Error al calcular kilómetros del conductor" });
    }
  }
);

// POST /conductores: Alta de conductor
router.post(
  "/",
  validarAutenticacion,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    try {
      const {
        nombre,
        apellido,
        documento,
        licencia,
        fecha_alta_licencia,
        fecha_vencimiento_licencia,
      } = req.body;

      // Verificar si documento ya existe
      const [docExistente] = await db.execute(
        "SELECT id FROM conductores WHERE documento = ?",
        [documento]
      );
      if (docExistente.length > 0) {
        return res.status(400).json({ mensaje: "Ya existe un conductor con ese número de documento" });
      }

      // Verificar si licencia ya existe
      const [licExistente] = await db.execute(
        "SELECT id FROM conductores WHERE licencia = ?",
        [licencia]
      );
      if (licExistente.length > 0) {
        return res.status(400).json({ mensaje: "Ya existe un conductor con ese número de licencia" });
      }

      const [result] = await db.execute(
        `INSERT INTO conductores 
         (nombre, apellido, documento, licencia, fecha_alta_licencia, fecha_vencimiento_licencia) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, apellido, documento, licencia, fecha_alta_licencia, fecha_vencimiento_licencia]
      );

      res.status(201).json({
        id: result.insertId,
        nombre,
        apellido,
        documento,
        licencia,
        fecha_alta_licencia,
        fecha_vencimiento_licencia,
        mensaje: "Conductor registrado con éxito",
      });
    } catch (err) {
      console.error("Error en POST /conductores:", err);
      res.status(500).json({ mensaje: "Error al registrar conductor" });
    }
  }
);

// PUT /conductores/:id: Modificación de conductor
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const {
        nombre,
        apellido,
        documento,
        licencia,
        fecha_alta_licencia,
        fecha_vencimiento_licencia,
      } = req.body;

      // Verificar existencia del conductor
      const [conductores] = await db.execute("SELECT id FROM conductores WHERE id = ?", [id]);
      if (conductores.length === 0) {
        return res.status(404).json({ mensaje: "Conductor no encontrado" });
      }

      // Verificar unicidad de documento
      const [docExistente] = await db.execute(
        "SELECT id FROM conductores WHERE documento = ? AND id != ?",
        [documento, id]
      );
      if (docExistente.length > 0) {
        return res.status(400).json({ mensaje: "El documento ya pertenece a otro conductor" });
      }

      // Verificar unicidad de licencia
      const [licExistente] = await db.execute(
        "SELECT id FROM conductores WHERE licencia = ? AND id != ?",
        [licencia, id]
      );
      if (licExistente.length > 0) {
        return res.status(400).json({ mensaje: "La licencia ya pertenece a otro conductor" });
      }

      await db.execute(
        `UPDATE conductores SET 
          nombre = ?, 
          apellido = ?, 
          documento = ?, 
          licencia = ?, 
          fecha_alta_licencia = ?, 
          fecha_vencimiento_licencia = ? 
        WHERE id = ?`,
        [nombre, apellido, documento, licencia, fecha_alta_licencia, fecha_vencimiento_licencia, id]
      );

      res.json({
        id,
        nombre,
        apellido,
        documento,
        licencia,
        fecha_alta_licencia,
        fecha_vencimiento_licencia,
        mensaje: "Conductor actualizado con éxito",
      });
    } catch (err) {
      console.error("Error en PUT /conductores/:id:", err);
      res.status(500).json({ mensaje: "Error al actualizar conductor" });
    }
  }
);

// DELETE /conductores/:id: Eliminación de conductor
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [conductores] = await db.execute("SELECT id FROM conductores WHERE id = ?", [id]);
      if (conductores.length === 0) {
        return res.status(404).json({ mensaje: "Conductor no encontrado" });
      }

      // Comprobar si tiene viajes asociados
      const [viajes] = await db.execute("SELECT id FROM viajes WHERE conductor_id = ?", [id]);
      if (viajes.length > 0) {
        return res.status(400).json({
          mensaje: "No se puede eliminar el conductor porque tiene viajes registrados asociados",
        });
      }

      await db.execute("DELETE FROM conductores WHERE id = ?", [id]);

      res.json({ mensaje: "Conductor eliminado con éxito", id });
    } catch (err) {
      console.error("Error en DELETE /conductores/:id:", err);
      res.status(500).json({ mensaje: "Error al eliminar conductor" });
    }
  }
);

export default router;
