# Trabajo Práctico N.º 3 - Programación IV
**Universidad Tecnológica Nacional – Facultad Regional La Rioja**  
**Tecnicatura Universitaria en Programación**  
**Docente:** Ing. Matías De la Puente  
**Tema:** Sistema de Gestión de Vehículos, Conductores y Viajes

---

##  Descripción del Proyecto

Aplicación Full-Stack desarrollada para una empresa de transporte y logística, que permite:
- Registrar y administrar la flota de **vehículos** (marca, modelo, patente, año, capacidad de carga).
- Administrar el legajo de **conductores** (nombre, apellido, documento, licencia, fechas de alta y vencimiento de licencia).
- Cargar, asociar y consultar el historial de **viajes** realizados entre choferes y unidades de transporte.
- **Calcular de forma automática el total de kilómetros recorridos** por cada vehículo o por cada conductor.
- Autenticación y autorización robusta basada en **JSON Web Tokens (JWT)** con **Passport** y contraseñas hasheadas con **bcrypt**.
- Validaciones completas tanto en el **Frontend** como en el **Backend** con **express-validator**.
- Diseño de interfaz moderno implementado en **React + Vite** utilizando **CSS puro** (sin librerías externas de diseño, según consigna).

---

##  Estructura del Repositorio

El proyecto se divide de forma limpia en dos módulos independientes:

```text
├── backend/
│   ├── .env.example              # Variables de entorno de ejemplo
│   ├── .env                      # Variables de entorno locales
│   ├── database.sql              # Definición de tablas y datos de prueba iniciales
│   ├── setup-db.js               # Script para inicializar la base de datos automáticamente
│   ├── db.js                     # Conexión a MySQL con mysql2/promise
│   ├── validaciones.js           # Validaciones con express-validator y middleware Passport
│   ├── auth.js                   # Estrategia Passport JWT, endpoints de login y registro
│   ├── vehiculos.js              # CRUD de vehículos, historial de viajes y cálculo de km
│   ├── conductores.js            # CRUD de conductores, historial de viajes y cálculo de km
│   ├── viajes.js                 # CRUD de viajes, asociación vehículo-conductor y filtros
│   ├── index.js                  # Servidor Express, CORS y middleware central de errores
│   ├── auth.http                 # Pruebas REST para autenticación
│   ├── vehiculos.http            # Pruebas REST para vehículos
│   ├── conductores.http          # Pruebas REST para conductores
│   ├── viajes.http               # Pruebas REST para viajes
│   └── package.json
│
├── frontend/
│   ├── index.html                # Plantilla base HTML
│   ├── vite.config.js            # Configuración de Vite
│   ├── src/
│   │   ├── main.jsx              # Configuración de rutas (React Router)
│   │   ├── index.css             # Estilos globales en CSS puro (responsivo y moderno)
│   │   ├── Auth.jsx              # AuthContext, persistencia de token y fetchAuth
│   │   ├── AuthLayout.jsx        # Protección de rutas privadas
│   │   ├── Layout.jsx            # Barra de navegación superior y contenedor
│   │   ├── Home.jsx              # Pantalla pública principal y accesos directos
│   │   ├── Login.jsx             # Formulario de inicio de sesión con validaciones
│   │   ├── Registro.jsx          # Formulario de alta de usuario
│   │   ├── Vehiculos.jsx         # Listado de vehículos y filtros de búsqueda
│   │   ├── VehiculoForm.jsx      # Alta y modificación de vehículos
│   │   ├── VehiculoDetalles.jsx  # Ficha técnica, cálculo total km e historial de viajes
│   │   ├── Conductores.jsx       # Listado de conductores y control de vigencia de licencias
│   │   ├── ConductorForm.jsx     # Alta y modificación de choferes
│   │   ├── ConductorDetalles.jsx # Ficha de chofer, cálculo total km e historial de viajes
│   │   ├── Viajes.jsx            # Listado de viajes, filtros y resumen de kilómetros
│   │   ├── ViajeForm.jsx         # Formulario de asignación de viaje (vehículo + chofer)
│   │   └── ViajeDetalles.jsx     # Detalle completo del viaje y observaciones
│   └── package.json
└── README.md
```

---

##  Tecnologías Utilizadas

