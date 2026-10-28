-- ============================================================
-- Práctica 06 – Laboratorio Bioinformático de Cultivo
-- schema.sql – Estructura de la base de datos
-- Base: practica06_geovisualizacion
-- ============================================================

CREATE DATABASE IF NOT EXISTS practica06_geovisualizacion
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE practica06_geovisualizacion;

-- -------------------------------------------------------
-- 1. CATÁLOGO DE ESPECIES
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS especies (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre_comun    VARCHAR(100)   NOT NULL,
  nombre_cientifico VARCHAR(150) NOT NULL,
  familia         VARCHAR(100)   DEFAULT NULL,
  tipo            ENUM('herbácea','arbustiva','arbórea','suculenta') DEFAULT 'herbácea',
  -- Parámetros óptimos de cultivo
  temp_min        FLOAT          DEFAULT 10,
  temp_max        FLOAT          DEFAULT 35,
  temp_optima     FLOAT          DEFAULT 25,
  luz_min         FLOAT          DEFAULT 200,   -- µmol·m⁻²·s⁻¹
  luz_max         FLOAT          DEFAULT 2000,
  luz_optima      FLOAT          DEFAULT 800,
  agua_min        FLOAT          DEFAULT 20,    -- % humedad sustrato
  agua_max        FLOAT          DEFAULT 80,
  agua_optima     FLOAT          DEFAULT 55,
  nutrientes_opt  FLOAT          DEFAULT 70,    -- índice 0-100
  co2_optimo      FLOAT          DEFAULT 400,   -- ppm
  -- Parámetros de crecimiento por defecto
  tasa_r          FLOAT          DEFAULT 0.15,  -- r (tasa intrínseca)
  capacidad_k     FLOAT          DEFAULT 100,   -- K (capacidad de carga, u)
  dias_madurez    INT            DEFAULT 90,
  biomasa_max     FLOAT          DEFAULT 500,   -- g
  color_tallo     VARCHAR(7)     DEFAULT '#274e2b',
  color_hoja      VARCHAR(7)     DEFAULT '#9ee32b',
  color_flor      VARCHAR(7)     DEFAULT '#fafafa',
  descripcion     TEXT           DEFAULT NULL,
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 2. SIMULACIONES
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulaciones (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(200)   NOT NULL,
  especie_id      INT            NOT NULL,
  modelo          ENUM('lineal','exponencial','logistico','gompertz') DEFAULT 'logistico',
  -- Parámetros ambientales de la corrida
  temperatura     FLOAT          DEFAULT 25,
  luz             FLOAT          DEFAULT 800,
  agua            FLOAT          DEFAULT 55,
  nutrientes      FLOAT          DEFAULT 70,
  co2             FLOAT          DEFAULT 400,
  -- Parámetros genéticos ajustados
  param_r         FLOAT          DEFAULT 0.15,
  param_k         FLOAT          DEFAULT 100,
  -- Estado
  dias_simulados  INT            DEFAULT 0,
  estado          ENUM('en_curso','completada','cancelada') DEFAULT 'en_curso',
  notas           TEXT           DEFAULT NULL,
  -- Resultados agregados
  biomasa_final   FLOAT          DEFAULT 0,
  altura_final    FLOAT          DEFAULT 0,
  hojas_total     INT            DEFAULT 0,
  ramas_total     INT            DEFAULT 0,
  estres_promedio FLOAT          DEFAULT 0,
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (especie_id) REFERENCES especies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 3. MEDICIONES (por tick / día de simulación)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS mediciones (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  simulacion_id   INT            NOT NULL,
  dia             INT            NOT NULL,
  altura          FLOAT          DEFAULT 0,     -- unidades (u)
  biomasa         FLOAT          DEFAULT 0,     -- gramos
  num_hojas       INT            DEFAULT 0,
  num_ramas       INT            DEFAULT 0,
  indice_estres_hidrico   FLOAT  DEFAULT 0,     -- 0-100
  indice_estres_termico   FLOAT  DEFAULT 0,
  indice_estres_luminico  FLOAT  DEFAULT 0,
  indice_estres_nutricional FLOAT DEFAULT 0,
  estres_total    FLOAT          DEFAULT 0,     -- promedio ponderado
  icr             FLOAT          DEFAULT 0,     -- índice crecimiento relativo
  prediccion_cosecha_dias INT    DEFAULT NULL,
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE,
  INDEX idx_sim_dia (simulacion_id, dia)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 4. DECISIONES / RECOMENDACIONES
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS decisiones (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  simulacion_id   INT            NOT NULL,
  dia             INT            NOT NULL,
  tipo            ENUM('riego','temperatura','luz','nutrientes','cosecha','general') DEFAULT 'general',
  prioridad       ENUM('baja','media','alta','crítica') DEFAULT 'media',
  mensaje         VARCHAR(500)   NOT NULL,
  valor_actual    FLOAT          DEFAULT NULL,
  valor_sugerido  FLOAT          DEFAULT NULL,
  aplicada        TINYINT(1)     DEFAULT 0,
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Práctica 06: caché de respuestas de fuentes geoespaciales externas
CREATE TABLE IF NOT EXISTS geo_cache (
  cache_key     CHAR(64) PRIMARY KEY,
  response_json LONGTEXT NOT NULL,
  expires_at    DATETIME NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_geo_cache_expires (expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS geo_analisis (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  lat DECIMAL(9,6) NOT NULL,
  lon DECIMAL(9,6) NOT NULL,
  nombre_lugar VARCHAR(180) DEFAULT NULL,
  especie_id INT DEFAULT NULL,
  clima_json JSON NOT NULL,
  suelo_json JSON NOT NULL,
  ocurrencias_gbif INT NOT NULL DEFAULT 0,
  indice_idoneidad TINYINT UNSIGNED NOT NULL,
  recomendaciones_json JSON NOT NULL,
  simulacion_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_geo_fit (indice_idoneidad),
  INDEX idx_geo_species (especie_id),
  CONSTRAINT fk_geo_species FOREIGN KEY (especie_id) REFERENCES especies(id) ON DELETE SET NULL,
  CONSTRAINT fk_geo_simulation FOREIGN KEY (simulacion_id) REFERENCES simulaciones(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS geo_sites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  pais VARCHAR(120) NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lon DECIMAL(9,6) NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  UNIQUE KEY uq_geo_site (nombre,pais)
) ENGINE=InnoDB;