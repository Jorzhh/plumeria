/**
 * GrowthEngine - Motor Fisiológico y Biológico
 * Calcula el crecimiento diferencial, los índices de estrés y genera el diagnóstico individualizado
 * ("Cómo se siente") para cada una de las 5 plantas en el Día X.
 */
class GrowthEngine {
    constructor() {
        this.especie = null;
        this.model = 'logistico';
        this.dia = 0;
        this.maxDias = 120;
        this.params = { r: 0.12, K: 150 };
        this.environment = { temperatura: 25, agua: 55, luz: 800, nutrientes: 70, co2: 400 };
        this.mediciones = [];
        this.plantasEstado = [];
    }

    setEspecie(especie) {
        this.especie = especie;
        this.params.r = especie.tasa_r || 0.12;
        this.params.K = especie.capacidad_k || 150;
        this.maxDias = especie.dias_madurez || 120;
    }

    setModel(modelo) { this.model = modelo; }
    setEnvironment(env) { this.environment = { ...this.environment, ...env }; }
    setParams(r, K) { this.params.r = parseFloat(r); this.params.K = parseFloat(K); }

    calcularEstresHidrico(aguaVal = null) {
        const agua = aguaVal !== null ? aguaVal : this.environment.agua;
        const opt = this.especie ? this.especie.agua_optima : 55;
        return Math.min(100, Math.round((Math.abs(agua - opt) / opt) * 100));
    }

    calcularEstresTermico(tempVal = null) {
        const temp = tempVal !== null ? tempVal : this.environment.temperatura;
        const opt = this.especie ? this.especie.temp_optima : 25;
        return Math.min(100, Math.round((Math.abs(temp - opt) / opt) * 100));
    }

    calcularEstresLuminico() {
        const opt = this.especie ? this.especie.luz_optima : 800;
        return Math.min(100, Math.round((Math.abs(this.environment.luz - opt) / opt) * 100));
    }

    calcularEstresNutricional() {
        const opt = this.especie ? this.especie.nutrientes_opt : 70;
        return Math.min(100, Math.round((Math.abs(this.environment.nutrientes - opt) / opt) * 100));
    }

    calcularEstresTotal(envCustom = null) {
        const eH = envCustom ? this.calcularEstresHidrico(envCustom.agua) : this.calcularEstresHidrico();
        const eT = envCustom ? this.calcularEstresTermico(envCustom.temperatura) : this.calcularEstresTermico();
        const eL = this.calcularEstresLuminico();
        const eN = this.calcularEstresNutricional();
        return Math.min(100, Math.round(eH * 0.35 + eT * 0.30 + eL * 0.20 + eN * 0.15));
    }

    calcularBiomasaDia(t, modeloCustom = null, paramsCustom = null, envCustom = null) {
        const modelo = modeloCustom || this.model;
        const r = paramsCustom ? paramsCustom.r : this.params.r;
        const K = paramsCustom ? paramsCustom.K : this.params.K;
        const N0 = 1.0;

        const estres = envCustom ? this.calcularEstresTotal(envCustom) : this.calcularEstresTotal();
        const factorEstres = Math.max(0.05, 1.0 - (estres / 100) * 0.85);
        const rEfectivo = r * factorEstres;

        switch (modelo) {
            case 'lineal': return Math.min(K, N0 + (rEfectivo * 3.5) * t);
            case 'exponencial': return Math.min(K, N0 * Math.exp(rEfectivo * t * 0.08));
            case 'gompertz': return K * Math.exp(-Math.exp(-rEfectivo * (t * 0.1 - 1.5)));
            case 'logistico':
            default: return K / (1 + ((K - N0) / N0) * Math.exp(-rEfectivo * t * 0.12));
        }
    }

    evaluarSentimientoPlanta(estresVal, eH, eT) {
        if (estresVal < 15) {
            return { estado: "Sintiéndose excelente", turgencia: "100% Turgente", vigor: "Vigor Biológico Óptimo", descripcion: "Planta radiante con alta actividad fotosintética." };
        } else if (estresVal < 35) {
            return { estado: "Sintiéndose con leve estrés", turgencia: "85% Leve flacidez", vigor: "Desarrollo Moderado", descripcion: "Ligera inhibición transitoria del crecimiento." };
        } else if (eH > eT && eH > 35) {
            return { estado: "Sintiéndose marchita y deshidratada", turgencia: "40% Pérdida de turgencia", vigor: "Estrés Hídrico Severo", descripcion: "Cierre estomático por sequía de sustrato." };
        } else if (eT > 35) {
            return { estado: "Sintiéndose sofocada por clorosis térmica", turgencia: "50% Hojas amarillentas", vigor: "Estrés Térmico", descripcion: "Alteración de enzimas fotoprotectoras." };
        } else {
            return { estado: "Sintiéndose en estado crítico", turgencia: "20% Marchitez progresiva", vigor: "Riesgo de Senescencia", descripcion: "Déficit nutricional y abiótico combinado." };
        }
    }

