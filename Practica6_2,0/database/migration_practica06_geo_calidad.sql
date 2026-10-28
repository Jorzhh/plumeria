-- Ejecuta este archivo una vez si ya habías importado la versión anterior del esquema.
USE practica06_geovisualizacion;

-- NULL distingue una fuente que no respondió de una respuesta válida con cero registros.
ALTER TABLE geo_analisis
  MODIFY ocurrencias_gbif INT DEFAULT NULL,
  MODIFY indice_idoneidad TINYINT UNSIGNED DEFAULT NULL,
  ADD COLUMN variables_disponibles TINYINT UNSIGNED DEFAULT NULL AFTER indice_idoneidad;

CREATE TABLE IF NOT EXISTS geo_api_limits (
  provider         VARCHAR(40) PRIMARY KEY,
  last_started_at  DATETIME(6) DEFAULT NULL
) ENGINE=InnoDB;
