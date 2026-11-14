import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "./Auth";

export function ConductorForm() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();
  const { fetchAuth } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    licencia: "",
    fecha_alta_licencia: "",
    fecha_vencimiento_licencia: "",
  });

  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (esEdicion) {
      async function cargarConductor() {
        try {
          const res = await fetchAuth(`http://localhost:3000/conductores/${id}`);
          if (!res.ok) throw new Error("No se pudo cargar el conductor a editar");
          const data = await res.json();
          setFormData({
            nombre: data.nombre,
            apellido: data.apellido,
            documento: data.documento,
            licencia: data.licencia,
            fecha_alta_licencia: data.fecha_alta_licencia,
            fecha_vencimiento_licencia: data.fecha_vencimiento_licencia,
          });
        } catch (err) {
          setErrorServidor(err.message);
        }
      }
      cargarConductor();
    }
  }, [id, esEdicion, fetchAuth]);

  const validar = () => {
    const err = {};
    if (!formData.nombre.trim()) err.nombre = "El nombre es requerido";
    if (!formData.apellido.trim()) err.apellido = "El apellido es requerido";
    if (!formData.documento.trim()) {
      err.documento = "El número de documento es requerido";
    } else if (formData.documento.trim().length < 4 || formData.documento.trim().length > 20) {
      err.documento = "El documento debe tener entre 4 y 20 caracteres";
    }
    if (!formData.licencia.trim()) {
      err.licencia = "El número de licencia es requerido";
    } else if (formData.licencia.trim().length < 3 || formData.licencia.trim().length > 30) {
      err.licencia = "La licencia debe tener entre 3 y 30 caracteres";
    }
    if (!formData.fecha_alta_licencia) {
      err.fecha_alta_licencia = "La fecha de alta es requerida";
    }
    if (!formData.fecha_vencimiento_licencia) {
      err.fecha_vencimiento_licencia = "La fecha de vencimiento es requerida";
    } else if (
      formData.fecha_alta_licencia &&
      new Date(formData.fecha_vencimiento_licencia) <= new Date(formData.fecha_alta_licencia)
    ) {
      err.fecha_vencimiento_licencia =
        "La fecha de vencimiento debe ser posterior a la fecha de alta";
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
        ? `http://localhost:3000/conductores/${id}`
        : "http://localhost:3000/conductores";

      const method = esEdicion ? "PUT" : "POST";

      const res = await fetchAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          documento: formData.documento.trim(),
          licencia: formData.licencia.trim().toUpperCase(),
          fecha_alta_licencia: formData.fecha_alta_licencia,
          fecha_vencimiento_licencia: formData.fecha_vencimiento_licencia,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.mensaje || "Error al procesar la solicitud");
      }

      navigate("/conductores");
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>{esEdicion ? `Editar Conductor #${id}` : "Nuevo Conductor"}</h1>

      {errorServidor && <div className="alert alert-danger">{errorServidor}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre:</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej: Carlos"
              value={formData.nombre}
              className={errores.nombre ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
            {errores.nombre && <div className="field-error">{errores.nombre}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido:</label>
            <input
              id="apellido"
              type="text"
              placeholder="Ej: Gómez"
              value={formData.apellido}
              className={errores.apellido ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
            />
            {errores.apellido && <div className="field-error">{errores.apellido}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="documento">Documento (DNI):</label>
            <input
              id="documento"
              type="text"
              placeholder="Ej: 30123456"
              value={formData.documento}
              className={errores.documento ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
            />
            {errores.documento && <div className="field-error">{errores.documento}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="licencia">Número de Licencia:</label>
            <input
              id="licencia"
              type="text"
              placeholder="Ej: LIC-00123"
              value={formData.licencia}
              className={errores.licencia ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, licencia: e.target.value })}
            />
            {errores.licencia && <div className="field-error">{errores.licencia}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha_alta_licencia">Fecha de Alta de Licencia:</label>
            <input
              id="fecha_alta_licencia"
              type="date"
              value={formData.fecha_alta_licencia}
              className={errores.fecha_alta_licencia ? "input-error" : ""}
              onChange={(e) =>
                setFormData({ ...formData, fecha_alta_licencia: e.target.value })
              }
            />
            {errores.fecha_alta_licencia && (
              <div className="field-error">{errores.fecha_alta_licencia}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="fecha_vencimiento_licencia">Fecha de Vencimiento de Licencia:</label>
            <input
              id="fecha_vencimiento_licencia"
              type="date"
              value={formData.fecha_vencimiento_licencia}
              className={errores.fecha_vencimiento_licencia ? "input-error" : ""}
              onChange={(e) =>
                setFormData({ ...formData, fecha_vencimiento_licencia: e.target.value })
              }
            />
            {errores.fecha_vencimiento_licencia && (
              <div className="field-error">{errores.fecha_vencimiento_licencia}</div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : esEdicion ? "Actualizar Conductor" : "Registrar Conductor"}
          </button>
          <Link to="/conductores" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
