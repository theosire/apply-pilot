import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../../../shared/types/user";
import { api } from "../lib/axios";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    register: (name: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

// Stores the logged-in user globally so any component can access auth state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Restore session on page refresh by checking the HTTP-only cookie with the backend
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const res = await api.get("/api/auth/me");
                setUser(res.data.user);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        
        restoreSession();
    }, []);

    // Register a new user, send the browser-detected timezone, 
    // and store the returned user in context
    const register = async (name: string, email: string, password: string) => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const res = await api.post("/api/auth/register", { 
            name,
            email, 
            password,
            timezone
        });

        setUser(res.data.user);
    };
    
    // Login stores the returned user in context; the JWT itself stays in the cookie
    const login = async (email: string, password: string) => {
        const res = await api.post("/api/auth/login", { email, password });
        setUser(res.data.user);
    };
    
    // Logout clears the backend cookie and removes the user from context
    const logout = async () => {
        await api.post("/api/auth/logout");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook prevents components from using auth outside AuthProvider
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};