-- ============================================================
-- Práctica 05 – Laboratorio Bioinformático de Cultivo
-- seed.sql – Datos de prueba (semilla)
-- ============================================================

USE practica05_bioinformatica;

-- -------------------------------------------------------
-- ESPECIES (8 especies de catálogo)
-- -------------------------------------------------------
INSERT INTO especies (nombre_comun, nombre_cientifico, familia, tipo,
  temp_min, temp_max, temp_optima, luz_min, luz_max, luz_optima,
  agua_min, agua_max, agua_optima, nutrientes_opt, co2_optimo,
  tasa_r, capacidad_k, dias_madurez, biomasa_max,
  color_tallo, color_hoja, color_flor, descripcion) VALUES

('Maíz', 'Zea mays', 'Poaceae', 'herbácea',
 10, 40, 28, 300, 2200, 1000, 30, 75, 55, 75, 400,
 0.18, 120, 120, 800,
 '#3d6b28', '#5cb31a', '#f5e642',
 'Cereal de alto rendimiento originario de Mesoamérica. Base alimentaria mundial.'),

('Frijol', 'Phaseolus vulgaris', 'Fabaceae', 'herbácea',
 12, 35, 24, 200, 1800, 700, 35, 70, 50, 65, 380,
 0.14, 80, 85, 350,
 '#2d5a1e', '#3d8b2f', '#ffffff',
 'Leguminosa rica en proteínas, fija nitrógeno al suelo.'),

('Tomate', 'Solanum lycopersicum', 'Solanaceae', 'herbácea',
 13, 38, 26, 250, 2000, 850, 40, 80, 60, 70, 400,
 0.16, 110, 100, 600,
 '#2e6b18', '#4caf50', '#ffd700',
 'Hortaliza de fruto rojo ampliamente cultivada en invernaderos.'),

('Arabidopsis', 'Arabidopsis thaliana', 'Brassicaceae', 'herbácea',
 8, 30, 22, 100, 1200, 500, 25, 65, 45, 60, 400,
 0.20, 30, 45, 50,
 '#3a7a3a', '#7cc87c', '#eeeeee',
 'Planta modelo de investigación genética, genoma completamente secuenciado.'),

('Plumeria', 'Plumeria rubra', 'Apocynaceae', 'arbórea',
 15, 38, 27, 300, 2200, 1000, 20, 60, 40, 60, 400,
 0.12, 150, 365, 1200,
 '#274e2b', '#9ee32b', '#fafafa',
 'Árbol tropical ornamental con flores fragantes. Originario de México y Centroamérica.'),

('Girasol', 'Helianthus annuus', 'Asteraceae', 'herbácea',
 10, 38, 27, 400, 2500, 1200, 30, 70, 50, 65, 400,
 0.17, 100, 95, 500,
 '#4a7a22', '#6db33f', '#ffc107',
 'Planta oleaginosa con heliotropismo. Sus semillas son ricas en aceite.'),

('Agave', 'Agave tequilana', 'Asparagaceae', 'suculenta',
 5, 45, 28, 500, 2800, 1500, 10, 40, 25, 40, 380,
 0.05, 200, 2555, 5000,
 '#2b5e37', '#4a8c50', '#e8e8c0',
 'Suculenta de crecimiento lento usada para producción de tequila y mezcal.'),

('Lavanda', 'Lavandula angustifolia', 'Lamiaceae', 'arbustiva',
 5, 35, 22, 400, 2200, 1000, 15, 50, 30, 50, 400,
 0.10, 70, 180, 300,
 '#4a6741', '#7a9e6b', '#9370db',
 'Planta aromática mediterránea con propiedades medicinales.');


-- -------------------------------------------------------
-- SIMULACIONES PRE-CARGADAS (6 simulaciones con datos)
-- -------------------------------------------------------

-- Sim 1: Maíz – Logístico – Condiciones óptimas
INSERT INTO simulaciones (nombre, especie_id, modelo, temperatura, luz, agua, nutrientes, co2,
  param_r, param_k, dias_simulados, estado, notas, biomasa_final, altura_final, hojas_total, ramas_total, estres_promedio)
VALUES ('Maíz Óptimo – Parcela A', 1, 'logistico', 28, 1000, 55, 75, 400,
  0.18, 120, 60, 'completada', 'Simulación base con condiciones ideales para Zea mays.',
  520.3, 95.2, 14, 3, 8.5);

-- Sim 2: Maíz – Logístico – Estrés hídrico
INSERT INTO simulaciones (nombre, especie_id, modelo, temperatura, luz, agua, nutrientes, co2,
  param_r, param_k, dias_simulados, estado, notas, biomasa_final, altura_final, hojas_total, ramas_total, estres_promedio)
