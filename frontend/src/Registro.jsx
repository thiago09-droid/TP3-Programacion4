import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./Auth";

export function Registro() {
  const { registro, login } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorLocal, setErrorLocal] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal("");

    if (!nombre.trim()) {
      setErrorLocal("El nombre completo es obligatorio.");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorLocal("Ingrese un correo electrónico válido.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorLocal("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorLocal("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    const res = await registro(nombre, email, password);
    if (!res.success) {
      setCargando(false);
      setErrorLocal(res.error || "Error al registrar el usuario.");
      return;
    }

    // Iniciar sesión automáticamente tras el registro exitoso
    const resLogin = await login(email, password);
    setCargando(false);
    if (resLogin.success) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "20px auto" }}>
      <h2>Crear Cuenta</h2>
      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        Registrate para acceder al sistema de gestión.
      </p>

      {errorLocal && <div className="alert alert-danger">{errorLocal}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre Completo:</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            placeholder="Juan Pérez"
            onChange={(e) => setNombre(e.target.value)}
            disabled={cargando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            id="email"
            type="email"
            value={email}
            placeholder="ejemplo@transporte.com"
            onChange={(e) => setEmail(e.target.value)}
            disabled={cargando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña (mínimo 6 caracteres):</label>
          <input
            id="password"
            type="password"
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
            disabled={cargando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            placeholder="••••••••"
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={cargando}
          />
        </div>

        <div className="form-actions" style={{ justifyContent: "space-between" }}>
          <button type="submit" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarse"}
          </button>
          <Link to="/" className="btn btn-secondary">
            Volver
          </Link>
        </div>
      </form>

      <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9rem" }}>
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión aquí</Link>
      </div>
    </div>
  );
}
