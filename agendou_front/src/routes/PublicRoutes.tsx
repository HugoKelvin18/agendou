import React from "react";
import { Routes, Route } from "react-router-dom"

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RecuperarSenha from "../pages/auth/RecuperarSenha";

export default function PublicRoutes () {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />

            {/* Redirecionamento padrão para login */}
            <Route path="*" element={<Login />} />
        </Routes>
    );
}