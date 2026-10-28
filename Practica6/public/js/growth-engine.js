/**
 * Práctica 06 – Motor Bioinformático de Crecimiento
 * Modelos matemáticos: Lineal, Exponencial, Logístico (Verhulst), Gompertz
 * Cálculo de estrés y predicción de cosecha
 */

class GrowthEngine {
    constructor() {
        this.model = 'logistico';
        this.params = { r: 0.15, K: 100, N0: 1, t0: 45 };
        this.environment = { temperatura: 25, luz: 800, agua: 55, nutrientes: 70, co2: 400 };
        this.optimos = { temperatura: 25, luz: 800, agua: 55, nutrientes: 70, co2: 400 };
        this.especie = null;
        this.mediciones = [];
        this.dia = 0;
        this.maxDias = 120;
    }

    // ============================================================
    // Configuración
    // ============================================================
    setModel(model) {
        this.model = model;
    }

    setParams(r, K, N0) {
        this.params.r = r;
        this.params.K = K;
        this.params.N0 = N0 || 1;
        this.params.t0 = Math.round(K / (2 * r));
    }

    setEnvironment(env) {
        this.environment = { ...this.environment, ...env };
    }

    setEspecie(especie) {
        this.especie = especie;
        this.optimos = {
            temperatura: parseFloat(especie.temp_optima) || 25,
            luz: parseFloat(especie.luz_optima) || 800,
            agua: parseFloat(especie.agua_optima) || 55,
            nutrientes: parseFloat(especie.nutrientes_opt) || 70,
            co2: parseFloat(especie.co2_optimo) || 400,
        };
        this.setParams(
            parseFloat(especie.tasa_r) || 0.15,
            parseFloat(especie.capacidad_k) || 100,
            1
        );
        this.maxDias = parseInt(especie.dias_madurez) || 120;
    }

    reset() {
        this.dia = 0;
        this.mediciones = [];
    }

    // ============================================================
    // Modelos de crecimiento N(t)
    // ============================================================
    calcularCrecimiento(t) {
        const { r, K, N0, t0 } = this.params;
        const stressFactor = 1 - (this.calcularEstresTotal() / 200); // Reduce growth by stress
        const rEff = r * Math.max(0.1, stressFactor);

        switch (this.model) {
            case 'lineal':
                // N(t) = a·t + b
                return Math.min(K, N0 + rEff * (K - N0) * (t / this.maxDias));

            case 'exponencial':
                // N(t) = N0 · e^(r·t), limitado suavemente por K
                return Math.min(K * 1.2, N0 * Math.exp(rEff * t * 0.08));

            case 'logistico':
                // Verhulst: N(t) = K / (1 + ((K - N0) / N0) · e^(-r·t))
                return K / (1 + ((K - N0) / N0) * Math.exp(-rEff * t));

            case 'gompertz':
                // Gompertz: N(t) = K · exp(-exp(-r·(t - t0)))
                return K * Math.exp(-Math.exp(-rEff * (t - (this.maxDias * 0.35)) * 0.15));

            default:
                return this.calcularLogistico(t, rEff, K, N0);
        }
    }

    // ============================================================
    // Índices de estrés (0-100)
    // ============================================================
    calcularEstres(valor, optimo, minimo, maximo) {
        if (valor >= minimo && valor <= maximo) {
            const desviacion = Math.abs(valor - optimo) / (maximo - minimo);
            return Math.min(100, Math.round(desviacion * 100));
        }
        return 100; // Fuera de rango = estrés máximo
    }

    calcularEstresHidrico() {
        const esp = this.especie || {};
        return this.calcularEstres(
            this.environment.agua,
            this.optimos.agua,
            parseFloat(esp.agua_min) || 10,
            parseFloat(esp.agua_max) || 90
        );
    }

    calcularEstresTermico() {
        const esp = this.especie || {};
        return this.calcularEstres(
            this.environment.temperatura,
            this.optimos.temperatura,
            parseFloat(esp.temp_min) || 5,
            parseFloat(esp.temp_max) || 45
        );
    }