VALUES ('Maíz Estrés Hídrico – Parcela B', 1, 'logistico', 28, 1000, 25, 75, 400,
  0.18, 120, 60, 'completada', 'Maíz con riego insuficiente (25% vs 55% óptimo).',
  310.7, 68.4, 10, 2, 42.3);

-- Sim 3: Tomate – Gompertz – Invernadero
INSERT INTO simulaciones (nombre, especie_id, modelo, temperatura, luz, agua, nutrientes, co2,
  param_r, param_k, dias_simulados, estado, notas, biomasa_final, altura_final, hojas_total, ramas_total, estres_promedio)
VALUES ('Tomate Invernadero Gompertz', 3, 'gompertz', 26, 850, 60, 70, 450,
  0.16, 110, 50, 'completada', 'Tomate bajo modelo Gompertz con CO₂ ligeramente elevado.',
  385.6, 82.1, 22, 6, 5.2);

-- Sim 4: Plumeria – Logístico – Jardín
INSERT INTO simulaciones (nombre, especie_id, modelo, temperatura, luz, agua, nutrientes, co2,
  param_r, param_k, dias_simulados, estado, notas, biomasa_final, altura_final, hojas_total, ramas_total, estres_promedio)
VALUES ('Plumeria Rubra – Jardín Tropical', 5, 'logistico', 27, 1000, 40, 60, 400,
  0.12, 150, 90, 'completada', 'Crecimiento de Plumeria en condiciones de jardín tropical.',
  620.8, 110.5, 15, 5, 6.8);

-- Sim 5: Frijol – Exponencial – Alta Luz
INSERT INTO simulaciones (nombre, especie_id, modelo, temperatura, luz, agua, nutrientes, co2,
  param_r, param_k, dias_simulados, estado, notas, biomasa_final, altura_final, hojas_total, ramas_total, estres_promedio)
VALUES ('Frijol Exponencial Alta Luz', 2, 'exponencial', 24, 1500, 50, 65, 380,
  0.14, 80, 40, 'completada', 'Frijol bajo modelo exponencial con irradiancia elevada.',
  280.4, 55.3, 12, 4, 22.1);

-- Sim 6: Arabidopsis – Lineal – Laboratorio
INSERT INTO simulaciones (nombre, especie_id, modelo, temperatura, luz, agua, nutrientes, co2,
  param_r, param_k, dias_simulados, estado, notas, biomasa_final, altura_final, hojas_total, ramas_total, estres_promedio)
VALUES ('Arabidopsis Lab – Crecimiento Lineal', 4, 'lineal', 22, 500, 45, 60, 400,
  0.20, 30, 30, 'completada', 'Arabidopsis en cámara de crecimiento con modelo lineal simple.',
  38.5, 18.2, 8, 0, 3.1);


-- -------------------------------------------------------
-- MEDICIONES para Simulación 1 (Maíz Óptimo, 60 días, cada 5 días)
-- -------------------------------------------------------
INSERT INTO mediciones (simulacion_id, dia, altura, biomasa, num_hojas, num_ramas,
  indice_estres_hidrico, indice_estres_termico, indice_estres_luminico, indice_estres_nutricional,
  estres_total, icr, prediccion_cosecha_dias) VALUES
(1,  5,   8.2,  12.5,  2, 0,  3, 2, 5, 4,  3.5,  0.18, 115),
(1, 10,  18.4,  38.0,  4, 0,  4, 3, 4, 3,  3.5,  0.22, 110),
(1, 15,  32.1,  85.3,  6, 1,  5, 2, 3, 5,  3.8,  0.25, 105),
(1, 20,  48.5, 155.0,  8, 1,  3, 4, 6, 3,  4.0,  0.20, 100),
(1, 25,  62.3, 240.2,  9, 2,  6, 3, 5, 4,  4.5,  0.16, 95),
(1, 30,  72.8, 320.5, 10, 2,  4, 5, 4, 3,  4.0,  0.12, 90),
(1, 35,  80.1, 385.0, 11, 2,  5, 3, 6, 5,  4.8,  0.09, 85),
(1, 40,  85.4, 430.8, 12, 3,  3, 4, 5, 4,  4.0,  0.06, 80),
(1, 45,  89.2, 465.0, 13, 3,  7, 3, 4, 6,  5.0,  0.04, 75),
(1, 50,  92.0, 490.5, 13, 3,  5, 5, 5, 4,  4.8,  0.03, 70),
(1, 55,  93.8, 508.0, 14, 3,  4, 4, 6, 5,  4.8,  0.02, 65),
(1, 60,  95.2, 520.3, 14, 3,  6, 3, 5, 4,  4.5,  0.01, 60);

