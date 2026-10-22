CREATE DATABASE IF NOT EXISTS practica05_bioinformatica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE practica05_bioinformatica;

-- 1. Catálogo Botánico de Especies
CREATE TABLE IF NOT EXISTS especies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_comun VARCHAR(100) NOT NULL,
    nombre_cientifico VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'herbácea',
    temp_optima FLOAT DEFAULT 25,
    agua_optima FLOAT DEFAULT 55,
    luz_optima FLOAT DEFAULT 800,
    nutrientes_opt FLOAT DEFAULT 70,
    tasa_r FLOAT DEFAULT 0.12,
    capacidad_k FLOAT DEFAULT 150,
    dias_madurez INT DEFAULT 90,
    color_hoja VARCHAR(20) DEFAULT '#88d424',
    descripcion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Simulaciones Registradas
CREATE TABLE IF NOT EXISTS simulaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    especie_id INT NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    temperatura FLOAT NOT NULL,
    luz FLOAT NOT NULL,
    agua FLOAT NOT NULL,
    nutrientes FLOAT NOT NULL,
    co2 FLOAT NOT NULL,
    param_r FLOAT NOT NULL,
    param_k FLOAT NOT NULL,
    dias_simulados INT NOT NULL,
    estado ENUM('en_curso', 'completada', 'pausada') DEFAULT 'en_curso',
    notas TEXT,
    biomasa_final FLOAT DEFAULT 0,
    altura_final FLOAT DEFAULT 0,
    hojas_total INT DEFAULT 0,
    ramas_total INT DEFAULT 0,
    estres_promedio FLOAT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (especie_id) REFERENCES especies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Mediciones Diarias (Serie de Tiempo por Día X)
CREATE TABLE IF NOT EXISTS mediciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    dia INT NOT NULL,
    biomasa FLOAT NOT NULL,
    altura FLOAT NOT NULL,
    num_hojas INT NOT NULL,
    num_ramas INT NOT NULL,
    icr FLOAT NOT NULL,
    estres_total FLOAT NOT NULL,
    indice_estres_hidrico FLOAT DEFAULT 0,
    indice_estres_termico FLOAT DEFAULT 0,
    indice_estres_luminico FLOAT DEFAULT 0,
    indice_estres_nutricional FLOAT DEFAULT 0,
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Decisiones y Diagnósticos Agronómicos
CREATE TABLE IF NOT EXISTS decisiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacion_id INT NOT NULL,
    dia INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    prioridad VARCHAR(20) NOT NULL,
    mensaje TEXT NOT NULL,
    valor_actual VARCHAR(50),
    valor_sugerido VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;