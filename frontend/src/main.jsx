import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import { AuthProvider } from "./Auth";
import { AuthLayout } from "./AuthLayout";
import { Layout } from "./Layout";
import { Home } from "./Home";
import { Login } from "./Login";
import { Registro } from "./Registro";
import { Vehiculos } from "./Vehiculos";
import { VehiculoForm } from "./VehiculoForm";
import { VehiculoDetalles } from "./VehiculoDetalles";
import { Conductores } from "./Conductores";
import { ConductorForm } from "./ConductorForm";
import { ConductorDetalles } from "./ConductorDetalles";
import { Viajes } from "./Viajes";
import { ViajeForm } from "./ViajeForm";
import { ViajeDetalles } from "./ViajeDetalles";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Rutas Públicas */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Registro />} />

            {/* Rutas Protegidas (Solo usuarios autenticados) */}
            <Route element={<AuthLayout />}>
              {/* Módulo de Vehículos */}
              <Route path="vehiculos" element={<Vehiculos />} />
              <Route path="vehiculos/nuevo" element={<VehiculoForm />} />
              <Route path="vehiculos/:id" element={<VehiculoDetalles />} />
              <Route path="vehiculos/:id/editar" element={<VehiculoForm />} />

              {/* Módulo de Conductores */}
              <Route path="conductores" element={<Conductores />} />
              <Route path="conductores/nuevo" element={<ConductorForm />} />
              <Route path="conductores/:id" element={<ConductorDetalles />} />
              <Route path="conductores/:id/editar" element={<ConductorForm />} />

              {/* Módulo de Viajes */}
              <Route path="viajes" element={<Viajes />} />
              <Route path="viajes/nuevo" element={<ViajeForm />} />
              <Route path="viajes/:id" element={<ViajeDetalles />} />
              <Route path="viajes/:id/editar" element={<ViajeForm />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
