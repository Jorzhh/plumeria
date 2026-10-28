# Práctica 06: Observatorio Global de Cultivos

Extensión de `Practica5_2.0`: integra datos reales georreferenciados con el simulador Three.js, FlightPHP y MySQL. La práctica original se conserva sin cambios. Esta copia usa su propia base `practica06_geovisualizacion` y puertos `3006` (interfaz) / `8086` (API).

## Requisitos y arranque

- PHP 8 con cURL y PDO MySQL habilitados; MySQL/MariaDB activo.
- FlightPHP instalado en `api/vendor` (`composer install` dentro de `api` si falta).
- Importa en phpMyAdmin, en este orden: `database/schema.sql` y `database/seed.sql`.
- Ejecuta `iniciar_servidores.bat` y abre `http://localhost:3006`.
- La API lee `DB_HOST`, `DB_NAME`, `DB_USER` y `DB_PASS` del entorno. Si no se definen, usa `127.0.0.1`, `practica06_geovisualizacion`, `root` y contraseña vacía para XAMPP local.
- Si ya importaste una versión anterior de la base, ejecuta una vez `database/migration_practica06_geo_calidad.sql`.
- En la pestaña **Globo**, haz clic en el planeta o escribe latitud y longitud. Pulsa **Consultar esta ubicación**; para aplicar el clima a la simulación, pulsa **Usar condiciones en la simulación**, avanza días y guarda la corrida desde Cultivo.

## APIs integradas

| Fuente | Uso en el observatorio | Caché MySQL |
| --- | --- | --- |
| Open-Meteo Forecast | Condiciones actuales y serie diaria reciente | 30 minutos |
| Open-Meteo Historical Weather | Resumen climático del último año disponible | 24 horas |
| NASA POWER Daily | Temperatura, precipitación y radiación de aproximadamente un año | 24 horas |
| ISRIC SoilGrids v2.0 | Arcilla, arena, carbono orgánico y pH en 0–5 cm | 7 días |
| GBIF Species + Occurrence | Coincidencia taxonómica y ocurrencias en una ventana aproximada de 1° × 1°; dibuja hasta 300 puntos | 24 horas |
| OpenStreetMap Nominatim | Nombre aproximado del lugar a partir de coordenadas | 30 días |

