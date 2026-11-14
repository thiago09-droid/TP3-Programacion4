import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "./Auth";

export function Conductores() {
  const [conductores, setConductores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [busqueda, setBusqueda] = useState("");
  const { fetchAuth } = useAuth();

  const cargarConductores = useCallback(async () => {
    setCargando(true);
    try {
      const url = new URL("http://localhost:3000/conductores");
      if (busqueda) url.searchParams.append("buscar", busqueda);

      const res = await fetchAuth(url);
      if (!res.ok) throw new Error("No se pudo obtener el listado de conductores");
      const data = await res.json();
      setConductores(data);
    } catch (err) {
      setMensaje({ tipo: "danger", texto: err.message });
    } finally {
      setCargando(false);
    }
  }, [fetchAuth, busqueda]);

  useEffect(() => {
    cargarConductores();
  }, [cargarConductores]);

  const handleEliminar = async (id, nombreCompleto) => {
    const seguro = window.confirm(`¿Está seguro de eliminar al conductor ${nombreCompleto}?`);
    if (!seguro) return;

    try {
      const res = await fetchAuth(`http://localhost:3000/conductores/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.mensaje || "Error al eliminar el conductor");
      }

      setMensaje({ tipo: "success", texto: "Conductor eliminado con éxito." });
      cargarConductores();
    } catch (err) {
      setMensaje({ tipo: "danger", texto: err.message });
    }
  };

  const licenciaVencida = (fechaVencimiento) => {
    return new Date(fechaVencimiento) < new Date();
  };

  return (
    <div>
      <div className="header-actions">
        <h1>Gestión de Conductores</h1>
        <Link to="/conductores/nuevo" className="btn">
          ➕ Nuevo Conductor
        </Link>
      </div>

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="filters-bar">
        <div className="form-group" style={{ flex: 2 }}>
          <label htmlFor="busqueda">Buscar Conductor:</label>
          <input
            id="busqueda"
            type="text"
            placeholder="Buscar por nombre, apellido o licencia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" onClick={() => setBusqueda("")}>
          Limpiar
        </button>
      </div>

      {cargando ? (
        <p>Cargando conductores...</p>
      ) : conductores.length === 0 ? (
        <div className="alert alert-warning">
          No se encontraron conductores registrados.
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre y Apellido</th>
                <th>Documento</th>
                <th>Licencia</th>
                <th>Alta Licencia</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {conductores.map((c) => {
                const vencida = licenciaVencida(c.fecha_vencimiento_licencia);
                return (
                  <tr key={c.id}>
                    <td><strong>#{c.id}</strong></td>
                    <td>{c.nombre} {c.apellido}</td>
                    <td>{c.documento}</td>
                    <td><strong>{c.licencia}</strong></td>
                    <td>{c.fecha_alta_licencia}</td>
                    <td>{c.fecha_vencimiento_licencia}</td>
                    <td>
                      {vencida ? (
                        <span className="badge badge-danger">Vencida</span>
                      ) : (
                        <span className="badge badge-success">Vigente</span>
                      )}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <Link to={`/conductores/${c.id}`} className="btn btn-sm">
                          🔍 Ver / Historial
                        </Link>
                        <Link
                          to={`/conductores/${c.id}/editar`}
                          className="btn btn-secondary btn-sm"
                        >
                          ✏️ Editar
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleEliminar(c.id, `${c.nombre} ${c.apellido}`)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
