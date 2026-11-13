import { Link } from "react-router";
import { useAuth } from "./Auth";

export function Home() {
  const { isAuthenticated, usuario } = useAuth();

  return (
    <div>
      <h1>Sistema de Gestión de Flota y Logística</h1>
      <p className="lead">
        Plataforma integral para el control de flota de vehículos, administración de conductores y seguimiento de viajes de larga distancia.
      </p>

      {isAuthenticated ? (
        <>
          <div className="alert alert-success">
            Bienvenido/a de nuevo, <strong>{usuario?.nombre}</strong>. Tenés acceso total para gestionar vehículos, conductores y viajes.
          </div>

          <h2>Acceso a Módulos</h2>
          <div className="cards-grid">
            <div className="card">
              <h3>🚛 Vehículos</h3>
              <p>Consultá el parque automotor, realizá altas, modificaciones y visualizá el historial de viajes y kilómetros recorridos por unidad.</p>
              <div style={{ marginTop: "16px" }}>
                <Link to="/vehiculos" className="btn">Ver Vehículos</Link>
              </div>
            </div>

            <div className="card">
              <h3>👨‍✈️ Conductores</h3>
              <p>Gestioná la nómina de choferes, controlá el vencimiento de licencias, viajes asignados y total de kilómetros conducidos.</p>
              <div style={{ marginTop: "16px" }}>
                <Link to="/conductores" className="btn">Ver Conductores</Link>
              </div>
            </div>

            <div className="card">
              <h3>🗺️ Viajes y Rutas</h3>
              <p>Registrá nuevos viajes asociando chofer y camión, realizá seguimiento de itinerarios y consultá métricas operativas.</p>
              <div style={{ marginTop: "16px" }}>
                <Link to="/viajes" className="btn">Ver Viajes</Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="cards-grid" style={{ marginBottom: "28px" }}>
            <div className="card">
              <h3>🚛 Flota de Transporte</h3>
              <p>Registro detallado de camiones y utilitarios con marca, modelo, patente, año y capacidad de carga.</p>
            </div>
            <div className="card">
              <h3>👤 Legajo de Conductores</h3>
              <p>Administración de choferes, documentos y control riguroso de vigencia de licencias de conducir.</p>
            </div>
            <div className="card">
              <h3>📊 Trazabilidad de Viajes</h3>
              <p>Asociación precisa de vehículos y choferes con cálculo automático de kilómetros recorridos e historial.</p>
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
            <h2>¿Querés comenzar a operar?</h2>
            <p style={{ color: "#64748b", marginBottom: "16px" }}>
              Iniciá sesión con tus credenciales o registrate para acceder al panel de control.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link to="/login" className="btn">Iniciar Sesión</Link>
              <Link to="/registro" className="btn btn-secondary">Crear Cuenta</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
