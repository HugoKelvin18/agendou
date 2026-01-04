import React from "react";
import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoutes";

// Rotas públicas
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RecuperarSenha from "../pages/auth/RecuperarSenha";
import Planos from "../pages/public/Planos";
import AguardandoConfirmacao from "../pages/public/AguardandoConfirmacao";

// Rotas privadas - Cliente
import DashboardCliente from "../pages/cliente/Dashboard";
import AgendarServico from "../pages/cliente/Agendar";
import MeusAgendamentos from "../pages/cliente/Agendamentos";
import ConfiguracoesCliente from "../pages/cliente/Configuracoes";

// Rotas privadas - Profissional
import DashboardProfissional from "../pages/profissional/Dashboard";
import MeusServicos from "../pages/profissional/MeusServicos";
import MeusAgendamentosProfissional from "../pages/profissional/Agendamentos";
import MinhasDisponibilidades from "../pages/profissional/Disponibilidades";
import Faturamento from "../pages/profissional/Faturamento";
import FaturamentoGraficos from "../pages/profissional/FaturamentoGraficos";
import ConfiguracoesProfissional from "../pages/profissional/Configuracoes";

// Rotas privadas - Admin
import DashboardAdmin from "../pages/admin/Dashboard";
import BusinessDetail from "../pages/admin/BusinessDetail";
import ConfiguracoesAdmin from "../pages/admin/Configuracoes";
import SolicitacoesPendentes from "../pages/admin/SolicitacoesPendentes";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />

            {/* Rotas privadas - Cliente */}
            <Route 
                path="/cliente/dashboard" 
                element={
                    <PrivateRoute role="CLIENTE">
                        <DashboardCliente />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/cliente/agendar" 
                element={
                    <PrivateRoute role="CLIENTE">
                        <AgendarServico />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/cliente/agendamentos" 
                element={
                    <PrivateRoute role="CLIENTE">
                        <MeusAgendamentos />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/cliente/configuracoes" 
                element={
                    <PrivateRoute role="CLIENTE">
                        <ConfiguracoesCliente />
                    </PrivateRoute>
                } 
            />

            {/* Rotas privadas - Profissional */}
            <Route 
                path="/profissional/dashboard" 
                element={
                    <PrivateRoute role="PROFISSIONAL">
                        <DashboardProfissional />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/profissional/agendar" 
                element={
                    <PrivateRoute role="PROFISSIONAL">
                        <MeusServicos />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/profissional/agendamentos" 
                element={
                    <PrivateRoute role="PROFISSIONAL">
                        <MeusAgendamentosProfissional />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/profissional/disponibilidades" 
                element={
                    <PrivateRoute role="PROFISSIONAL">
                        <MinhasDisponibilidades />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/profissional/faturamento" 
                element={
                    <PrivateRoute role="PROFISSIONAL">
                        <Faturamento />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/profissional/faturamento/graficos" 
                element={
                    <PrivateRoute role="PROFISSIONAL">
                        <FaturamentoGraficos />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/profissional/configuracoes" 
                element={
                    <PrivateRoute role="PROFISSIONAL">
                        <ConfiguracoesProfissional />
                    </PrivateRoute>
                } 
            />

            {/* Rotas privadas - Admin */}
            <Route 
                path="/admin/dashboard" 
                element={
                    <PrivateRoute role="ADMIN">
                        <DashboardAdmin />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/admin/businesses/:id" 
                element={
                    <PrivateRoute role="ADMIN">
                        <BusinessDetail />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/admin/configuracoes" 
                element={
                    <PrivateRoute role="ADMIN">
                        <ConfiguracoesAdmin />
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/admin/solicitacoes-pendentes" 
                element={
                    <PrivateRoute role="ADMIN">
                        <SolicitacoesPendentes />
                    </PrivateRoute>
                } 
            />

            {/* Rota padrão - redireciona para planos */}
            <Route path="*" element={<Planos />} />
        </Routes>
    );
}