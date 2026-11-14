import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "./Auth";

export function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [filtros, setFiltros] = useState({
    vehiculo_id: "",
    conductor_id: "",
  });
  const { fetchAuth } = useAuth();

  // Cargar lista de vehículos y conductores para los selectores de filtro
  useEffect(() => {
    async function cargarOpciones() {
      try {
        const [resVeh, resCond] = await Promise.all([
          fetchAuth("http://localhost:3000/vehiculos"),
          fetchAuth("http://localhost:3000/conductores"),
        ]);
        if (resVeh.ok) setVehiculos(await resVeh.json());
        if (resCond.ok) setConductores(await resCond.json());
      } catch (err) {
        console.error("Error al cargar opciones de filtro:", err);
      }
    }
    cargarOpciones();
  }, [fetchAuth]);

  // Cargar lista de viajes con filtros
  const cargarViajes = useCallback(async () => {
    setCargando(true);
    try {
      const url = new URL("http://localhost:3000/viajes");
      if (filtros.vehiculo_id) url.searchParams.append("vehiculo_id", filtros.vehiculo_id);
      if (filtros.conductor_id) url.searchParams.append("conductor_id", filtros.conductor_id);

      const res = await fetchAuth(url);
      if (!res.ok) throw new Error("No se pudo obtener el listado de viajes");
      const data = await res.json();
      setViajes(data);
    } catch (err) {
      setMensaje({ tipo: "danger", texto: err.message });
    } finally {
      setCargando(false);
    }
  }, [fetchAuth, filtros]);

  useEffect(() => {
    cargarViajes();
  }, [cargarViajes]);

  const handleEliminar = async (id) => {
    const seguro = window.confirm(`¿Está seguro de eliminar el viaje #${id}?`);
    if (!seguro) return;

    try {
      const res = await fetchAuth(`http://localhost:3000/viajes/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al eliminar el viaje");

      setMensaje({ tipo: "success", texto: "Viaje eliminado con éxito." });
      cargarViajes();
    } catch (err) {
      setMensaje({ tipo: "danger", texto: err.message });
    }
  };

  // Cálculo total de kilómetros de los viajes visualizados actualmente
  const totalKmVisualizados = viajes.reduce(
    (acc, v) => acc + (Number(v.kilometros) || 0),
    0
  );

  return (
    <div>
      <div className="header-actions">
        <h1>Gestión y Registro de Viajes</h1>
        <Link to="/viajes/nuevo" className="btn">
          ➕ Registrar Nuevo Viaje
        </Link>
      </div>

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      {/* KPI de Kilómetros Totales en los viajes filtrados */}
      <div className="kpi-card" style={{ marginBottom: "16px" }}>
        <div>
          <div className="kpi-title">Total Kilómetros (Filtro Actual)</div>
          <div className="kpi-value">
            {totalKmVisualizados.toLocaleString("es-AR")} km
          </div>
        </div>
        <div>
          <div className="kpi-title">Cantidad de Viajes</div>
          <div className="kpi-value">{viajes.length}</div>
        </div>
      </div>

      {/* Filtros por Vehículo y Conductor (Requerimiento del TP3) */}
      <div className="filters-bar">
        <div className="form-group">
          <label htmlFor="filtro-vehiculo">Filtrar por Vehículo:</label>
          <select
            id="filtro-vehiculo"
            value={filtros.vehiculo_id}
            onChange={(e) => setFiltros({ ...filtros, vehiculo_id: e.target.value })}
          >
            <option value="">-- Todos los vehículos --</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.marca} {v.modelo} ({v.patente})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filtro-conductor">Filtrar por Conductor:</label>
          <select
            id="filtro-conductor"
            value={filtros.conductor_id}
            onChange={(e) => setFiltros({ ...filtros, conductor_id: e.target.value })}
          >
            <option value="">-- Todos los conductores --</option>
            {conductores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.apellido} (DNI: {c.documento})
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => setFiltros({ vehiculo_id: "", conductor_id: "" })}
        >
          Limpiar Filtros
        </button>
      </div>

      {/* Tabla de Viajes */}
      {cargando ? (
        <p>Cargando viajes...</p>
      ) : viajes.length === 0 ? (
        <div className="alert alert-warning">
          No se encontraron viajes registrados con los criterios seleccionados.
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha Salida</th>
                <th>Vehículo</th>
                <th>Conductor</th>
                <th>Trayecto</th>
                <th>Distancia</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {viajes.map((v) => (
                <tr key={v.id}>
                  <td><strong>#{v.id}</strong></td>
                  <td>{new Date(v.fecha_salida).toLocaleString("es-AR")}</td>
                  <td>
                    <Link to={`/vehiculos/${v.vehiculo_id}`}>
                      {v.vehiculo_marca} ({v.vehiculo_patente})
                    </Link>
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
                  <td>
                    <div className="actions-cell">
                      <Link to={`/viajes/${v.id}`} className="btn btn-sm">
                        🔍 Ver
                      </Link>
                      <Link
                        to={`/viajes/${v.id}/editar`}
                        className="btn btn-secondary btn-sm"
                      >
                        ✏️ Editar
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEliminar(v.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
