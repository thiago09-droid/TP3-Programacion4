import { body, param, query, validationResult } from "express-validator";
import passport from "passport";

// Middleware de autenticación con Passport JWT
export const validarAutenticacion = passport.authenticate("jwt", {
  session: false,
});

// Middleware para verificar los resultados de express-validator
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parámetros no válidos",
      errores: resultadoValidacion.array().map((err) => ({
        campo: err.path || err.param,
        mensaje: err.msg,
        valor: err.value,
      })),
    });
  }
  next();
};

// Validación de parámetro ID numérico
export const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero mayor a 0"),
];

// Validaciones de Autenticación
export const validarRegistro = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe proporcionar un email válido")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
];

export const validarLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe proporcionar un email válido")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];

// Validaciones para Vehículos
export const validarFiltrosVehiculos = [
  query("marca").optional().trim().isLength({ max: 50 }),
  query("modelo").optional().trim().isLength({ max: 50 }),
  query("patente").optional().trim().isLength({ max: 20 }),
];

export const validarVehiculo = [
  body("marca")
    .trim()
    .notEmpty()
    .withMessage("La marca es obligatoria")
    .isLength({ max: 50 })
    .withMessage("La marca no puede superar los 50 caracteres"),
  body("modelo")
    .trim()
    .notEmpty()
    .withMessage("El modelo es obligatorio")
    .isLength({ max: 50 })
    .withMessage("El modelo no puede superar los 50 caracteres"),
  body("patente")
    .trim()
    .notEmpty()
    .withMessage("La patente es obligatoria")
    .isLength({ min: 3, max: 20 })
    .withMessage("La patente debe tener entre 3 y 20 caracteres"),
  body("anio")
    .notEmpty()
    .withMessage("El año es obligatorio")
    .isInt({ min: 1900, max: 2100 })
    .withMessage("El año debe ser un número entre 1900 y 2100"),
  body("capacidad_carga")
    .notEmpty()
    .withMessage("La capacidad de carga es obligatoria")
    .isFloat({ min: 0.01 })
    .withMessage("La capacidad de carga debe ser un número positivo"),
];

// Validaciones para Conductores
export const validarFiltrosConductores = [
  query("buscar").optional().trim().isLength({ max: 50 }),
  query("documento").optional().trim().isLength({ max: 20 }),
];

export const validarConductor = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ max: 50 })
    .withMessage("El nombre no puede superar los 50 caracteres"),
  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .isLength({ max: 50 })
    .withMessage("El apellido no puede superar los 50 caracteres"),
  body("documento")
    .trim()
    .notEmpty()
    .withMessage("El número de documento es obligatorio")
    .isLength({ min: 4, max: 20 })
    .withMessage("El documento debe tener entre 4 y 20 caracteres"),
  body("licencia")
    .trim()
    .notEmpty()
    .withMessage("El número de licencia es obligatorio")
    .isLength({ min: 3, max: 30 })
    .withMessage("La licencia debe tener entre 3 y 30 caracteres"),
  body("fecha_alta_licencia")
    .notEmpty()
    .withMessage("La fecha de alta de licencia es obligatoria")
    .isISO8601()
    .withMessage("La fecha de alta debe tener formato de fecha válido (AAAA-MM-DD)"),
  body("fecha_vencimiento_licencia")
    .notEmpty()
    .withMessage("La fecha de vencimiento de licencia es obligatoria")
    .isISO8601()
    .withMessage("La fecha de vencimiento debe tener formato de fecha válido (AAAA-MM-DD)")
    .custom((val, { req }) => {
      if (req.body.fecha_alta_licencia && new Date(val) <= new Date(req.body.fecha_alta_licencia)) {
        throw new Error("La fecha de vencimiento debe ser posterior a la fecha de alta");
      }
      return true;
    }),
];

// Validaciones para Viajes
export const validarFiltrosViajes = [
  query("vehiculo_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("vehiculo_id debe ser un entero positivo"),
  query("conductor_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("conductor_id debe ser un entero positivo"),
  query("desde").optional().isISO8601().withMessage("desde debe tener formato de fecha válido"),
  query("hasta").optional().isISO8601().withMessage("hasta debe tener formato de fecha válido"),
];

export const validarViaje = [
  body("vehiculo_id")
    .notEmpty()
    .withMessage("El ID de vehículo es obligatorio")
    .isInt({ min: 1 })
    .withMessage("vehiculo_id debe ser un número entero mayor a 0"),
  body("conductor_id")
    .notEmpty()
    .withMessage("El ID de conductor es obligatorio")
    .isInt({ min: 1 })
    .withMessage("conductor_id debe ser un número entero mayor a 0"),
  body("fecha_salida")
    .notEmpty()
    .withMessage("La fecha de salida es obligatoria")
    .isISO8601()
    .withMessage("La fecha de salida debe tener formato válido"),
  body("fecha_llegada")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("La fecha de llegada debe tener formato válido")
    .custom((val, { req }) => {
      if (val && req.body.fecha_salida && new Date(val) < new Date(req.body.fecha_salida)) {
        throw new Error("La fecha de llegada no puede ser anterior a la fecha de salida");
      }
      return true;
    }),
  body("origen")
    .trim()
    .notEmpty()
    .withMessage("El origen es obligatorio")
    .isLength({ max: 100 })
    .withMessage("El origen no puede superar los 100 caracteres"),
  body("destino")
    .trim()
    .notEmpty()
    .withMessage("El destino es obligatorio")
    .isLength({ max: 100 })
    .withMessage("El destino no puede superar los 100 caracteres"),
  body("kilometros")
    .notEmpty()
    .withMessage("Los kilómetros son obligatorios")
    .isFloat({ min: 0.1 })
    .withMessage("Los kilómetros deben ser un número positivo"),
  body("observaciones")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Las observaciones no pueden superar los 500 caracteres"),
];
