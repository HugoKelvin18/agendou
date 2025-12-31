import React from "react";
import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoutes";

import DashboardCliente from "../pages/cliente/Dashboard";
import AgendarServico from "../pages/cliente/Agendar";
import MeusAgendamentos from "../pages/cliente/Agendamentos";
import ConfiguracoesCliente from "../pages/cliente/Configuracoes";

export default function ClienteRoutes() {
    return (
        <Routes>
            <Route path="/cliente/dashboard" element={<PrivateRoute role="CLIENTE"> <DashboardCliente /> </PrivateRoute>}> </Route>
            <Route path="/cliente/agendar" element={<PrivateRoute role="CLIENTE"> <AgendarServico /> </PrivateRoute>}> </Route>
            <Route path="/cliente/agendamentos" element={<PrivateRoute role="CLIENTE"> <MeusAgendamentos /> </PrivateRoute>}> </Route>
            <Route path="/cliente/configuracoes" element={<PrivateRoute role="CLIENTE"> <ConfiguracoesCliente /> </PrivateRoute>}> </Route>
        </Routes>
    );
}