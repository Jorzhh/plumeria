const API_BASE_URL = 'http://localhost:8080/api';

window.API = {
    async getEspecies() {
        const res = await fetch(`${API_BASE_URL}/especies`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    },

    async crearSimulacion(payload) {
        const res = await fetch(`${API_BASE_URL}/simulaciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Error al guardar simulación');
        return await res.json();
    },

    async getSimulaciones() {
        const res = await fetch(`${API_BASE_URL}/simulaciones`);
        if (!res.ok) throw new Error('Error al consultar historial');
        return await res.json();
    },

    async getReportesBio() {
        const res = await fetch(`${API_BASE_URL}/reportes`);
        if (!res.ok) throw new Error('Error al obtener reportes');
        return await res.json();
    }
};