import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "./Auth";

export function VehiculoForm() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();
  const { fetchAuth } = useAuth();

  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    patente: "",
    anio: new Date().getFullYear(),
    capacidad_carga: "",
  });

  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (esEdicion) {
      async function cargarVehiculo() {
        try {
          const res = await fetchAuth(`http://localhost:3000/vehiculos/${id}`);
          if (!res.ok) throw new Error("No se pudo cargar el vehículo a editar");
          const data = await res.json();
          setFormData({
            marca: data.marca,
            modelo: data.modelo,
            patente: data.patente,
            anio: data.anio,
            capacidad_carga: data.capacidad_carga,
          });
        } catch (err) {
          setErrorServidor(err.message);
        }
      }
      cargarVehiculo();
    }
  }, [id, esEdicion, fetchAuth]);

  const validar = () => {
    const err = {};
    if (!formData.marca.trim()) err.marca = "La marca es requerida";
    if (!formData.modelo.trim()) err.modelo = "El modelo es requerido";
    if (!formData.patente.trim()) {
      err.patente = "La patente es requerida";
    } else if (formData.patente.trim().length < 3 || formData.patente.trim().length > 20) {
      err.patente = "La patente debe tener entre 3 y 20 caracteres";
    }
    const anioNum = Number(formData.anio);
    if (!anioNum || anioNum < 1900 || anioNum > 2100) {
      err.anio = "El año debe estar entre 1900 y 2100";
    }
    const cargaNum = Number(formData.capacidad_carga);
    if (!cargaNum || cargaNum <= 0) {
      err.capacidad_carga = "La capacidad de carga debe ser mayor a 0 kg";
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
        ? `http://localhost:3000/vehiculos/${id}`
        : "http://localhost:3000/vehiculos";

      const method = esEdicion ? "PUT" : "POST";

      const res = await fetchAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca: formData.marca.trim(),
          modelo: formData.modelo.trim(),
          patente: formData.patente.trim().toUpperCase(),
          anio: Number(formData.anio),
          capacidad_carga: Number(formData.capacidad_carga),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.mensaje || "Error al procesar la solicitud");
      }

      navigate("/vehiculos");
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>{esEdicion ? `Editar Vehículo #${id}` : "Nuevo Vehículo"}</h1>

      {errorServidor && <div className="alert alert-danger">{errorServidor}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="marca">Marca:</label>
            <input
              id="marca"
              type="text"
              placeholder="Ej: Scania, Volvo, Mercedes..."
              value={formData.marca}
              className={errores.marca ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
            />
            {errores.marca && <div className="field-error">{errores.marca}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="modelo">Modelo:</label>
            <input
              id="modelo"
              type="text"
              placeholder="Ej: R450, FH 540..."
              value={formData.modelo}
              className={errores.modelo ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
            />
            {errores.modelo && <div className="field-error">{errores.modelo}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="patente">Patente / Dominio:</label>
          <input
            id="patente"
            type="text"
            placeholder="Ej: AF123AA"
            value={formData.patente}
            className={errores.patente ? "input-error" : ""}
            onChange={(e) => setFormData({ ...formData, patente: e.target.value })}
          />
          {errores.patente && <div className="field-error">{errores.patente}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="anio">Año de Fabricación:</label>
            <input
              id="anio"
              type="number"
              min="1900"
              max="2100"
              value={formData.anio}
              className={errores.anio ? "input-error" : ""}
              onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
            />
            {errores.anio && <div className="field-error">{errores.anio}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="capacidad_carga">Capacidad de Carga (kg):</label>
            <input
              id="capacidad_carga"
              type="number"
              step="0.01"
              min="1"
              placeholder="Ej: 25000"
              value={formData.capacidad_carga}
              className={errores.capacidad_carga ? "input-error" : ""}
              onChange={(e) =>
                setFormData({ ...formData, capacidad_carga: e.target.value })
              }
            />
            {errores.capacidad_carga && (
              <div className="field-error">{errores.capacidad_carga}</div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : esEdicion ? "Actualizar Vehículo" : "Crear Vehículo"}
          </button>
          <Link to="/vehiculos" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