-- MEDICIONES para Simulación 2 (Maíz Estrés Hídrico, 60 días)
INSERT INTO mediciones (simulacion_id, dia, altura, biomasa, num_hojas, num_ramas,
  indice_estres_hidrico, indice_estres_termico, indice_estres_luminico, indice_estres_nutricional,
  estres_total, icr, prediccion_cosecha_dias) VALUES
(2,  5,   5.1,   7.8,  2, 0, 45, 3, 5, 4, 35.2, 0.12, 130),
(2, 10,  11.2,  20.5,  3, 0, 50, 2, 4, 5, 38.5, 0.15, 128),
(2, 15,  18.8,  42.0,  4, 0, 55, 4, 6, 3, 42.0, 0.14, 125),
(2, 20,  26.5,  72.3,  5, 1, 48, 3, 5, 6, 39.5, 0.11, 120),
(2, 25,  34.0, 108.5,  6, 1, 52, 5, 4, 4, 41.0, 0.09, 115),
(2, 30,  40.8, 148.0,  7, 1, 58, 4, 6, 5, 45.8, 0.07, 112),
(2, 35,  47.2, 190.2,  8, 1, 55, 3, 5, 6, 43.5, 0.06, 108),
(2, 40,  52.5, 228.5,  8, 2, 50, 5, 4, 4, 40.3, 0.05, 105),
(2, 45,  57.0, 260.0,  9, 2, 53, 4, 6, 5, 42.5, 0.04, 100),
(2, 50,  61.2, 282.3,  9, 2, 56, 3, 5, 6, 44.0, 0.03, 95),
(2, 55,  64.8, 298.5, 10, 2, 48, 5, 4, 4, 38.3, 0.02, 90),
(2, 60,  68.4, 310.7, 10, 2, 52, 4, 6, 5, 42.3, 0.01, 85);

-- MEDICIONES para Simulación 3 (Tomate Invernadero, 50 días)
INSERT INTO mediciones (simulacion_id, dia, altura, biomasa, num_hojas, num_ramas,
  indice_estres_hidrico, indice_estres_termico, indice_estres_luminico, indice_estres_nutricional,
  estres_total, icr, prediccion_cosecha_dias) VALUES
(3,  5,  6.5,  10.2,  3, 0,  2, 1, 3, 2,  2.0, 0.20, 95),
(3, 10, 15.8,  32.5,  6, 1,  3, 2, 2, 3,  2.5, 0.24, 90),
(3, 15, 28.5,  72.0,  9, 2,  2, 3, 4, 2,  2.8, 0.22, 85),
(3, 20, 42.0, 128.5, 12, 3,  4, 2, 3, 3,  3.0, 0.18, 80),
(3, 25, 54.8, 195.0, 15, 4,  3, 3, 2, 4,  3.0, 0.14, 75),
(3, 30, 64.2, 258.3, 17, 4,  2, 4, 3, 2,  2.8, 0.10, 70),
(3, 35, 71.5, 308.0, 19, 5,  4, 2, 4, 3,  3.3, 0.07, 65),
(3, 40, 76.8, 345.2, 20, 5,  3, 3, 3, 4,  3.3, 0.05, 60),
(3, 45, 80.2, 370.0, 21, 6,  2, 4, 2, 3,  2.8, 0.03, 55),
(3, 50, 82.1, 385.6, 22, 6,  4, 3, 3, 2,  3.0, 0.02, 50);

-- MEDICIONES para Simulación 4 (Plumeria, 90 días, cada 10 días)
INSERT INTO mediciones (simulacion_id, dia, altura, biomasa, num_hojas, num_ramas,
  indice_estres_hidrico, indice_estres_termico, indice_estres_luminico, indice_estres_nutricional,
  estres_total, icr, prediccion_cosecha_dias) VALUES
(4, 10,   8.5,  15.0,  2, 0,  5, 3, 4, 6,  4.5, 0.15, 355),
(4, 20,  20.2,  48.5,  4, 1,  4, 4, 5, 5,  4.5, 0.18, 345),
(4, 30,  38.0, 105.2,  6, 2,  6, 3, 3, 4,  4.0, 0.16, 335),
(4, 40,  55.8, 185.0,  8, 3,  5, 5, 4, 6,  5.0, 0.12, 325),
(4, 50,  72.0, 280.5, 10, 3,  3, 4, 6, 5,  4.5, 0.10, 315),
(4, 60,  85.2, 380.0, 12, 4,  6, 3, 5, 4,  4.5, 0.08, 305),
(4, 70,  95.0, 470.5, 13, 4,  4, 5, 4, 6,  4.8, 0.05, 295),
(4, 80, 103.8, 550.2, 14, 5,  5, 4, 6, 5,  5.0, 0.03, 285),
(4, 90, 110.5, 620.8, 15, 5,  3, 6, 5, 4,  4.5, 0.02, 275);

