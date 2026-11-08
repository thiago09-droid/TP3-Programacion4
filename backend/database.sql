-- Script SQL para Trabajo Práctico N.º 3 - Programación IV (UTN FRLaR)
-- Sistema de Gestión de Vehículos, Conductores y Viajes

CREATE DATABASE IF NOT EXISTS `gestion_transporte` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `gestion_transporte`;

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Vehículos
CREATE TABLE IF NOT EXISTS `vehiculos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `marca` VARCHAR(50) NOT NULL,
  `modelo` VARCHAR(50) NOT NULL,
  `patente` VARCHAR(20) NOT NULL UNIQUE,
  `anio` INT NOT NULL,
  `capacidad_carga` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Conductores
CREATE TABLE IF NOT EXISTS `conductores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL,
  `apellido` VARCHAR(50) NOT NULL,
  `documento` VARCHAR(20) NOT NULL UNIQUE,
  `licencia` VARCHAR(30) NOT NULL UNIQUE,
  `fecha_alta_licencia` DATE NOT NULL,
  `fecha_vencimiento_licencia` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Viajes
CREATE TABLE IF NOT EXISTS `viajes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vehiculo_id` INT NOT NULL,
  `conductor_id` INT NOT NULL,
  `fecha_salida` DATETIME NOT NULL,
  `fecha_llegada` DATETIME NULL,
  `origen` VARCHAR(100) NOT NULL,
  `destino` VARCHAR(100) NOT NULL,
  `kilometros` DECIMAL(10,2) NOT NULL,
  `observaciones` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_viajes_vehiculo` 
    FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_viajes_conductor` 
    FOREIGN KEY (`conductor_id`) REFERENCES `conductores` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de prueba iniciales
-- Usuario por defecto: admin@transporte.com / Contraseña: password123
-- Hash bcrypt para 'password123':
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`) VALUES
(1, 'Administrador', 'admin@transporte.com', '$2b$12$K1S47zG55u4U5U8e84mP5eOQzT7nJdC5/4z2h62.3b4Jg5Z0gL6m2')
ON DUPLICATE KEY UPDATE `nombre`=`nombre`;

-- Vehículos iniciales
INSERT INTO `vehiculos` (`id`, `marca`, `modelo`, `patente`, `anio`, `capacidad_carga`) VALUES
(1, 'Mercedes-Benz', 'Actros 2651', 'AF123AA', 2023, 24000.00),
(2, 'Scania', 'R450', 'AE456BB', 2022, 28000.00),
(3, 'Volvo', 'FH 540', 'AD789CC', 2021, 30000.00),
(4, 'Iveco', 'Stralis Hi-Way', 'AC321DD', 2020, 22000.00)
ON DUPLICATE KEY UPDATE `marca`=`marca`;

-- Conductores iniciales
INSERT INTO `conductores` (`id`, `nombre`, `apellido`, `documento`, `licencia`, `fecha_alta_licencia`, `fecha_vencimiento_licencia`) VALUES
(1, 'Carlos', 'Gómez', '30123456', 'LIC-00123', '2018-03-15', '2027-03-15'),
(2, 'Martín', 'Rodríguez', '32987654', 'LIC-00456', '2019-06-20', '2026-12-30'),
(3, 'Esteban', 'Pérez', '28456123', 'LIC-00789', '2015-01-10', '2025-05-10'),
(4, 'Juan', 'Fernández', '35654321', 'LIC-00999', '2021-08-01', '2028-08-01')
ON DUPLICATE KEY UPDATE `nombre`=`nombre`;

-- Viajes iniciales
INSERT INTO `viajes` (`id`, `vehiculo_id`, `conductor_id`, `fecha_salida`, `fecha_llegada`, `origen`, `destino`, `kilometros`, `observaciones`) VALUES
(1, 1, 1, '2026-11-01 08:00:00', '2026-11-01 18:30:00', 'La Rioja', 'Córdoba', 440.00, 'Entrega de repuestos sin novedades.'),
(2, 2, 2, '2026-11-03 06:00:00', '2026-11-04 14:00:00', 'Córdoba', 'Buenos Aires', 700.00, 'Carga pesada. Parada en Rosario para descanso.'),
(3, 1, 1, '2026-11-05 09:00:00', '2026-11-05 16:00:00', 'Córdoba', 'La Rioja', 440.00, 'Retorno con carga liviana.'),
(4, 3, 3, '2026-11-07 07:30:00', '2026-11-07 20:00:00', 'La Rioja', 'Mendoza', 580.00, 'Ruta en excelente estado.')
ON DUPLICATE KEY UPDATE `origen`=`origen`;