    calcularEstresLuminico() {
        const esp = this.especie || {};
        return this.calcularEstres(
            this.environment.luz,
            this.optimos.luz,
            parseFloat(esp.luz_min) || 100,
            parseFloat(esp.luz_max) || 2500
        );
    }

    calcularEstresNutricional() {
        return Math.min(100, Math.round(Math.abs(this.environment.nutrientes - this.optimos.nutrientes)));
    }

    calcularEstresTotal() {
        const eh = this.calcularEstresHidrico();
        const et = this.calcularEstresTermico();
        const el = this.calcularEstresLuminico();
        const en = this.calcularEstresNutricional();
        return Math.round((eh * 0.35 + et * 0.25 + el * 0.20 + en * 0.20));
    }

    // ============================================================
    // Biomasa estimada (g) a partir del crecimiento normalizado
    // ============================================================
    calcularBiomasa(t) {
        const bioMax = this.especie ? parseFloat(this.especie.biomasa_max) || 500 : 500;
        const N = this.calcularCrecimiento(t);
        const K = this.params.K;
        return Math.round((N / K) * bioMax * 100) / 100;
    }

    // ============================================================
    // Número de hojas y ramas estimados
    // ============================================================
    calcularHojas(t) {
        const progreso = Math.min(1, this.calcularCrecimiento(t) / this.params.K);
        const maxHojas = this.especie ? Math.round(parseFloat(this.especie.capacidad_k) / 5) : 15;
        return Math.round(progreso * maxHojas);
    }

    calcularRamas(t) {
        const progreso = Math.min(1, this.calcularCrecimiento(t) / this.params.K);
        const maxRamas = Math.max(1, Math.round(this.calcularHojas(t) / 4));
        return Math.round(progreso * maxRamas);
    }

    // ============================================================
    // ICR – Índice de Crecimiento Relativo
    // ============================================================
    calcularICR(t) {
        if (t <= 0) return 0;
        const N1 = this.calcularCrecimiento(t);
        const N0 = this.calcularCrecimiento(t - 1);
        if (N0 <= 0) return 0;
        return Math.round(((N1 - N0) / N0) * 1000) / 1000;
    }

    // ============================================================
    // Predicción de cosecha
    // ============================================================
    predecirCosecha(t) {
        const diasMadurez = this.maxDias;
        const progreso = this.calcularCrecimiento(t) / this.params.K;
        if (progreso >= 0.95) return 0;
        // Estimar días restantes basado en progreso actual
        const diasRestantes = Math.max(0, Math.round(diasMadurez * (1 - progreso)));
        return diasRestantes;
    }

    // ============================================================
    // Generar medición completa para un día
    // ============================================================
    generarMedicion(dia) {
        const altura = Math.round(this.calcularCrecimiento(dia) * 100) / 100;
        const biomasa = this.calcularBiomasa(dia);
        const numHojas = this.calcularHojas(dia);
        const numRamas = this.calcularRamas(dia);
        const eh = this.calcularEstresHidrico();
        const et = this.calcularEstresTermico();
        const el = this.calcularEstresLuminico();
        const en = this.calcularEstresNutricional();
        const estresTotal = this.calcularEstresTotal();
        const icr = this.calcularICR(dia);
        const prediccionCosecha = this.predecirCosecha(dia);

        return {
            dia, altura, biomasa,
            num_hojas: numHojas,
            num_ramas: numRamas,
            indice_estres_hidrico: eh,
            indice_estres_termico: et,
            indice_estres_luminico: el,
            indice_estres_nutricional: en,
            estres_total: estresTotal,
            icr,
            prediccion_cosecha_dias: prediccionCosecha
        };
    }

    // ============================================================
    // Simular avance de un paso (día)
    // ============================================================
    step() {
        this.dia++;
        const med = this.generarMedicion(this.dia);
        this.mediciones.push(med);
        return med;
    }

    // ============================================================
    // Simular todos los días de golpe
    // ============================================================
    simularCompleto(dias) {
        this.reset();
        const totalDias = dias || this.maxDias;
        for (let d = 1; d <= totalDias; d++) {
            this.dia = d;
            this.mediciones.push(this.generarMedicion(d));
        }
        return this.mediciones;
    }

