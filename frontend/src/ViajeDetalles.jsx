import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "./Auth";

export function ViajeDetalles() {
  const { id } = useParams();
  const [viaje, setViaje] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const { fetchAuth } = useAuth();

  const cargarViaje = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetchAuth(`http://localhost:3000/viajes/${id}`);
      if (!res.ok) throw new Error("No se pudo obtener el detalle del viaje");
      const data = await res.json();
      setViaje(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [id, fetchAuth]);

  useEffect(() => {
    cargarViaje();
  }, [cargarViaje]);

  if (cargando) return <p>Cargando detalles del viaje...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!viaje) return <div className="alert alert-warning">Viaje no encontrado.</div>;

  return (
    <div>
      <div className="header-actions">
        <h1>
          🗺️ Detalle del Viaje #{viaje.id}
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/viajes/${id}/editar`} className="btn btn-secondary">
            ✏️ Editar Viaje
          </Link>
          <Link to="/viajes" className="btn btn-secondary">
            Volver al Listado
          </Link>
        </div>
      </div>

      <div className="kpi-card">
        <div>
          <div className="kpi-title">Recorrido del Viaje</div>
          <div className="kpi-value" style={{ fontSize: "1.8rem" }}>
            {viaje.origen} ➔ {viaje.destino}
          </div>
        </div>
        <div>
          <div className="kpi-title">Distancia</div>
          <div className="kpi-value">
            {Number(viaje.kilometros).toLocaleString("es-AR")} km
          </div>
        </div>
      </div>

      <h2>Datos del Viaje</h2>
      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Fecha y Hora de Salida</span>
          <span className="detail-value">
            {new Date(viaje.fecha_salida).toLocaleString("es-AR")}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Fecha y Hora de Llegada</span>
          <span className="detail-value">
            {viaje.fecha_llegada ? (
              new Date(viaje.fecha_llegada).toLocaleString("es-AR")
            ) : (
              <span className="badge badge-warning">En tránsito / No registrada</span>
            )}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Vehículo Asignado</span>
          <span className="detail-value">
            <Link to={`/vehiculos/${viaje.vehiculo_id}`}>
              {viaje.vehiculo_marca} {viaje.vehiculo_modelo} ({viaje.vehiculo_patente})
            </Link>
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Conductor a Cargo</span>
          <span className="detail-value">
            <Link to={`/conductores/${viaje.conductor_id}`}>
              {viaje.conductor_nombre} {viaje.conductor_apellido} (Lic: {viaje.conductor_licencia})
            </Link>
          </span>
        </div>
      </div>

      <h2>Observaciones e Itinerario</h2>
      <div className="card">
        <p style={{ whiteSpace: "pre-wrap", color: viaje.observaciones ? "inherit" : "#64748b" }}>
          {viaje.observaciones || "No se registraron observaciones adicionales para este viaje."}
        </p>
      </div>
    </div>
  );
}