Los servicios externos se consultan desde PHP con cURL sobre HTTPS; el navegador solo llama rutas de FlightPHP. Las claves futuras deben guardarse en variables de entorno del servidor. Las coordenadas se redondean antes de consultar y formar la clave del caché. MySQL espacia solicitudes concurrentes a SoilGrids y Nominatim. SoilGrids limita el uso compartido a cinco llamadas por minuto; revisa su [política vigente](https://rest.isric.org/) antes de desplegar.

La geocodificación inversa usa Nominatim porque Open-Meteo Geocoding resuelve nombres a coordenadas, no coordenadas a nombres. La interfaz muestra la atribución de OpenStreetMap.

## Rutas geoespaciales

- `GET /api/geo/clima?lat=14.291&lon=-89.895`
- `GET /api/geo/historico?lat=14.291&lon=-89.895`
- `GET /api/geo/nasa?lat=14.291&lon=-89.895`
- `GET /api/geo/suelo?lat=14.291&lon=-89.895`
- `GET /api/geo/ocurrencias?especie=Plumeria%20rubra&lat=14.291&lon=-89.895`
- `GET /api/geo/lugar?lat=14.291&lon=-89.895`
- `POST /api/geo/analisis` guarda los datos normalizados y calcula idoneidad.
- `PUT /api/geo/analisis/{id}/simulacion` enlaza el análisis con una simulación guardada.
- `GET /api/geo/ranking` y `GET /api/geo/ubicaciones` consultan el ranking y las ubicaciones de referencia.

## Globo, marcadores e idoneidad

El globo se crea con Three.js y una textura cartográfica terrestre. Para una latitud `φ`, longitud `λ` y radio `R`, el marcador se coloca con `x = R cos(φ) cos(λ)`, `y = R sin(φ)`, `z = -R cos(φ) sin(λ)`. El clic invierte con `φ = asin(y/R)` y `λ = atan2(-z, x)`. Los registros GBIF con coordenadas se dibujan como puntos; el total corresponde a una ventana rectangular aproximada de 1° × 1°, no a un círculo exacto. La comparación A/B muestra los sitios y el arco que los conecta.

El índice orientativo usa cinco componentes: temperatura respecto a `temp_min`, `temp_optima` y `temp_max` de la especie (25%); precipitación anual (25%); pH del suelo (20%); textura general a partir de arcilla y arena (20%); y evidencia GBIF con escala logarítmica (10%). Los límites de lluvia de 400 mm/año y pH 6.5 son referencias generales, no requisitos específicos de cada cultivo. Si falta una fuente, se renormalizan los pesos disponibles; si no hay datos suficientes, se guarda `NULL`. Es una heurística, no un modelo agronómico validado.

Las reglas generan avisos cuando la precipitación anual es menor de 400 mm, la temperatura media supera 35 °C, no hay ocurrencias GBIF, el pH es menor de 5.5, la arcilla es ≥40%, el suelo es muy arenoso (arena ≥75% y arcilla ≤10%) o la radiación media supera 25 MJ/m²/día. Son alertas para revisar la parcela, no prescripciones de insumos.

## Respuestas para el reporte

1. **APIs y datos:** elegí Open-Meteo por su acceso sin clave a clima reciente e histórico; NASA POWER como referencia agroclimática global; SoilGrids por sus propiedades edáficas; GBIF por su catálogo taxonómico y registros georreferenciados; Nominatim para resolver coordenadas a un nombre de lugar.
2. **Proxy y seguridad:** el frontend solicita `/api/geo/*`; FlightPHP valida coordenadas y parámetros, PHP usa cURL para consultar la fuente, guarda/lee caché en MySQL y devuelve JSON. Las credenciales de MySQL se leen del entorno y no se envían al navegador. Flujo: frontend → FlightPHP → cURL → API externa → caché MySQL → JSON.
3. **Globo 3D:** se construyó desde cero con Three.js, `SphereGeometry`, una textura terrestre y `OrbitControls` (sin three-globe ni Lithosphere). Las ecuaciones de proyección anteriores convierten coordenadas WGS84 a posiciones esféricas.
4. **Ocurrencias:** el nombre científico del catálogo se resuelve a `taxonKey`; GBIF devuelve hasta 300 registros con coordenadas válidas dentro de una ventana espacial. Cada latitud/longitud se proyecta con la misma función del globo. La ventana cruza el antimeridiano y el total rectangular no se interpreta como un radio circular exacto.
5. **Idoneidad:** se ponderan temperatura 25%, lluvia anual 25%, pH 20%, textura 20% y evidencia GBIF 10%. La temperatura cae linealmente desde el óptimo hacia los límites del catálogo; lluvia usa `min(100, mm/4)`; pH usa `max(0, 100−25·|pH−6.5|)`; textura parte de 100 y resta 2 puntos por cada punto porcentual de arcilla fuera de 15–35% y 1.2 por arena fuera de 20–65%; GBIF usa `log10(n+1)/log10(11)·100`. Los pesos disponibles se renormalizan y el panel muestra sus componentes.
6. **Reglas:** menos de 400 mm/año sugiere planificar riego suplementario; más de 35 °C indica evaluar tolerancia al calor; pH menor de 5.5 requiere revisar una muestra antes de encalar. También se alerta por cero ocurrencias, radiación >25 MJ/m²/día, arcilla ≥40% o suelo arenoso.
7. **Caché:** clima actual 30 min; histórico, NASA y GBIF 24 h; SoilGrids 7 días; geocodificación 30 días. Las claves incluyen fuente, coordenada redondeada y parámetros; MySQL espacia las solicitudes concurrentes a SoilGrids y Nominatim.
8. **Simulación:** el usuario consulta una ubicación, aplica temperatura y radiación a los controles del motor y aproxima agua disponible con lluvia/arcilla y disponibilidad nutricional con pH. Son proxies, no mediciones directas de humedad o N-P-K. Al guardar desde Cultivo, el backend enlaza el análisis con el ID de la corrida.
9. **A/B:** se consultan las mismas fuentes y la misma especie para ambos pares lat/lon. La interfaz compara índice, temperatura, lluvia, pH y ocurrencias; declara ganador solo si ambos puntajes están disponibles. Los empates se informan como empate técnico.
10. **Dificultades:** las fuentes tienen unidades y coberturas distintas; el proxy normaliza resultados, conserva unidades, valida datos ausentes y usa caché. SoilGrids puede tener indisponibilidad, por eso se muestran errores por fuente y no se ocultan los datos que sí llegaron.
11. **Valor del mapa:** permite explorar relaciones espaciales y seleccionar sitios; es útil al comparar regiones, visualizar registros biológicos o comunicar patrones. La esfera no sustituye muestreo de parcela ni validación de campo.
12. **IoT y satélite:** recibiría telemetría por MQTT/HTTP autenticado, almacenaría series temporales con marca de tiempo y coordenadas; Sentinel-2/NDVI se procesaría por lotes o mediante un servicio geoespacial, con mosaicos y polígonos consultables desde el mapa.
13. **Escala:** usaría caché distribuida, cola de trabajos, límites por proveedor, reintentos con backoff y workers; agregaría consultas por celda espacial para evitar una llamada por usuario.
14. **Decisiones habilitadas:** comparar idoneidad entre zonas, identificar alertas hídricas/térmicas, revisar evidencia de presencia de especies y priorizar sitios para ensayos de campo.

## Capturas del entregable

Con MySQL iniciado, tablas importadas y la aplicación abierta, ejecuta `node capture.mjs` desde esta carpeta. El script captura el globo, el panel con datos, la comparación A/B y el ranking en `captura_globo.png`, `captura_panel_datos.png`, `captura_ab_geografico.png` y `captura_ranking_idoneidad.png`.

`reporte_practica05.pdf` conserva la captura exportada de la práctica anterior; no es evidencia de la Práctica 06. Las respuestas actuales del cuestionario están en este README. Las cuatro capturas de esta práctica se generan con `capture.mjs` y no aparecen hasta ejecutar el script con FlightPHP, MySQL y las fuentes disponibles.

## Base de datos y notas

`schema.sql` define caché, límites de proveedor, análisis geográficos y ubicaciones de referencia. `seed.sql` incluye Jutiapa, Guatemala y Córdoba, España como escenarios A/B. El análisis persiste clima, suelo, ocurrencias, score y recomendaciones, y se puede relacionar con una simulación. El globo es una visualización académica; sus contornos no son cartografía de precisión.