    generarMedicion(dia) {
        const biomasaUnit = this.calcularBiomasaDia(dia);
        const K = this.params.K;
        const alturaUnit = (biomasaUnit / K) * 2.8;
        const estresTotal = this.calcularEstresTotal();

        const numHojas = Math.floor((biomasaUnit / K) * 20);
        const numRamas = Math.floor((biomasaUnit / K) * 4);

        const bioAnt = dia > 0 ? this.calcularBiomasaDia(dia - 1) : biomasaUnit;
        const icr = dia > 0 ? (Math.log(Math.max(0.1, biomasaUnit)) - Math.log(Math.max(0.1, bioAnt))) : 0;

        return {
            dia,
            biomasa: parseFloat(biomasaUnit.toFixed(2)),
            altura: parseFloat(alturaUnit.toFixed(2)),
            num_hojas: numHojas,
            num_ramas: numRamas,
            icr: parseFloat(icr.toFixed(4)),
            estres_total: estresTotal,
            indice_estres_hidrico: this.calcularEstresHidrico(),
            indice_estres_termico: this.calcularEstresTermico(),
            indice_estres_luminico: this.calcularEstresLuminico(),
            indice_estres_nutricional: this.calcularEstresNutricional(),
            prediccion_cosecha_dias: Math.max(0, (this.especie ? this.especie.dias_madurez : 120) - dia)
        };
    }

    simularHastaDia(dia) {
        this.dia = dia;
        this.mediciones = [];
        this.plantasEstado = [];

        for (let d = 0; d <= dia; d++) {
            this.mediciones.push(this.generarMedicion(d));
        }

        const medActual = this.generarMedicion(dia);
        const varianzas = [1.0, 0.95, 1.04, 0.97, 1.02];

        for (let i = 0; i < 5; i++) {
            const v = varianzas[i];
            const estresPlanta = Math.min(100, Math.round(medActual.estres_total * (2 - v)));
            const sentimiento = this.evaluarSentimientoPlanta(
                estresPlanta, 
                medActual.indice_estres_hidrico, 
                medActual.indice_estres_termico
            );

            this.plantasEstado.push({
                plantaId: i + 1,
                nombre: i === 0 ? "Planta Principal (Plumeria Rubra)" : `Planta En Fila #${i + 1}`,
                dia: dia,
                altura: parseFloat((medActual.altura * v).toFixed(2)),
                biomasa: parseFloat((medActual.biomasa * v).toFixed(2)),
                hojas: Math.floor(medActual.num_hojas * v),
                ramas: Math.floor(medActual.num_ramas * v),
                estres: estresPlanta,
                sentimiento: sentimiento.estado,
                turgencia: sentimiento.turgencia,
                vigor: sentimiento.vigor,
                diagnostico: sentimiento.descripcion
            });
        }

        return medActual;
    }

    generarDecisiones(dia) {
        const decisiones = [];
        const eH = this.calcularEstresHidrico();
        const eT = this.calcularEstresTermico();
        const optAgua = this.especie ? this.especie.agua_optima : 55;
        const optTemp = this.especie ? this.especie.temp_optima : 25;

        if (eH > 35) {
            decisiones.push({
                tipo: 'Riego',
                prioridad: eH > 60 ? 'critica' : 'alta',
                mensaje: `Estrés Hídrico en ${eH}%. Ajustar lámina de riego hacia ${optAgua}%.`
            });
        }
        if (eT > 35) {
            decisiones.push({
                tipo: 'Temperatura',
                prioridad: 'alta',
                mensaje: `Desviación térmica en ${eT}%. Regular climatización a ${optTemp}°C.`
            });
        }
        if (decisiones.length === 0) {
            decisiones.push({
                tipo: 'Control',
                prioridad: 'baja',
                mensaje: `Día ${dia}: Cultivo en condiciones biológicas ideales.`
            });
        }
        return decisiones;
    }
}

window.GrowthEngine = GrowthEngine;