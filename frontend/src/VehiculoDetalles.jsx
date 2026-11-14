import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "./Auth";

export function VehiculoDetalles() {
  const { id } = useParams();
  const [vehiculo, setVehiculo] = useState(null);
  const [viajes, setViajes] = useState([]);
  const [totales, setTotales] = useState({ total_kilometros: 0, cantidad_viajes: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const { fetchAuth } = useAuth();

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      // 1. Obtener viajes e info de vehículo
      const resViajes = await fetchAuth(`http://localhost:3000/vehiculos/${id}/viajes`);
      if (!resViajes.ok) throw new Error("No se pudo obtener el historial del vehículo");
      const dataViajes = await resViajes.json();
      setVehiculo(dataViajes.vehiculo);
      setViajes(dataViajes.viajes);

      // 2. Obtener cálculo total de kilómetros
      const resKm = await fetchAuth(`http://localhost:3000/vehiculos/${id}/kilometros`);
      if (resKm.ok) {
        const dataKm = await resKm.json();
        setTotales(dataKm);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [id, fetchAuth]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  if (cargando) return <p>Cargando detalles del vehículo...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!vehiculo) return <div className="alert alert-warning">Vehículo no encontrado.</div>;

  return (
    <div>
      <div className="header-actions">
        <h1>
          🚛 {vehiculo.marca} {vehiculo.modelo}
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/vehiculos/${id}/editar`} className="btn btn-secondary">
            ✏️ Editar Vehículo
          </Link>
          <Link to={`/viajes/nuevo?vehiculo_id=${id}`} className="btn">
            ➕ Asignar Viaje
          </Link>
          <Link to="/vehiculos" className="btn btn-secondary">
            Volver
          </Link>
        </div>
      </div>

      {/* KPI de Kilómetros Totales (Requerimiento del TP3) */}
      <div className="kpi-card">
        <div>
          <div className="kpi-title">Cálculo Total de Kilómetros Recorridos</div>
          <div className="kpi-value">
            {Number(totales.total_kilometros).toLocaleString("es-AR")} km
          </div>
        </div>
        <div>
          <div className="kpi-title">Viajes Registrados</div>
          <div className="kpi-value">{totales.cantidad_viajes}</div>
        </div>
      </div>

      {/* Ficha Técnica */}
      <h2>Ficha Técnica del Vehículo</h2>
      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Marca</span>
          <span className="detail-value">{vehiculo.marca}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Modelo</span>
          <span className="detail-value">{vehiculo.modelo}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Patente</span>
          <span className="detail-value">
            <span className="badge badge-info">{vehiculo.patente}</span>
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Año</span>
          <span className="detail-value">{vehiculo.anio}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Capacidad de Carga</span>
          <span className="detail-value">
            {Number(vehiculo.capacidad_carga).toLocaleString("es-AR")} kg
          </span>
        </div>
      </div>

      {/* Historial de Viajes */}
      <h2>Historial de Viajes Realizados</h2>
      {viajes.length === 0 ? (
        <div className="alert alert-warning">
          Este vehículo todavía no registra viajes realizados.
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha Salida</th>
                <th>Fecha Llegada</th>
                <th>Conductor</th>
                <th>Trayecto</th>
                <th>Kilómetros</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {viajes.map((v) => (
                <tr key={v.id}>
                  <td><strong>#{v.id}</strong></td>
                  <td>{new Date(v.fecha_salida).toLocaleString("es-AR")}</td>
                  <td>
                    {v.fecha_llegada
                      ? new Date(v.fecha_llegada).toLocaleString("es-AR")
                      : <span className="badge badge-warning">En curso</span>}
                  </td>
                  <td>
                    <Link to={`/conductores/${v.conductor_id}`}>
                      {v.conductor_nombre} {v.conductor_apellido}
                    </Link>
                  </td>
                  <td>
                    <strong>{v.origen}</strong> ➔ <strong>{v.destino}</strong>
                  </td>
                  <td><strong>{Number(v.kilometros).toLocaleString("es-AR")} km</strong></td>
                  <td>{v.observaciones || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
