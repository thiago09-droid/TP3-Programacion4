import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { db } from "./db.js";
import {
  validarRegistro,
  validarLogin,
  verificarValidaciones,
  validarAutenticacion,
} from "./validaciones.js";

const router = express.Router();

// Configuración de Passport JWT
export function authConfig() {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || "clave_secreta_jwt_tp3_programacion4_utn",
  };

  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      try {
        const [usuarios] = await db.execute(
          "SELECT id, nombre, email FROM usuarios WHERE id = ?",
          [payload.userId]
        );

        if (usuarios.length === 0) {
          return next(null, false);
        }

        // Devolvemos el usuario autenticado (sin contraseña)
        next(null, usuarios[0]);
      } catch (err) {
        next(err, false);
      }
    })
  );
}

// POST /auth/registro: Registro de nuevo usuario
router.post("/registro", validarRegistro, verificarValidaciones, async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar si el email ya existe
    const [existente] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existente.length > 0) {
      return res.status(400).json({ mensaje: "El correo electrónico ya está registrado" });
    }

    // Encriptar contraseña con bcrypt (12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insertar nuevo usuario
    const [result] = await db.execute(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword]
    );

    // Retornar usuario registrado (NUNCA devolver la contraseña)
    res.status(201).json({
      id: result.insertId,
      nombre,
      email,
      mensaje: "Usuario registrado con éxito",
    });
  } catch (err) {
    console.error("Error en /auth/registro:", err);
    res.status(500).json({ mensaje: "Error interno del servidor al registrar usuario" });
  }
});

// POST /auth/login: Inicio de sesión
router.post("/login", validarLogin, verificarValidaciones, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const [usuarios] = await db.execute(
      "SELECT id, nombre, email, password FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const usuario = usuarios[0];

    // Verificar contraseña encriptada
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // Payload de JWT
    const payload = {
      userId: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
    };

    // Generar token JWT con expiración a las 4 horas (según consigna)
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "clave_secreta_jwt_tp3_programacion4_utn",
      { expiresIn: "4h" }
    );

    // Devolver token y datos seguros del usuario
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });
  } catch (err) {
    console.error("Error en /auth/login:", err);
    res.status(500).json({ mensaje: "Error interno del servidor al iniciar sesión" });
  }
});

// GET /auth/perfil: Obtener datos del usuario logueado
router.get("/perfil", validarAutenticacion, (req, res) => {
  res.json({ usuario: req.user });
});

export default router;
