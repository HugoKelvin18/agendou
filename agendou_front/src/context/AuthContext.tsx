import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";

export interface User {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    role: "CLIENTE" | "PROFISSIONAL";
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, senha: string) => Promise<{ token: string; user: User }>;
    logout: () => void;
    updateUser: (updatedUser: Partial<User>) => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType> ({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const[user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    //Mantém o usuário logado após recarregar a página
    useEffect(() => {
        const storedToken = localStorage.getItem("@agendou:token");
        const storedUser = localStorage.getItem("@agendou:user");

        if (storedToken && storedUser && storedUser !== "undefined") {
           try {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
           } catch(error) {
            console.error("Erro ao fazer parse do usuário salvo", error);
            localStorage.removeItem("@agendou:user");
            localStorage.removeItem("@agendou:token");
           }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, senha: string) => {
        try {
            const res = await api.post("/auth/login", { email, senha });

            const token = res.data.token;
            const user = res.data.user;

            console.log("AuthContext - Login bem-sucedido:", { token, user });


            // Salva no localStorage primeiro
            localStorage.setItem("@agendou:token", token);
            localStorage.setItem("@agendou:user", JSON.stringify(user));
            
            // Configurar token para próximas requisições
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // Atualiza o estado do contexto
            setUser(user);
            setToken(token);

            console.log("AuthContext - Estado atualizado com sucesso");

            return { token, user };
        } catch (error) {
            console.error("Erro ao fazer o login:", error);
            throw error;
        }
    };

    const updateUser = (updatedUser: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...updatedUser };
            setUser(newUser);
            localStorage.setItem("@agendou:user", JSON.stringify(newUser));
        }
    };

    const logout = () => {
        localStorage.removeItem("@agendou:token");
        localStorage.removeItem("@agendou:user");
        setUser(null);
        setToken(null);
        delete api.defaults.headers.common["Authorization"];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}