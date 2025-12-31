import React from "react";
import { Outlet, NavLink, Navigate } from "react-router-dom";

//Função para verificar o login (precisar evoluir com o token jwt)
const isAuthenticated = () => !!localStorage.getItem("token");

export default function AuthLayout() {

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = '/login';
    }

    //Links do menu lateral
    const menuLinks = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Agendamentos", path: "/agendamentos" },
        { name: "Servicos", path: "/servicos" },
        { name: "Profissionais", path: "/profissionais" },
        { name: "Clientes", path: "/clientes" },
        { name: "Configuracoes", path: "/configuracoes" },
    ]

    return (
        
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
                <h2 className="text-xl font-bold mb-6">Agendou</h2>
                <nav className="flex-1 flex flex-col gap-2">
                   {menuLinks.map((link) => (
                        <NavLink key={link.path} to={link.path} className={({ isActive }) => 
                            `px-3 py-2 rounded hover:bg-gray-700 ${
                                isActive ? "bg-gray-700 font-bold" : ""
                            }`
                        }
                        >
                            {link.name }
                        </NavLink>
                    ))}
                </nav>
                <button onClick={handleLogout} className="mt-4 px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors">
                    Logout
                </button>
            </aside>

            {/* Conteúdo principal */}
            <main className="flex-1 p-6 bg-gray-100">
                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-x1 font-bold">
                        {/* Título conforme a rota */}
                        {window.location.pathname.replace("/", "") || "Dashboard"}
                    </h1>
                </header>

                {/* Conteúdo da página */}
                <Outlet />
            </main>
        </div>
    );
}
