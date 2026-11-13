import { createContext, useCallback, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Hook personalizado para acceder al contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("jwt_token"));
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("jwt_usuario");
    return guardado ? JSON.parse(guardado) : null;
  });
  const [error, setError] = useState(null);

  // Sincronizar localStorage cuando cambia token o usuario
  useEffect(() => {
    if (token && usuario) {
      localStorage.setItem("jwt_token", token);
      localStorage.setItem("jwt_usuario", JSON.stringify(usuario));
    } else {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("jwt_usuario");
    }
  }, [token, usuario]);

  // Inicio de sesión
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.mensaje || (data.errores ? data.errores[0].mensaje : "Credenciales inválidas");
        throw new Error(errorMsg);
      }

      setToken(data.token);
      setUsuario(data.usuario);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Registro de usuario
  const registro = useCallback(async (nombre, email, password) => {
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.mensaje || (data.errores ? data.errores[0].mensaje : "Error al registrarse");
        throw new Error(errorMsg);
      }

      return { success: true, mensaje: data.mensaje };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Cierre de sesión
  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
    setError(null);
  }, []);

  // Función para realizar peticiones protegidas con el Bearer token
  const fetchAuth = useCallback(
    async (url, options = {}) => {
      if (!token) {
        throw new Error("No hay una sesión activa");
      }

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        error,
        isAuthenticated: !!token,
        login,
        registro,
        logout,
        fetchAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
