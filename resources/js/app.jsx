import './bootstrap';
import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
    return (
        <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
            <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow">
                <h1 className="text-3xl font-bold">Reserva de Carros</h1>
                <p className="mt-3 text-slate-600">
                    Estrutura Laravel + React criada com sucesso.
                </p>
            </div>
        </main>
    );
}

const rootElement = document.getElementById('app');

if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
