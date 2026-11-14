import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "./Auth";

export function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [filtro, setFiltro] = useState({ marca: "", modelo: "", patente: "" });
  const { fetchAuth } = useAuth();

  const cargarVehiculos = useCallback(async () => {
    setCargando(true);
    try {
      const url = new URL("http://localhost:3000/vehiculos");
      if (filtro.marca) url.searchParams.append("marca", filtro.marca);
      if (filtro.modelo) url.searchParams.append("modelo", filtro.modelo);
      if (filtro.patente) url.searchParams.append("patente", filtro.patente);

      const res = await fetchAuth(url);
      if (!res.ok) {
        throw new Error("No se pudo obtener el listado de vehículos");
      }
      const data = await res.json();
      setVehiculos(data);
    } catch (err) {
      setMensaje({ tipo: "danger", texto: err.message });
    } finally {
      setCargando(false);
    }
  }, [fetchAuth, filtro]);

  useEffect(() => {
    cargarVehiculos();
  }, [cargarVehiculos]);

  const handleEliminar = async (id, patente) => {
    const seguro = window.confirm(`¿Está seguro de eliminar el vehículo patente ${patente}?`);
    if (!seguro) return;

    try {
      const res = await fetchAuth(`http://localhost:3000/vehiculos/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.mensaje || "Error al eliminar el vehículo");
      }

      setMensaje({ tipo: "success", texto: "Vehículo eliminado con éxito." });
      cargarVehiculos();
    } catch (err) {
      setMensaje({ tipo: "danger", texto: err.message });
    }
  };

  return (
    <div>
      <div className="header-actions">
        <h1>Gestión de Vehículos</h1>
        <Link to="/vehiculos/nuevo" className="btn">
          ➕ Nuevo Vehículo
        </Link>
      </div>

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="filters-bar">
        <div className="form-group">
          <label htmlFor="filtro-marca">Filtrar por Marca:</label>
          <input
            id="filtro-marca"
            type="text"
            placeholder="Ej: Scania, Mercedes..."
            value={filtro.marca}
            onChange={(e) => setFiltro({ ...filtro, marca: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="filtro-modelo">Filtrar por Modelo:</label>
          <input
            id="filtro-modelo"
            type="text"
            placeholder="Ej: Actros, R450..."
            value={filtro.modelo}
            onChange={(e) => setFiltro({ ...filtro, modelo: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="filtro-patente">Filtrar por Patente:</label>
          <input
            id="filtro-patente"
            type="text"
            placeholder="Ej: AF123AA"
            value={filtro.patente}
            onChange={(e) => setFiltro({ ...filtro, patente: e.target.value })}
          />
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setFiltro({ marca: "", modelo: "", patente: "" })}
        >
          Limpiar
        </button>
      </div>

      {/* Tabla de Vehículos */}
      {cargando ? (
        <p>Cargando vehículos...</p>
      ) : vehiculos.length === 0 ? (
        <div className="alert alert-warning">
          No se encontraron vehículos que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Patente</th>
                <th>Año</th>
                <th>Capacidad Carga (kg)</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id}>
                  <td><strong>#{v.id}</strong></td>
                  <td>{v.marca}</td>
                  <td>{v.modelo}</td>
                  <td>
                    <span className="badge badge-info">{v.patente}</span>
                  </td>
                  <td>{v.anio}</td>
                  <td>{Number(v.capacidad_carga).toLocaleString("es-AR")} kg</td>
                  <td>
                    <div className="actions-cell">
                      <Link to={`/vehiculos/${v.id}`} className="btn btn-sm">
                        🔍 Ver / Historial
                      </Link>
                      <Link
                        to={`/vehiculos/${v.id}/editar`}
                        className="btn btn-secondary btn-sm"
                      >
                        ✏️ Editar
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEliminar(v.id, v.patente)}
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
