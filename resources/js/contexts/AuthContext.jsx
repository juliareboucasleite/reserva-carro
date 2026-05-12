import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'rentacar_auth';
const AuthContext = createContext(null);

export const ROLES = {
    DRIVER: 'driver',
    MANAGER: 'manager',
    ADMIN: 'admin',
};

const MOCK_USERS = {
    driver: { id: 1, name: 'Ana Pereira', email: 'ana@empresa.pt', role: ROLES.DRIVER, team: 'Operações Lisboa' },
    manager: { id: 2, name: 'Rui Santos', email: 'rui@empresa.pt', role: ROLES.MANAGER, team: 'Gestão de Frota' },
    admin: { id: 3, name: 'Carla Mendes', email: 'carla@empresa.pt', role: ROLES.ADMIN, team: 'Administração' },
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        if (typeof window === 'undefined') return null;
        const stored = window.localStorage.getItem(STORAGE_KEY);

        if (!stored) return null;

        try {
            return JSON.parse(stored);
        } catch {
            window.localStorage.removeItem(STORAGE_KEY);
            return null;
        }
    });

    useEffect(() => {
        if (user) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    }, [user]);

    const login = (role) => setUser(MOCK_USERS[role] || null);
    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