-- MEDICIONES para Simulación 5 (Frijol Exp, 40 días)
INSERT INTO mediciones (simulacion_id, dia, altura, biomasa, num_hojas, num_ramas,
  indice_estres_hidrico, indice_estres_termico, indice_estres_luminico, indice_estres_nutricional,
  estres_total, icr, prediccion_cosecha_dias) VALUES
(5,  5,   5.0,   8.5,  2, 0,  8, 3, 20, 5, 15.0, 0.16, 80),
(5, 10,  12.8,  25.0,  4, 1, 10, 4, 22, 6, 18.5, 0.22, 75),
(5, 15,  22.5,  58.0,  6, 2, 12, 3, 25, 4, 20.0, 0.24, 70),
(5, 20,  32.0, 105.3,  8, 2, 10, 5, 28, 5, 22.5, 0.20, 65),
(5, 25,  40.5, 162.0,  9, 3, 14, 4, 24, 6, 21.0, 0.15, 60),
(5, 30,  46.8, 210.5, 10, 3, 12, 5, 26, 4, 22.3, 0.10, 55),
(5, 35,  51.5, 248.0, 11, 4, 15, 3, 22, 5, 20.5, 0.06, 50),
(5, 40,  55.3, 280.4, 12, 4, 13, 4, 24, 6, 22.1, 0.04, 45);

-- MEDICIONES para Simulación 6 (Arabidopsis Lab, 30 días)
INSERT INTO mediciones (simulacion_id, dia, altura, biomasa, num_hojas, num_ramas,
  indice_estres_hidrico, indice_estres_termico, indice_estres_luminico, indice_estres_nutricional,
  estres_total, icr, prediccion_cosecha_dias) VALUES
(6,  5,   3.0,   5.2,  2, 0,  2, 1, 3, 2,  2.0, 0.22, 40),
(6, 10,   6.1,  11.5,  3, 0,  3, 2, 2, 3,  2.5, 0.20, 35),
(6, 15,   9.2,  18.0,  4, 0,  2, 1, 4, 2,  2.3, 0.19, 30),
(6, 20,  12.5,  25.0,  5, 0,  4, 3, 3, 3,  3.3, 0.18, 25),
(6, 25,  15.5,  32.0,  6, 0,  3, 2, 2, 4,  2.8, 0.17, 20),
(6, 30,  18.2,  38.5,  8, 0,  2, 3, 4, 3,  3.0, 0.16, 15);


-- -------------------------------------------------------
-- DECISIONES de ejemplo
-- -------------------------------------------------------
INSERT INTO decisiones (simulacion_id, dia, tipo, prioridad, mensaje, valor_actual, valor_sugerido) VALUES
(1, 25, 'riego', 'baja', 'Niveles de humedad dentro de rango. Continuar plan de riego.', 55, 55),
(1, 45, 'nutrientes', 'media', 'ICR en descenso. Considerar fertilización suplementaria.', 70, 80),
(2, 10, 'riego', 'alta', 'Estrés hídrico severo (50%). Aumentar riego urgentemente.', 25, 55),
(2, 30, 'riego', 'crítica', 'Estrés hídrico crítico (58%). La planta muestra marchitez. Regar inmediatamente.', 25, 60),
(3, 20, 'temperatura', 'baja', 'Temperatura óptima mantenida. Sin acciones necesarias.', 26, 26),
(3, 35, 'cosecha', 'media', 'Tomate alcanzando 80% de biomasa máxima. Preparar cosecha en ~30 días.', 308, NULL),
(4, 50, 'general', 'baja', 'Plumeria en crecimiento saludable. Especie de ciclo largo.', NULL, NULL),
(5, 15, 'luz', 'media', 'Irradiancia alta (1500) puede causar fotoinhibición. Considerar sombreo.', 1500, 900),
(6,  5, 'general', 'baja', 'Arabidopsis en cámara controlada. Todas las variables en rango.', NULL, NULL),
(2, 50, 'general', 'alta', 'Especie bajo estrés continuo. Rendimiento estimado 40% menor que parcela A.', NULL, NULL);