    // ============================================================
    // Motor de decisiones
    // ============================================================
    generarDecisiones(dia) {
        const decisiones = [];
        const eh = this.calcularEstresHidrico();
        const et = this.calcularEstresTermico();
        const el = this.calcularEstresLuminico();
        const en = this.calcularEstresNutricional();
        const progreso = this.calcularCrecimiento(dia) / this.params.K;

        // Riego
        if (eh > 40) {
            decisiones.push({
                tipo: 'riego', prioridad: eh > 60 ? 'crítica' : 'alta',
                mensaje: `Estrés hídrico ${eh > 60 ? 'crítico' : 'alto'} (${eh}%). Aumentar riego de ${this.environment.agua}% a ${this.optimos.agua}%.`,
                valor_actual: this.environment.agua, valor_sugerido: this.optimos.agua
            });
        } else if (eh > 20) {
            decisiones.push({
                tipo: 'riego', prioridad: 'media',
                mensaje: `Estrés hídrico moderado (${eh}%). Considerar ajuste de riego.`,
                valor_actual: this.environment.agua, valor_sugerido: this.optimos.agua
            });
        }

        // Temperatura
        if (et > 40) {
            const accion = this.environment.temperatura > this.optimos.temperatura ? 'Reducir' : 'Aumentar';
            decisiones.push({
                tipo: 'temperatura', prioridad: et > 60 ? 'crítica' : 'alta',
                mensaje: `Estrés térmico ${et > 60 ? 'crítico' : 'alto'} (${et}%). ${accion} temperatura de ${this.environment.temperatura}°C a ${this.optimos.temperatura}°C.`,
                valor_actual: this.environment.temperatura, valor_sugerido: this.optimos.temperatura
            });
        }

        // Luz
        if (el > 30) {
            const accion = this.environment.luz > this.optimos.luz ? 'Reducir (sombrear)' : 'Aumentar';
            decisiones.push({
                tipo: 'luz', prioridad: 'media',
                mensaje: `Estrés lumínico (${el}%). ${accion} irradiancia de ${this.environment.luz} a ${this.optimos.luz} µmol/m²/s.`,
                valor_actual: this.environment.luz, valor_sugerido: this.optimos.luz
            });
        }

        // Nutrientes
        if (en > 25) {
            decisiones.push({
                tipo: 'nutrientes', prioridad: 'media',
                mensaje: `Déficit nutricional (${en}%). Ajustar fertilización de ${this.environment.nutrientes} a ${this.optimos.nutrientes}.`,
                valor_actual: this.environment.nutrientes, valor_sugerido: this.optimos.nutrientes
            });
        }

        // Cosecha
        if (progreso >= 0.90 && progreso < 0.98) {
            decisiones.push({
                tipo: 'cosecha', prioridad: 'alta',
                mensaje: `Planta al ${Math.round(progreso * 100)}% de madurez. Preparar cosecha en ~${this.predecirCosecha(dia)} días.`,
                valor_actual: Math.round(progreso * 100), valor_sugerido: 100
            });
        } else if (progreso >= 0.98) {
            decisiones.push({
                tipo: 'cosecha', prioridad: 'crítica',
                mensaje: '¡Planta madura! Cosechar ahora para máximo rendimiento.',
                valor_actual: Math.round(progreso * 100), valor_sugerido: 100
            });
        }

        // General si todo está bien
        if (decisiones.length === 0) {
            decisiones.push({
                tipo: 'general', prioridad: 'baja',
                mensaje: `Condiciones estables. Estrés total: ${this.calcularEstresTotal()}%. Progreso: ${Math.round(progreso * 100)}%.`,
                valor_actual: null, valor_sugerido: null
            });
        }

        return decisiones;
    }

    // ============================================================
    // Progreso normalizado 0-1 para el visor 3D
    // ============================================================
    getGrowthProgress() {
        if (this.dia <= 0) return 0;
        return Math.min(1, this.calcularCrecimiento(this.dia) / this.params.K);
    }
}

// Exportar globalmente
window.GrowthEngine = GrowthEngine;
