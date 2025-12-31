import React from "react"
import {Outlet} from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            {/*Aqui  ai ficar a logo (header)*/}
            <header className="absolute top-4 left-4">
                <h1 className="text-2xl font-bold">Agendou</h1>
            </header>
            {/*Conteúdo da página*/}
            <main className="w-full max-w-md">
                <Outlet />
            </main>
            {/*Footer da página*/}
            <footer className="mt-8 text-sm text-gray-800">
                &copy; 2025 Agendou
            </footer>
        </div>
    );
}