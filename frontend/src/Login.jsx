import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./Auth";

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorLocal, setErrorLocal] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal("");

    // Validaciones en frontend
    if (!email.trim()) {
      setErrorLocal("El correo electrónico es obligatorio.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorLocal("Ingrese un formato de correo electrónico válido.");
      return;
    }
    if (!password) {
      setErrorLocal("La contraseña es obligatoria.");
      return;
    }

    setCargando(true);
    const res = await login(email, password);
    setCargando(false);

    if (res.success) {
      navigate("/");
    } else {
      setErrorLocal(res.error || "Error al iniciar sesión.");
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "20px auto" }}>
      <h2>Iniciar Sesión</h2>
      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        Ingresá tus credenciales para acceder a la plataforma.
      </p>

      {errorLocal && <div className="alert alert-danger">{errorLocal}</div>}

      <form onSubmit={handleSubmit}>
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
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
            disabled={cargando}
          />
        </div>

        <div className="form-actions" style={{ justifyContent: "space-between" }}>
          <button type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Iniciar Sesión"}
          </button>
          <Link to="/" className="btn btn-secondary">
            Volver
          </Link>
        </div>
      </form>

      <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9rem" }}>
        ¿No tenés una cuenta? <Link to="/registro">Registrate aquí</Link>
      </div>
    </div>
  );
}
