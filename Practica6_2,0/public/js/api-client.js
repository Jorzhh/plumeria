/**
 * Práctica 06 – Cliente API REST
 * Consumo asíncrono de la API FlightPHP
 */

const apiUrl = window.location.protocol === 'file:'
    ? new URL('http://localhost:8086/api')
    : new URL('/api', window.location.href);
if (window.location.protocol !== 'file:') apiUrl.port = '8086';
const API_BASE = apiUrl.toString().replace(/\/$/, '');
window.API_BASE = API_BASE;

// ============================================================
// Helper genérico fetch + manejo de errores
// ============================================================
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultOpts = {
        headers: { 'Content-Type': 'application/json' },
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const merged = { ...defaultOpts, ...options, signal: options.signal || controller.signal };
    
    try {
        const response = await fetch(url, merged);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`[API Error] ${endpoint}:`, error.message);
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

// ============================================================
// ESPECIES
// ============================================================
async function getEspecies() {
    const res = await apiFetch('/especies');
    return res.data;
}

async function getEspecie(id) {
    const res = await apiFetch(`/especies/${id}`);
    return res.data;
}

// ============================================================
// SIMULACIONES
// ============================================================
async function getSimulaciones() {
    const res = await apiFetch('/simulaciones');
    return res.data;
}

async function getSimulacion(id) {
    const res = await apiFetch(`/simulaciones/${id}`);
    return res.data;
}

async function crearSimulacion(datos) {
    const res = await apiFetch('/simulaciones', {
        method: 'POST',
        body: JSON.stringify(datos),
    });
    return res.data;
}

async function actualizarSimulacion(id, datos) {
    const res = await apiFetch(`/simulaciones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(datos),
    });
    return res;
}

async function eliminarSimulacion(id) {
    return await apiFetch(`/simulaciones/${id}`, { method: 'DELETE' });
}

// ============================================================
// MEDICIONES
// ============================================================
async function getMediciones(simId) {
    const res = await apiFetch(`/simulaciones/${simId}/mediciones`);
    return res.data;
}

async function guardarMedicion(datos) {
    const res = await apiFetch('/mediciones', {
        method: 'POST',
        body: JSON.stringify(datos),
    });
    return res.data;
}

async function guardarMedicionesBatch(mediciones) {
    const res = await apiFetch('/mediciones/batch', {
        method: 'POST',
        body: JSON.stringify({ mediciones }),
    });
    return res;
}

// ============================================================
// DECISIONES
// ============================================================
async function getDecisiones(simId) {
    const res = await apiFetch(`/simulaciones/${simId}/decisiones`);
    return res.data;
}

async function guardarDecision(datos) {
    const res = await apiFetch('/decisiones', {
        method: 'POST',
        body: JSON.stringify(datos),
    });
    return res.data;
}

// ============================================================
// REPORTES
// ============================================================
async function getTopBiomasa() {
    const res = await apiFetch('/reportes/top-biomasa');
    return res.data;
}

async function getEficiencia() {
    const res = await apiFetch('/reportes/eficiencia');
    return res.data;
}

async function getPromedioMadurez() {
    const res = await apiFetch('/reportes/promedio-madurez');
    return res.data;
}

async function compararSimulaciones(id1, id2) {
    const res = await apiFetch(`/reportes/comparar/${id1}/${id2}`);
    return res.data;
}

// Exportar para uso global
window.API = {
    getEspecies, getEspecie,
    getSimulaciones, getSimulacion, crearSimulacion, actualizarSimulacion, eliminarSimulacion,
    getMediciones, guardarMedicion, guardarMedicionesBatch,
    getDecisiones, guardarDecision,
    getTopBiomasa, getEficiencia, getPromedioMadurez, compararSimulaciones
};
