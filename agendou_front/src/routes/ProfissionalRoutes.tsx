import React from "react";
import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoutes";

import DashboardProfissional from "../pages/profissional/Dashboard";
import MeusServicos from "../pages/profissional/MeusServicos";
import MeusAgendamentos from "../pages/profissional/Agendamentos";
import MinhasDisponibilidades from "../pages/profissional/Disponibilidades";
import ConfiguracoesProfissional from "../pages/profissional/Configuracoes";
import Faturamento from "../pages/profissional/Faturamento";
import FaturamentoGraficos from "../pages/profissional/FaturamentoGraficos";

export default function ProfissionalRoutes() {
    return (
        <Routes>
            <Route path="/profissional/dashboard" element={<PrivateRoute role="PROFISSIONAL"> <DashboardProfissional /> </PrivateRoute>}> </Route>
            <Route path="/profissional/agendar" element={<PrivateRoute role="PROFISSIONAL"> <MeusServicos /> </PrivateRoute>}> </Route>
            <Route path="/profissional/agendamentos" element={<PrivateRoute role="PROFISSIONAL"> <MeusAgendamentos /> </PrivateRoute>}> </Route>
            <Route path="/profissional/disponibilidades" element={<PrivateRoute role="PROFISSIONAL"> <MinhasDisponibilidades /> </PrivateRoute>}> </Route>
            <Route path="/profissional/faturamento" element={<PrivateRoute role="PROFISSIONAL"> <Faturamento /> </PrivateRoute>}> </Route>
            <Route path="/profissional/faturamento/graficos" element={<PrivateRoute role="PROFISSIONAL"> <FaturamentoGraficos /> </PrivateRoute>}> </Route>
            <Route path="/profissional/configuracoes" element={<PrivateRoute role="PROFISSIONAL"> <ConfiguracoesProfissional /> </PrivateRoute>}> </Route>
        </Routes>
    );
}