import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useAuth } from "./Auth";

export function ViajeForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();
  const { fetchAuth } = useAuth();

  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);

  const [formData, setFormData] = useState({
    vehiculo_id: searchParams.get("vehiculo_id") || "",
    conductor_id: searchParams.get("conductor_id") || "",
    fecha_salida: "",
    fecha_llegada: "",
    origen: "",
    destino: "",
    kilometros: "",
    observaciones: "",
  });

  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Formatear fecha para input datetime-local
  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const local = new Date(date.getTime() - offset);
    return local.toISOString().slice(0, 16);
  };

  useEffect(() => {
    async function cargarListas() {
      try {
        const [resVeh, resCond] = await Promise.all([
          fetchAuth("http://localhost:3000/vehiculos"),
          fetchAuth("http://localhost:3000/conductores"),
        ]);

        if (resVeh.ok) setVehiculos(await resVeh.json());
        if (resCond.ok) setConductores(await resCond.json());
      } catch (err) {
        console.error("Error al cargar selects:", err);
      }
    }
    cargarListas();
  }, [fetchAuth]);

  useEffect(() => {
    if (esEdicion) {
      async function cargarViaje() {
        try {
          const res = await fetchAuth(`http://localhost:3000/viajes/${id}`);
          if (!res.ok) throw new Error("No se pudo cargar el viaje a editar");
          const data = await res.json();
          setFormData({
            vehiculo_id: data.vehiculo_id,
            conductor_id: data.conductor_id,
            fecha_salida: formatDateTimeLocal(data.fecha_salida),
            fecha_llegada: formatDateTimeLocal(data.fecha_llegada),
            origen: data.origen,
            destino: data.destino,
            kilometros: data.kilometros,
            observaciones: data.observaciones || "",
          });
        } catch (err) {
          setErrorServidor(err.message);
        }
      }
      cargarViaje();
    }
  }, [id, esEdicion, fetchAuth]);

  const validar = () => {
    const err = {};
    if (!formData.vehiculo_id) err.vehiculo_id = "Debe asociar un vehículo al viaje";
    if (!formData.conductor_id) err.conductor_id = "Debe asociar un conductor al viaje";
    if (!formData.fecha_salida) err.fecha_salida = "La fecha y hora de salida son obligatorias";
    if (formData.fecha_llegada && new Date(formData.fecha_llegada) < new Date(formData.fecha_salida)) {
      err.fecha_llegada = "La fecha de llegada no puede ser anterior a la de salida";
    }
    if (!formData.origen.trim()) err.origen = "La ciudad o punto de origen es obligatorio";
    if (!formData.destino.trim()) err.destino = "La ciudad o punto de destino es obligatorio";
    const kmNum = Number(formData.kilometros);
    if (!kmNum || kmNum <= 0) {
      err.kilometros = "Los kilómetros recorridos deben ser mayores a 0";
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor("");

    if (!validar()) return;

    setGuardando(true);
    try {
      const url = esEdicion
        ? `http://localhost:3000/viajes/${id}`
        : "http://localhost:3000/viajes";

      const method = esEdicion ? "PUT" : "POST";

      const res = await fetchAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehiculo_id: Number(formData.vehiculo_id),
          conductor_id: Number(formData.conductor_id),
          fecha_salida: formData.fecha_salida,
          fecha_llegada: formData.fecha_llegada || null,
          origen: formData.origen.trim(),
          destino: formData.destino.trim(),
          kilometros: Number(formData.kilometros),
          observaciones: formData.observaciones.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al procesar el viaje");

      navigate("/viajes");
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ maxWidth: "650px", margin: "0 auto" }}>
      <h1>{esEdicion ? `Editar Viaje #${id}` : "Registrar Nuevo Viaje"}</h1>

      {errorServidor && <div className="alert alert-danger">{errorServidor}</div>}

      <form onSubmit={handleSubmit}>
        {/* Selección de Vehículo y Conductor */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vehiculo_id">Vehículo Asignado:</label>
            <select
              id="vehiculo_id"
              value={formData.vehiculo_id}
              className={errores.vehiculo_id ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, vehiculo_id: e.target.value })}
            >
              <option value="">-- Seleccione un vehículo --</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.marca} {v.modelo} (Patente: {v.patente})
                </option>
              ))}
            </select>
            {errores.vehiculo_id && (
              <div className="field-error">{errores.vehiculo_id}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="conductor_id">Conductor Designado:</label>
            <select
              id="conductor_id"
              value={formData.conductor_id}
              className={errores.conductor_id ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, conductor_id: e.target.value })}
            >
              <option value="">-- Seleccione un conductor --</option>
              {conductores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.apellido} (Lic: {c.licencia})
                </option>
              ))}
            </select>
            {errores.conductor_id && (
              <div className="field-error">{errores.conductor_id}</div>
            )}
          </div>
        </div>

        {/* Fechas de Salida y Llegada */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha_salida">Fecha y Hora de Salida:</label>
            <input
              id="fecha_salida"
              type="datetime-local"
              value={formData.fecha_salida}
              className={errores.fecha_salida ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, fecha_salida: e.target.value })}
            />
            {errores.fecha_salida && (
              <div className="field-error">{errores.fecha_salida}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="fecha_llegada">Fecha y Hora de Llegada (Opcional):</label>
            <input
              id="fecha_llegada"
              type="datetime-local"
              value={formData.fecha_llegada}
              className={errores.fecha_llegada ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, fecha_llegada: e.target.value })}
            />
            {errores.fecha_llegada && (
              <div className="field-error">{errores.fecha_llegada}</div>
            )}
          </div>
        </div>

        {/* Origen y Destino */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="origen">Origen:</label>
            <input
              id="origen"
              type="text"
              placeholder="Ej: La Rioja Capital"
              value={formData.origen}
              className={errores.origen ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
            />
            {errores.origen && <div className="field-error">{errores.origen}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="destino">Destino:</label>
            <input
              id="destino"
              type="text"
              placeholder="Ej: Córdoba Capital"
              value={formData.destino}
              className={errores.destino ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
            />
            {errores.destino && <div className="field-error">{errores.destino}</div>}
          </div>
        </div>

        {/* Kilómetros y Observaciones */}
        <div className="form-group">
          <label htmlFor="kilometros">Kilómetros Recorridos:</label>
          <input
            id="kilometros"
            type="number"
            step="0.01"
            min="0.1"
            placeholder="Ej: 440.50"
            value={formData.kilometros}
            className={errores.kilometros ? "input-error" : ""}
            onChange={(e) => setFormData({ ...formData, kilometros: e.target.value })}
          />
          {errores.kilometros && (
            <div className="field-error">{errores.kilometros}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="observaciones">Observaciones adicionales (Opcional):</label>
          <textarea
            id="observaciones"
            rows="3"
            placeholder="Detalles de la carga, paradas técnicas, estado de la ruta..."
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : esEdicion ? "Actualizar Viaje" : "Registrar Viaje"}
          </button>
          <Link to="/viajes" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
