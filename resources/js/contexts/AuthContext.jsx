import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const ROLES = {
    DRIVER: 'driver',
    MANAGER: 'manager',
    ADMIN: 'admin',
};

function syncCsrfToken(token) {
    if (!token) return;

    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) meta.setAttribute('content', token);

    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function bootstrapAuth() {
            try {
                const { data } = await axios.get('/auth/me');
                syncCsrfToken(data.csrf_token);
                if (!cancelled) setUser(data.user);
            } catch (error) {
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setAuthLoading(false);
            }
        }

        bootstrapAuth();

        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo(
        () => ({
            user,
            authLoading,
            isAuthenticated: !!user,
            async login(credentials) {
                const { data } = await axios.post('/auth/login', credentials);
                syncCsrfToken(data.csrf_token);
                setUser(data.user);
                return data.user;
            },
            async register(payload) {
                const { data } = await axios.post('/auth/register', payload);
                syncCsrfToken(data.csrf_token);
                setUser(data.user);
                return data.user;
            },
            async logout() {
                await axios.post('/auth/logout');
                setUser(null);
            },
        }),
        [authLoading, user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
