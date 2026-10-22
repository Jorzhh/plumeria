USE practica05_bioinformatica;

-- Datos semilla del catálogo botánico
INSERT INTO especies (nombre_comun, nombre_cientifico, tipo, temp_optima, agua_optima, luz_optima, nutrientes_opt, tasa_r, capacidad_k, dias_madurez, color_hoja, descripcion) VALUES
('Plumeria', 'Plumeria rubra', 'arbórea', 27, 40, 1000, 60, 0.12, 150, 120, '#88d424', 'Arbusto tropical de tallos leñosos succionadores de nutrientes y flores fragantes.'),
('Maíz', 'Zea mays', 'herbácea', 28, 55, 1000, 75, 0.18, 120, 90, '#5cb31a', 'Cereal C4 de alta eficiencia fotosintética y rápido desarrollo foliar.'),
('Tomate', 'Solanum lycopersicum', 'herbácea', 26, 60, 850, 70, 0.16, 110, 80, '#4caf50', 'Cultivo hortícola altamente sensible al estrés térmico e hídrico.'),
('Girasol', 'Helianthus annuus', 'herbácea', 25, 50, 1200, 65, 0.15, 180, 100, '#a3e043', 'Planta heliotrópica de rápida acumulación de biomasa foliar.'),
('Arabidopsis', 'Arabidopsis thaliana', 'herbácea', 22, 50, 600, 60, 0.22, 45, 45, '#388e3c', 'Organismo modelo bioinformático con ciclo biológico ultrarrápido.');

-- Simulación de referencia
INSERT INTO simulaciones (id, nombre, especie_id, modelo, temperatura, luz, agua, nutrientes, co2, param_r, param_k, dias_simulados, estado, notas, biomasa_final, altura_final, hojas_total, ramas_total, estres_promedio) VALUES
(1, 'Ensayo Control Plumeria Rubra - Surco de 5 Plantas', 1, 'logistico', 27, 1000, 40, 60, 400, 0.12, 150, 120, 'completada', 'Ensayo testigo de 5 plantas bajo condiciones óptimas.', 750.0, 2.8, 100, 20, 0.0);

-- Mediciones iniciales de prueba
INSERT INTO mediciones (simulacion_id, dia, biomasa, altura, num_hojas, num_ramas, icr, estres_total, indice_estres_hidrico, indice_estres_termico, indice_estres_luminico, indice_estres_nutricional) VALUES
(1, 0, 1.0, 0.02, 0, 0, 0.0000, 0, 0, 0, 0, 0),
(1, 30, 28.5, 0.53, 15, 0, 0.1117, 0, 0, 0, 0, 0),
(1, 60, 112.1, 2.09, 60, 12, 0.0456, 0, 0, 0, 0, 0),
(1, 90, 144.2, 2.69, 90, 18, 0.0084, 0, 0, 0, 0, 0),
(1, 120, 150.0, 2.80, 100, 20, 0.0013, 0, 0, 0, 0, 0);