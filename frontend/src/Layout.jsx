import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "./Auth";

export function Layout() {
  const { isAuthenticated, usuario, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <header className="app-header">
        <div className="nav-container">
          <Link to="/" className="brand-title">
            <span>🚚</span> TransLogística S.A.
          </Link>
          <nav>
            <ul>
              <li className={pathname === "/" ? "active" : ""}>
                <Link to="/">Inicio</Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li className={pathname.startsWith("/vehiculos") ? "active" : ""}>
                    <Link to="/vehiculos">Vehículos</Link>
                  </li>
                  <li className={pathname.startsWith("/conductores") ? "active" : ""}>
                    <Link to="/conductores">Conductores</Link>
                  </li>
                  <li className={pathname.startsWith("/viajes") ? "active" : ""}>
                    <Link to="/viajes">Viajes</Link>
                  </li>
                  <li>
                    <span className="user-badge">👤 {usuario?.nombre || "Usuario"}</span>
                  </li>
                  <li>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                    >
                      Salir
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className={pathname === "/login" ? "active" : ""}>
                    <Link to="/login">Ingresar</Link>
                  </li>
                  <li className={pathname === "/registro" ? "active" : ""}>
                    <Link to="/registro">Registrarse</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
