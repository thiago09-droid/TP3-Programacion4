import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "./Auth";

export function ConductorDetalles() {
  const { id } = useParams();
  const [conductor, setConductor] = useState(null);
  const [viajes, setViajes] = useState([]);
  const [totales, setTotales] = useState({ total_kilometros: 0, cantidad_viajes: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const { fetchAuth } = useAuth();

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      // 1. Obtener viajes e info de conductor
      const resViajes = await fetchAuth(`http://localhost:3000/conductores/${id}/viajes`);
      if (!resViajes.ok) throw new Error("No se pudo obtener el historial del conductor");
      const dataViajes = await resViajes.json();
      setConductor(dataViajes.conductor);
      setViajes(dataViajes.viajes);

      // 2. Obtener cálculo total de kilómetros
      const resKm = await fetchAuth(`http://localhost:3000/conductores/${id}/kilometros`);
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

  if (cargando) return <p>Cargando detalles del conductor...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!conductor) return <div className="alert alert-warning">Conductor no encontrado.</div>;

  return (
    <div>
      <div className="header-actions">
        <h1>
          👨‍✈️ {conductor.nombre} {conductor.apellido}
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/conductores/${id}/editar`} className="btn btn-secondary">
            ✏️ Editar Conductor
          </Link>
          <Link to={`/viajes/nuevo?conductor_id=${id}`} className="btn">
            ➕ Asignar Viaje
          </Link>
          <Link to="/conductores" className="btn btn-secondary">
            Volver
          </Link>
        </div>
      </div>

      {/* KPI de Kilómetros Totales (Requerimiento del TP3) */}
      <div className="kpi-card">
        <div>
          <div className="kpi-title">Cálculo Total de Kilómetros Conducidos</div>
          <div className="kpi-value">
            {Number(totales.total_kilometros).toLocaleString("es-AR")} km
          </div>
        </div>
        <div>
          <div className="kpi-title">Viajes Completados</div>
          <div className="kpi-value">{totales.cantidad_viajes}</div>
        </div>
      </div>

      {/* Ficha del Conductor */}
      <h2>Datos del Conductor</h2>
      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Nombre Completo</span>
          <span className="detail-value">{conductor.nombre} {conductor.apellido}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Documento</span>
          <span className="detail-value">{conductor.documento}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Número de Licencia</span>
          <span className="detail-value">
            <span className="badge badge-info">{conductor.licencia}</span>
          </span>
        </div>
      </div>

      {/* Historial de Viajes */}
      <h2>Historial de Viajes Realizados</h2>
      {viajes.length === 0 ? (
        <div className="alert alert-warning">
          Este conductor aún no tiene viajes registrados en el sistema.
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha Salida</th>
                <th>Fecha Llegada</th>
                <th>Vehículo</th>
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
                    <Link to={`/vehiculos/${v.vehiculo_id}`}>
                      {v.vehiculo_marca} {v.vehiculo_modelo} ({v.vehiculo_patente})
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