- **Frontend:**
  - [React 19](https://react.dev/) + [Vite](https://vite.dev/)
  - [React Router 7](https://reactrouter.com/)
  - CSS Puro (sin frameworks ni librerías como Tailwind o Bootstrap)
  - Fetch API nativo para el consumo de la API REST

- **Backend:**
  - [Node.js](https://nodejs.org/) (módulos ES6)
  - [Express.js](https://expressjs.com/)
  - [mysql2/promise](https://github.com/sidorares/node-mysql2)
  - [express-validator](https://express-validator.github.io/)
  - [Passport.js](https://www.passportjs.org/) + [passport-jwt](http://www.passportjs.org/packages/passport-jwt/)
  - [bcrypt](https://github.com/kelektiv/node.bcrypt.js) para hashing seguro de contraseñas
  - [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (expiración a 4 horas)

- **Base de Datos:**
  - MySQL / MariaDB (con relaciones relacionales `FOREIGN KEY` e integridad referencial)

---

##  Puesta en Marcha

### 1. Configuración de la Base de Datos

1. Asegúrate de tener el servicio de MySQL activo en tu equipo.
2. Abre la carpeta `backend` y verifica tu archivo `.env`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASS=tu_contraseña_aqui
   DB_DATABASE=gestion_transporte
   JWT_SECRET=clave_secreta_jwt_tp3_programacion4_utn
   ```
3. Ejecuta el script de creación y carga de datos iniciales:
   ```bash
   cd backend
   npm run setup-db
   ```
   *También puedes importar directamente el archivo `backend/database.sql` desde MySQL Workbench o phpMyAdmin.*

### 2. Iniciar el Backend

```bash
cd backend
npm install
npm run dev
```
El servidor backend se iniciará en `http://localhost:3000`.

### 3. Iniciar el Frontend

En otra terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web se ejecutará en `http://localhost:5173`.

---

##  Credenciales de Prueba (Semilla de Datos)

El script SQL incluye datos iniciales para poder probar la aplicación inmediatamente:

- **Usuario:** `admin@transporte.com`
- **Contraseña:** `password123`

*(También puedes registrar un nuevo usuario desde la pantalla de Registro de la aplicación web o mediante la ruta `POST /auth/registro`)*

---

## 📡 Endpoints de la API REST

### Autenticación (`/auth`)
| Método | Endpoint | Descripción | Protegida |
|---|---|---|:---:|
| `POST` | `/auth/registro` | Registra un nuevo usuario (`nombre`, `email`, `password`) | No |
| `POST` | `/auth/login` | Inicia sesión y retorna token JWT (expira en 4h) | No |
| `GET` | `/auth/perfil` | Retorna los datos del usuario autenticado | Sí |

### Vehículos (`/vehiculos`)
| Método | Endpoint | Descripción | Protegida |
|---|---|---|:---:|
| `GET` | `/vehiculos` | Listado de vehículos (filtros: `marca`, `modelo`, `patente`) | Sí |
| `GET` | `/vehiculos/:id` | Detalle del vehículo por ID | Sí |
| `GET` | `/vehiculos/:id/viajes` | Historial de viajes realizados por el vehículo | Sí |
| `GET` | `/vehiculos/:id/kilometros` | **Cálculo total de kilómetros** recorridos por la unidad | Sí |
| `POST` | `/vehiculos` | Alta de nuevo vehículo | Sí |
| `PUT` | `/vehiculos/:id` | Modificación de datos del vehículo | Sí |
| `DELETE` | `/vehiculos/:id` | Eliminación de vehículo (valida integridad de viajes) | Sí |

### Conductores (`/conductores`)
| Método | Endpoint | Descripción | Protegida |
|---|---|---|:---:|
| `GET` | `/conductores` | Listado de choferes (filtro de búsqueda: `buscar`) | Sí |
| `GET` | `/conductores/:id` | Detalle del conductor por ID | Sí |
| `GET` | `/conductores/:id/viajes` | Historial de viajes realizados por el conductor | Sí |
| `GET` | `/conductores/:id/kilometros` | **Cálculo total de kilómetros** conducidos | Sí |
| `POST` | `/conductores` | Alta de conductor | Sí |
| `PUT` | `/conductores/:id` | Modificación de datos de conductor | Sí |
| `DELETE` | `/conductores/:id` | Eliminación de chofer (valida integridad de viajes) | Sí |

### Viajes (`/viajes`)
| Método | Endpoint | Descripción | Protegida |
|---|---|---|:---:|
| `GET` | `/viajes` | Listado con datos de vehículo y conductor asociados | Sí |
| `GET` | `/viajes/:id` | Detalle completo de un viaje específico | Sí |
| `POST` | `/viajes` | Registro de nuevo viaje asociando chofer y camión | Sí |
| `PUT` | `/viajes/:id` | Modificación de viaje existente | Sí |
| `DELETE` | `/viajes/:id` | Eliminación de viaje | Sí |

---

##  Pruebas con archivos `.http`

Dentro de la carpeta `backend/` se encuentran archivos `.http` listos para ser utilizados con la extensión **REST Client** de VS Code:
- `backend/auth.http`: Pruebas de registro, login válido/inválido y token.
- `backend/vehiculos.http`: Pruebas de CRUD, cálculo de kilómetros e historial.
- `backend/conductores.http`: Pruebas de CRUD, validación de fechas e historial.
- `backend/viajes.http`: Pruebas de asignación, consultas y filtros.

---

##  Cumplimiento de Criterios de Evaluación

1. **Estructura del proyecto (10 pts):** Separación nítida en carpetas `backend/` y `frontend/`, respetando fielmente las convenciones, nombres y patrones vistos en las clases del docente.
2. **Validación de datos (15 pts):** Implementación de `express-validator` en todas las rutas de obtención, creación y actualización, con códigos HTTP adecuados (400, 401, 403, 404, 500).
3. **Autenticación y autorización (20 pts):** Passport JWT middleware, expiración en 4 horas y protección de todas las operaciones CRUD.
4. **Persistencia de datos (15 pts):** Tablas normalizadas en MySQL con claves foráneas, restricciones y script de inicialización con datos.
5. **Interfaz de usuario (20 pts):** Navegación fluida con React Router, formularios interactivos con validación previa al envío, cálculo visual de kilómetros y visualización de viajes e historiales.
6. **Seguridad (10 pts):** Hashing de contraseñas con bcrypt (cost factor 12), no exposición de contraseñas en respuestas JSON y validación estricta de tokens.
7. **Commits y prolijidad (10 pts):** Historial progresivo de commits con mensajes descriptivos.
