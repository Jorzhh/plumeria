# Práctica 06: Observatorio Global de Cultivos

Extensión de `Practica5_2.0`: integra datos reales georreferenciados con el simulador Three.js, FlightPHP y MySQL. La práctica original se conserva sin cambios. Esta copia usa su propia base `practica06_geovisualizacion` y puertos `3006` (interfaz) / `8086` (API).

## Requisitos y arranque

- PHP 8 con cURL y PDO MySQL habilitados; MySQL/MariaDB activo.
- FlightPHP instalado en `api/vendor` (`composer install` dentro de `api` si falta).
- Importa en phpMyAdmin, en este orden: `database/schema.sql` y `database/seed.sql`.
- Ejecuta `iniciar_servidores.bat` y abre `http://localhost:3006`.
- En la pestaña **Globo**, haz clic en el planeta o escribe latitud y longitud. Pulsa **Consultar esta ubicación**; para aplicar el clima a la simulación, pulsa **Usar condiciones en la simulación**, avanza días y guarda la corrida desde Cultivo.

## APIs integradas

| Fuente | Uso en el observatorio | Caché MySQL |
| --- | --- | --- |
| Open-Meteo Forecast | Condiciones actuales y serie diaria reciente | 30 minutos |
| Open-Meteo Historical Weather | Resumen climático del último año disponible | 24 horas |
| NASA POWER Daily | Temperatura, precipitación y radiación de aproximadamente un año | 24 horas |
| ISRIC SoilGrids v2.0 | Arcilla, arena, carbono orgánico y pH en 0–5 cm | 7 días |
| GBIF Species + Occurrence | Coincidencia taxonómica y ocurrencias con coordenadas en un radio de 0.5° | 24 horas |
| OpenStreetMap Nominatim | Nombre aproximado del lugar a partir de coordenadas | 30 días |

Los servicios externos se consultan desde PHP con cURL. El frontend solo llama rutas de FlightPHP, por lo que futuras claves de API se pueden mantener del lado del servidor. SoilGrids está sujeto a su política de uso y disponibilidad; el backend conserva los resultados para evitar consultas repetidas.

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

El globo se crea con Three.js y una textura cartográfica procedural. Para una latitud `φ`, longitud `λ` y radio `R`, el marcador se coloca con `x = R cos(φ) cos(λ)`, `y = R sin(φ)`, `z = -R cos(φ) sin(λ)`. El clic invierte con `φ = asin(y/R)` y `λ = atan2(-z, x)`. Los registros GBIF con coordenadas se dibujan como puntos; la comparación A/B muestra ambos lugares y el arco que los conecta.

El índice inicial usa cuatro componentes: temperatura (30%), precipitación anual (25%), pH de suelo (25%) y evidencia de ocurrencias GBIF (20%). Es una puntuación heurística de 0–100 para comparar escenarios, no un modelo agronómico validado. Las reglas generan avisos cuando la precipitación anual es menor de 400 mm, la temperatura media supera 35 °C, no hay registros GBIF cercanos, el pH es menor de 5.5 o la radiación media supera 25 MJ/m²/día.

## Respuestas para el reporte

1. **APIs y datos:** Open-Meteo aporta tiempo actual e histórico; NASA POWER, series agroclimáticas; SoilGrids, propiedades del suelo; GBIF, ocurrencias de especies; Nominatim, nombre de referencia del lugar.
2. **Proxy y seguridad:** el frontend solicita `/api/geo/*`; FlightPHP valida coordenadas y parámetros, PHP usa cURL para consultar la fuente, guarda/lee caché en MySQL y devuelve JSON. Las credenciales futuras no se exponen al navegador.
3. **Globo 3D:** se construye en Three.js desde una esfera con textura procedural y controles orbitales; las ecuaciones de proyección anteriores convierten coordenadas WGS84 a posición esférica.
4. **Ocurrencias:** GBIF resuelve el nombre científico a `taxonKey`, filtra por latitud/longitud y solo se muestran registros que incluyen coordenadas válidas.
5. **Idoneidad:** se ponderan temperatura 30%, lluvia anual 25%, pH 25% y ocurrencias GBIF 20%. El panel muestra componentes y score.
6. **Reglas:** menos de 400 mm/año sugiere riego suplementario; más de 35 °C recomienda variedad resistente al calor; pH menor de 5.5 sugiere evaluar encalado. También se alerta por cero ocurrencias y radiación mayor de 25 MJ/m²/día.
7. **Caché:** clima actual 30 min; histórico, NASA y GBIF 24 h; SoilGrids 7 días; geocodificación 30 días. Las claves incluyen fuente, ubicación redondeada y parámetros.
8. **Simulación:** el usuario consulta una ubicación, aplica temperatura y radiación a los controles del motor y estima agua disponible con lluvia/arcilla y disponibilidad nutricional con pH. Estas dos últimas variables son proxies explícitos, no mediciones de humedad o N-P-K; el usuario inicia el crecimiento, guarda la simulación y el backend enlaza el análisis con el ID de la corrida.
9. **A/B:** se consultan las mismas fuentes para ambos pares lat/lon; el ganador es el sitio con mayor score de idoneidad. Empates se informan como empate.
10. **Dificultades:** las fuentes tienen unidades y coberturas distintas; el proxy normaliza resultados, conserva unidades, valida datos ausentes y usa caché. SoilGrids puede tener indisponibilidad, por eso se muestran errores por fuente y no se ocultan los datos que sí llegaron.
11. **Valor del mapa:** permite explorar relaciones espaciales y seleccionar sitios; es útil al comparar regiones, visualizar registros biológicos o comunicar patrones. La esfera no sustituye muestreo de parcela ni validación de campo.
12. **IoT y satélite:** recibiría telemetría por MQTT/HTTP autenticado, almacenaría series temporales con marca de tiempo y coordenadas; Sentinel-2/NDVI se procesaría por lotes o mediante un servicio geoespacial, con mosaicos y polígonos consultables desde el mapa.
13. **Escala:** usaría caché distribuida, cola de trabajos, límites por proveedor, reintentos con backoff y workers; agregaría consultas por celda espacial para evitar una llamada por usuario.
14. **Decisiones habilitadas:** comparar idoneidad entre zonas, identificar alertas hídricas/térmicas, revisar evidencia de presencia de especies y priorizar sitios para ensayos de campo.

## Capturas del entregable

Con MySQL iniciado, tablas importadas y la aplicación abierta, ejecuta `node capture.mjs` desde esta carpeta. El script captura el globo, el panel con datos, la comparación A/B y el ranking en `captura_globo.png`, `captura_panel_datos.png`, `captura_ab_geografico.png` y `captura_ranking_idoneidad.png`.

## Base de datos y notas

`schema.sql` define caché, análisis geográficos y ubicaciones de referencia. `seed.sql` incluye Jutiapa, Guatemala y Córdoba, España como escenarios A/B. El análisis persiste clima, suelo, ocurrencias, score y recomendaciones, y se puede relacionar con una simulación. El globo procedural es una visualización académica; sus contornos no son una cartografía de precisión.