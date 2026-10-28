<?php
/**
 * Proxy geoespacial de Práctica 06.
 * Las llamadas a proveedores y cualquier credencial permanecen en el servidor.
 */
function geoFetchJson(string $url): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_USERAGENT => 'BioLab-Observatorio/2.0 (academic project)',
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
    ]);

    $body = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($body === false || $status < 200 || $status >= 300) {
        throw new RuntimeException($error ?: "Fuente externa HTTP $status");
    }

    $data = json_decode($body, true);
    if (!is_array($data)) {
        throw new RuntimeException('La fuente devolvió JSON inválido');
    }
    return $data;
}

function geoCoordinates(): array
{
    $lat = $_GET['lat'] ?? null;
    $lon = $_GET['lon'] ?? null;
    if (!is_numeric($lat) || !is_numeric($lon)) {
        Flight::json(['status' => 'error', 'message' => 'Envía lat y lon numéricos'], 400);
        return [null, null];
    }

    $lat = (float)$lat;
    $lon = (float)$lon;
    if (!is_finite($lat) || !is_finite($lon) || $lat < -90 || $lat > 90 || $lon < -180 || $lon > 180) {
        Flight::json(['status' => 'error', 'message' => 'Coordenadas fuera del rango válido'], 400);
        return [null, null];
    }
    return [$lat, $lon];
}

function geoCachedJson(string $key, int $ttl, callable $loader): array
{
    $db = null;
    try {
        $db = Flight::db();
        $query = $db->prepare('SELECT response_json FROM geo_cache WHERE cache_key = ? AND expires_at > NOW()');
        $query->execute([$key]);
        $cached = $query->fetchColumn();
        if ($cached !== false) {
            $value = json_decode($cached, true);
            if (is_array($value)) {
                return $value;
            }
        }
    } catch (Throwable $error) {
        // Se permite consultar la fuente si el caché no está disponible.
        $db = null;
    }

    $value = $loader();
    if ($db !== null) {
        try {
            $query = $db->prepare(
                'INSERT INTO geo_cache (cache_key, response_json, expires_at) VALUES (?, ?, ?) '
                . 'ON DUPLICATE KEY UPDATE response_json = VALUES(response_json), expires_at = VALUES(expires_at)'
            );
            $query->execute([
                $key,
                json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
                date('Y-m-d H:i:s', time() + $ttl),
            ]);
        } catch (Throwable $error) {
            error_log('BioLab geo-cache write failed: ' . $error->getMessage());
        }
    }
    return $value;
}

/** Serializa consultas a proveedores con límites publicados de frecuencia. */
function geoProviderGate(string $provider, int $minimumIntervalMicroseconds): void
{
    $db = null;
    try {
        $db = Flight::db();
        $db->beginTransaction();
        $insert = $db->prepare('INSERT IGNORE INTO geo_api_limits (provider, last_started_at) VALUES (?, NULL)');
        $insert->execute([$provider]);

        $select = $db->prepare('SELECT last_started_at FROM geo_api_limits WHERE provider = ? FOR UPDATE');
        $select->execute([$provider]);
        $lastStartedAt = $select->fetchColumn();
        if ($lastStartedAt !== false && $lastStartedAt !== null) {
            $elapsedQuery = $db->prepare('SELECT TIMESTAMPDIFF(MICROSECOND, ?, NOW(6))');
            $elapsedQuery->execute([$lastStartedAt]);
            $elapsed = max(0, (int)$elapsedQuery->fetchColumn());
            $wait = $minimumIntervalMicroseconds - $elapsed;
            if ($wait > 0) {
                usleep($wait);
            }
        }

        $update = $db->prepare('UPDATE geo_api_limits SET last_started_at = NOW(6) WHERE provider = ?');
        $update->execute([$provider]);
        $db->commit();
    } catch (Throwable $error) {
        if ($db !== null && $db->inTransaction()) {
            $db->rollBack();
        }
        // La app sigue disponible si el usuario aún no creó la tabla de límites.
        error_log('BioLab provider throttle unavailable: ' . $error->getMessage());
    }
}

function geoNumber($value): ?float
{
    if (!is_numeric($value)) {
        return null;
    }
    $number = (float)$value;
    return is_finite($number) && $number > -900 ? $number : null;
}

function geoAverage(array $values): ?float
{
    $valid = [];
    foreach ($values as $value) {
        $number = geoNumber($value);
        if ($number !== null) {
            $valid[] = $number;
        }
    }
    return count($valid) ? array_sum($valid) / count($valid) : null;
}

function geoSum(array $values): ?float
{
    $valid = [];
    foreach ($values as $value) {
        $number = geoNumber($value);
        if ($number !== null) {
            $valid[] = $number;
        }
    }
    return count($valid) ? array_sum($valid) : null;
}

function geoLogFailure(string $source, Throwable $error): void
{
    error_log("BioLab $source request failed: " . $error->getMessage());
}

Flight::route('GET /api/geo/clima', function () {
    [$lat, $lon] = geoCoordinates();
    if ($lat === null) return;

    // Agrupa en celdas de ~1 km, para que la clave del caché represente la consulta real.
    $lat = round($lat, 2);
    $lon = round($lon, 2);
    $key = hash('sha256', 'open-meteo-current:' . $lat . ':' . $lon);
    try {
        $data = geoCachedJson($key, 1800, function () use ($lat, $lon) {
            $query = http_build_query([
                'latitude' => $lat,
                'longitude' => $lon,
                'current' => 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
                'daily' => 'temperature_2m_mean,precipitation_sum,shortwave_radiation_sum',
                'past_days' => 7,
                'forecast_days' => 1,
                'timezone' => 'auto',
            ]);
            $raw = geoFetchJson('https://api.open-meteo.com/v1/forecast?' . $query);
            $current = $raw['current'] ?? [];
            $daily = $raw['daily'] ?? [];
            $series = [];
            foreach (($daily['time'] ?? []) as $index => $date) {
                $series[] = [
                    'fecha' => $date,
                    'temperatura_media_c' => $daily['temperature_2m_mean'][$index] ?? null,
                    'precipitacion_mm' => $daily['precipitation_sum'][$index] ?? null,
                    'radiacion_mj_m2_dia' => $daily['shortwave_radiation_sum'][$index] ?? null,
                ];
            }
            return [
                'coordenadas' => ['lat' => $lat, 'lon' => $lon],
                'fuente' => 'Open-Meteo Forecast API',
                'actual' => [
                    'temperatura_c' => $current['temperature_2m'] ?? null,
                    'humedad_relativa_pct' => $current['relative_humidity_2m'] ?? null,
                    'precipitacion_mm' => $current['precipitation'] ?? null,
                    'viento_kmh' => $current['wind_speed_10m'] ?? null,
                    'hora' => $current['time'] ?? null,
                ],
                'serie_diaria' => $series,
                'unidades' => $raw['current_units'] ?? [],
            ];
        });
        Flight::json(['status' => 'success', 'data' => $data]);
    } catch (Throwable $error) {
        geoLogFailure('Open-Meteo', $error);
        Flight::json(['status' => 'error', 'message' => 'Open-Meteo no está disponible por ahora.'], 502);
    }
});

Flight::route('GET /api/geo/historico', function () {
    [$lat, $lon] = geoCoordinates();
    if ($lat === null) return;

    $lat = round($lat, 2);
    $lon = round($lon, 2);
    $end = date('Y-m-d', strtotime('-7 days'));
    $start = date('Y-m-d', strtotime($end . ' -364 days'));
    $key = hash('sha256', "open-meteo-history:$lat:$lon:$start:$end");
    try {
        $data = geoCachedJson($key, 86400, function () use ($lat, $lon, $start, $end) {
            $query = http_build_query([
                'latitude' => $lat,
                'longitude' => $lon,
                'start_date' => $start,
                'end_date' => $end,
                'daily' => 'temperature_2m_mean,precipitation_sum,shortwave_radiation_sum,et0_fao_evapotranspiration',
                'timezone' => 'auto',
            ]);
            $raw = geoFetchJson('https://archive-api.open-meteo.com/v1/archive?' . $query);
            $daily = $raw['daily'] ?? [];
            return [
                'fuente' => 'Open-Meteo Historical Weather API',
                'periodo' => ['inicio' => $start, 'fin' => $end],
                'temperatura_media_c' => geoAverage($daily['temperature_2m_mean'] ?? []),
                'precipitacion_total_mm' => geoSum($daily['precipitation_sum'] ?? []),
                'radiacion_media_mj_m2_dia' => geoAverage($daily['shortwave_radiation_sum'] ?? []),
                'evapotranspiracion_media_mm_dia' => geoAverage($daily['et0_fao_evapotranspiration'] ?? []),
                'dias' => count($daily['time'] ?? []),
            ];
        });
        Flight::json(['status' => 'success', 'data' => ['coordenadas' => ['lat' => $lat, 'lon' => $lon]] + $data]);
    } catch (Throwable $error) {
        geoLogFailure('Open-Meteo archive', $error);
        Flight::json(['status' => 'error', 'message' => 'El histórico de Open-Meteo no está disponible por ahora.'], 502);
    }
});

Flight::route('GET /api/geo/nasa', function () {
    [$lat, $lon] = geoCoordinates();
    if ($lat === null) return;

    $lat = round($lat, 2);
    $lon = round($lon, 2);
    $key = hash('sha256', 'nasa-power:' . $lat . ':' . $lon);
    try {
        $data = geoCachedJson($key, 86400, function () use ($lat, $lon) {
            $end = date('Ymd', strtotime('-30 days'));
            $start = date('Ymd', strtotime($end . ' -364 days'));
            $query = http_build_query([
                'parameters' => 'T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN',
                'community' => 'AG',
                'longitude' => $lon,
                'latitude' => $lat,
                'start' => $start,
                'end' => $end,
                'format' => 'JSON',
            ]);
            $raw = geoFetchJson('https://power.larc.nasa.gov/api/temporal/daily/point?' . $query);
            $parameters = $raw['properties']['parameter'] ?? [];
            return [
                'fuente' => 'NASA POWER Daily API',
                'periodo' => ['inicio' => $start, 'fin' => $end],
                'temperatura_media_c' => geoAverage(array_values($parameters['T2M'] ?? [])),
                'precipitacion_total_mm' => geoSum(array_values($parameters['PRECTOTCORR'] ?? [])),
                'radiacion_media_mj_m2_dia' => geoAverage(array_values($parameters['ALLSKY_SFC_SW_DWN'] ?? [])),
                'dias' => count($parameters['T2M'] ?? []),
            ];
        });
        Flight::json(['status' => 'success', 'data' => ['coordenadas' => ['lat' => $lat, 'lon' => $lon]] + $data]);
    } catch (Throwable $error) {
        geoLogFailure('NASA POWER', $error);
        Flight::json(['status' => 'error', 'message' => 'NASA POWER no está disponible por ahora.'], 502);
    }
});

Flight::route('GET /api/geo/suelo', function () {
    [$lat, $lon] = geoCoordinates();
    if ($lat === null) return;

    $lat = round($lat, 3);
    $lon = round($lon, 3);
    $key = hash('sha256', 'soilgrids-v2:' . $lat . ':' . $lon);
    try {
        $data = geoCachedJson($key, 604800, function () use ($lat, $lon) {
            geoProviderGate('soilgrids', 12000000); // ISRIC solicita como máximo 5 llamadas por minuto.
            $properties = implode('&', array_map(
                static fn(string $property): string => 'property=' . rawurlencode($property),
                ['clay', 'sand', 'soc', 'phh2o']
            ));
            $query = http_build_query(['lon' => $lon, 'lat' => $lat])
                . '&' . $properties
                . '&' . http_build_query(['depth' => '0-5cm', 'value' => 'mean']);
            $raw = geoFetchJson('https://rest.isric.org/soilgrids/v2.0/properties/query?' . $query);
            $properties = [];
            foreach (($raw['properties']['layers'] ?? []) as $layer) {
                $name = $layer['name'] ?? '';
                if ($name === '') continue;
                $properties[$name] = [
                    'valor' => $layer['depths'][0]['values']['mean'] ?? null,
                    'unidad' => $layer['unit_measure']['mapped_units']
                        ?? $layer['unit_measure']['target_units']
                        ?? null,
                ];
            }
            return [
                'coordenadas' => ['lat' => $lat, 'lon' => $lon],
                'fuente' => 'ISRIC SoilGrids v2.0',
                'profundidad' => '0-5 cm',
                'propiedades' => $properties,
                'atribucion' => 'ISRIC SoilGrids',
            ];
        });
        Flight::json(['status' => 'success', 'data' => $data]);
    } catch (Throwable $error) {
        geoLogFailure('SoilGrids', $error);
        Flight::json(['status' => 'error', 'message' => 'SoilGrids no está disponible por ahora.'], 502);
    }
});

Flight::route('GET /api/geo/ocurrencias', function () {
    [$lat, $lon] = geoCoordinates();
    if ($lat === null) return;

    $name = trim((string)($_GET['especie'] ?? ''));
    if ($name === '' || strlen($name) > 160) {
        Flight::json(['status' => 'error', 'message' => 'Envía un nombre científico válido en especie'], 400);
        return;
    }
    $limit = max(1, min(300, (int)($_GET['limit'] ?? 150)));
    $lat = round($lat, 2);
    $lon = round($lon, 2);
    $key = hash('sha256', 'gbif:' . strtolower($name) . ':' . $lat . ':' . $lon . ':' . $limit);

    try {
        $data = geoCachedJson($key, 86400, function () use ($name, $lat, $lon, $limit) {
            $match = geoFetchJson('https://api.gbif.org/v1/species/match?' . http_build_query(['name' => $name]));
            $taxonKey = $match['usageKey'] ?? $match['speciesKey'] ?? null;
            if (!$taxonKey) {
                return [
                    'fuente' => 'GBIF Occurrence API',
                    'nombre_consultado' => $name,
                    'disponible' => false,
                    'coincidencia' => $match,
                    'total' => null,
                    'puntos' => [],
                    'limite_mostrado' => 0,
                ];
            }

            $delta = 0.5;
            $south = max(-90, $lat - $delta);
            $north = min(90, $lat + $delta);
            $west = $lon - $delta;
            $east = $lon + $delta;
            $longitudeRanges = [];
            if ($west < -180) {
                $longitudeRanges = [[$west + 360, 180], [-180, $east]];
            } elseif ($east > 180) {
                $longitudeRanges = [[$west, 180], [-180, $east - 360]];
            } else {
                $longitudeRanges = [[$west, $east]];
            }

            $points = [];
            $total = 0;
            foreach ($longitudeRanges as [$rangeWest, $rangeEast]) {
                $query = http_build_query([
                    'taxonKey' => $taxonKey,
                    'decimalLatitude' => $south . ',' . $north,
                    'decimalLongitude' => $rangeWest . ',' . $rangeEast,
                    'hasCoordinate' => 'true',
                    'limit' => $limit,
                    'offset' => 0,
                ]);
                $raw = geoFetchJson('https://api.gbif.org/v1/occurrence/search?' . $query);
                $total += (int)($raw['count'] ?? 0);
                if (count($points) >= $limit) continue;
                foreach (($raw['results'] ?? []) as $record) {
                    if (!isset($record['decimalLatitude'], $record['decimalLongitude'])) continue;
                    $pointLat = (float)$record['decimalLatitude'];
                    $pointLon = (float)$record['decimalLongitude'];
                    if ($pointLat < -90 || $pointLat > 90 || $pointLon < -180 || $pointLon > 180) continue;
                    $points[] = [
                        'lat' => $pointLat,
                        'lon' => $pointLon,
                        'fecha' => $record['eventDate'] ?? null,
                        'pais' => $record['country'] ?? null,
                    ];
                    if (count($points) >= $limit) break;
                }
            }

            return [
                'fuente' => 'GBIF Occurrence API',
                'nombre_consultado' => $name,
                'nombre_aceptado' => $match['scientificName'] ?? $name,
                'taxonKey' => $taxonKey,
                'confianza_coincidencia' => $match['confidence'] ?? null,
                'disponible' => true,
                'radio_grados' => $delta,
                'total' => $total,
                'puntos' => $points,
                'limite_mostrado' => count($points),
                'nota_espacial' => 'El total corresponde a una ventana rectangular aproximada de 1° × 1°; los puntos visibles se limitan al máximo solicitado.',
            ];
        });
        Flight::json(['status' => 'success', 'data' => $data]);
    } catch (Throwable $error) {
        geoLogFailure('GBIF', $error);
        Flight::json(['status' => 'error', 'message' => 'GBIF no está disponible por ahora.'], 502);
    }
});

Flight::route('GET /api/geo/lugar', function () {
    [$lat, $lon] = geoCoordinates();
    if ($lat === null) return;

    $lat = round($lat, 3);
    $lon = round($lon, 3);
    $key = hash('sha256', 'nominatim-reverse:' . $lat . ':' . $lon);
    try {
        $data = geoCachedJson($key, 2592000, function () use ($lat, $lon) {
            geoProviderGate('nominatim', 1000000);
            $query = http_build_query([
                'format' => 'jsonv2',
                'lat' => $lat,
                'lon' => $lon,
                'zoom' => 10,
                'addressdetails' => 1,
            ]);
            $raw = geoFetchJson('https://nominatim.openstreetmap.org/reverse?' . $query);
            $address = $raw['address'] ?? [];
            return [
                'fuente' => 'OpenStreetMap Nominatim',
                'nombre' => $raw['name']
                    ?? $address['city']
                    ?? $address['town']
                    ?? $address['village']
                    ?? $address['county']
                    ?? $raw['display_name']
                    ?? null,
                'pais' => $address['country'] ?? null,
                'display_name' => $raw['display_name'] ?? null,
                'atribucion' => '© OpenStreetMap contributors',
            ];
        });
        Flight::json(['status' => 'success', 'data' => $data]);
    } catch (Throwable $error) {
        geoLogFailure('Nominatim', $error);
        Flight::json(['status' => 'error', 'message' => 'No se pudo identificar el lugar por ahora.'], 502);
    }
});

function geoSoilPercent(array $soil, string $property): ?float
{
    $entry = $soil['propiedades'][$property] ?? [];
    $value = geoNumber($entry['valor'] ?? null);
    if ($value === null) return null;

    $unit = strtolower((string)($entry['unidad'] ?? ''));
    if (str_contains($unit, 'g/kg')) {
        $value /= 10;
    } elseif (str_contains($unit, '%') || str_contains($unit, 'percent')) {
        // El proveedor ya normalizó el valor a porcentaje.
    } else {
        // Las capas SoilGrids de arena y arcilla se expresan en g/kg.
        $value /= 10;
    }
    return $value >= 0 && $value <= 100 ? $value : null;
}

function geoTemperatureScore(float $temperature, array $species): float
{
    $optimal = geoNumber($species['temp_optima'] ?? null) ?? 25.0;
    $minimum = geoNumber($species['temp_min'] ?? null) ?? ($optimal - 15.0);
    $maximum = geoNumber($species['temp_max'] ?? null) ?? ($optimal + 10.0);
    $span = $temperature <= $optimal ? max(1.0, $optimal - $minimum) : max(1.0, $maximum - $optimal);
    return max(0.0, min(100.0, 100.0 - abs($temperature - $optimal) / $span * 100.0));
}

function geoSuitability(array $climate, array $soil, ?int $gbif, array $species): array
{
    $weights = [
        'temperatura' => 0.25,
        'precipitacion' => 0.25,
        'suelo_ph' => 0.20,
        'textura_suelo' => 0.20,
        'evidencia_gbif' => 0.10,
    ];
    $components = [];

    $temperature = geoNumber($climate['temperatura_media_c'] ?? null);
    if ($temperature !== null) {
        $components['temperatura'] = geoTemperatureScore($temperature, $species);
    }

    $rain = geoNumber($climate['precipitacion_total_mm'] ?? null);
    if ($rain !== null) {
        $components['precipitacion'] = max(0.0, min(100.0, $rain / 4.0));
    }

    $rawPh = geoNumber($soil['propiedades']['phh2o']['valor'] ?? null);
    $ph = $rawPh === null ? null : $rawPh / 10.0;
    if ($ph !== null) {
        $components['suelo_ph'] = max(0.0, min(100.0, 100.0 - abs($ph - 6.5) * 25.0));
    }

    $clay = geoSoilPercent($soil, 'clay');
    $sand = geoSoilPercent($soil, 'sand');
    if ($clay !== null && $sand !== null) {
        $clayPenalty = $clay < 15 ? (15 - $clay) * 2 : ($clay > 35 ? ($clay - 35) * 2 : 0);
        $sandPenalty = $sand < 20 ? (20 - $sand) * 1.2 : ($sand > 65 ? ($sand - 65) * 1.2 : 0);
        $components['textura_suelo'] = max(0.0, min(100.0, 100.0 - $clayPenalty - $sandPenalty));
    }

    if ($gbif !== null) {
        $components['evidencia_gbif'] = $gbif === 0
            ? 0.0
            : max(0.0, min(100.0, log10($gbif + 1) / log10(11) * 100.0));
    }

    $availableWeight = 0.0;
    $weightedScore = 0.0;
    foreach ($components as $name => $value) {
        $availableWeight += $weights[$name];
        $weightedScore += $weights[$name] * $value;
    }
    $score = $availableWeight > 0 ? (int)round($weightedScore / $availableWeight) : null;

    $recommendations = [];
    if ($rain !== null && $rain < 400) {
        $recommendations[] = ['prioridad' => 'crítica', 'mensaje' => 'Precipitación anual inferior a 400 mm: planifica riego suplementario.'];
    }
    if ($temperature !== null && $temperature > 35) {
        $recommendations[] = ['prioridad' => 'alta', 'mensaje' => 'Temperatura media superior a 35 °C: evalúa una variedad con tolerancia al calor.'];
    }
    if ($gbif === 0) {
        $recommendations[] = ['prioridad' => 'alta', 'mensaje' => 'GBIF no reporta ocurrencias cercanas para esta especie; la adaptación local tiene más incertidumbre.'];
    }
    if ($ph !== null && $ph < 5.5) {
        $recommendations[] = ['prioridad' => 'media', 'mensaje' => 'Suelo ácido (pH menor a 5.5): analiza una muestra de parcela antes de encalar.'];
    }
    if ($clay !== null && $clay >= 40) {
        $recommendations[] = ['prioridad' => 'media', 'mensaje' => 'Contenido de arcilla alto (≥40%): revisa drenaje y riesgo de compactación.'];
    } elseif ($sand !== null && $clay !== null && $sand >= 75 && $clay <= 10) {
        $recommendations[] = ['prioridad' => 'media', 'mensaje' => 'Suelo predominantemente arenoso: vigila retención de agua y materia orgánica.'];
    }
    $radiation = geoNumber($climate['radiacion_media_mj_m2_dia'] ?? null);
    if ($radiation !== null && $radiation > 25) {
        $recommendations[] = ['prioridad' => 'media', 'mensaje' => 'Radiación superior a 25 MJ/m²/día: evalúa sombra parcial según la especie.'];
    }
    if ($score === null) {
        $recommendations[] = ['prioridad' => 'baja', 'mensaje' => 'No hay suficientes variables disponibles para calcular un índice de idoneidad.'];
    } elseif (count($components) < count($weights)) {
        $recommendations[] = ['prioridad' => 'baja', 'mensaje' => 'El índice se normalizó con las variables disponibles; interpreta el resultado con cautela.'];
    } elseif (!$recommendations) {
        $recommendations[] = ['prioridad' => 'baja', 'mensaje' => 'Sin alertas en las variables observadas; valida la decisión con datos de parcela.'];
    }

    return [
        'indice_idoneidad' => $score,
        'componentes' => $components,
        'pesos' => $weights,
        'variables_disponibles' => count($components),
        'recomendaciones' => $recommendations,
    ];
}

Flight::route('POST /api/geo/analisis', function () {
    $data = json_decode(Flight::request()->getBody(), true);
    if (!is_array($data)) {
        Flight::json(['status' => 'error', 'message' => 'El cuerpo de la solicitud debe ser JSON válido'], 400);
        return;
    }

    $lat = $data['lat'] ?? null;
    $lon = $data['lon'] ?? null;
    if (!is_numeric($lat) || !is_numeric($lon)
        || !is_finite((float)$lat) || !is_finite((float)$lon)
        || (float)$lat < -90 || (float)$lat > 90
        || (float)$lon < -180 || (float)$lon > 180) {
        Flight::json(['status' => 'error', 'message' => 'Coordenadas lat/lon inválidas'], 400);
        return;
    }

    try {
        $db = Flight::db();
        $speciesId = !empty($data['especie_id']) ? (int)$data['especie_id'] : null;
        $species = [];
        if ($speciesId !== null) {
            $query = $db->prepare('SELECT temp_min, temp_max, temp_optima FROM especies WHERE id = ?');
            $query->execute([$speciesId]);
            $species = $query->fetch() ?: [];
            if (!$species) {
                Flight::json(['status' => 'error', 'message' => 'La especie seleccionada no existe en el catálogo'], 422);
                return;
            }
        }

        $climate = is_array($data['clima'] ?? null) ? $data['clima'] : [];
        $soil = is_array($data['suelo'] ?? null) ? $data['suelo'] : [];
        $occurrences = array_key_exists('ocurrencias_gbif', $data) && is_numeric($data['ocurrencias_gbif'])
            ? max(0, (int)$data['ocurrencias_gbif'])
            : null;
        $fit = geoSuitability($climate, $soil, $occurrences, $species);
        $recommendationsJson = json_encode($fit['recomendaciones'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        $query = $db->prepare(
            'INSERT INTO geo_analisis '
            . '(lat, lon, nombre_lugar, especie_id, clima_json, suelo_json, ocurrencias_gbif, indice_idoneidad, variables_disponibles, recomendaciones_json, simulacion_id) '
            . 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $query->execute([
            (float)$lat,
            (float)$lon,
            trim((string)($data['nombre_lugar'] ?? '')) !== '' ? substr(trim((string)$data['nombre_lugar']), 0, 180) : null,
            $speciesId,
            json_encode($climate, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            json_encode($soil, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            $occurrences,
            $fit['indice_idoneidad'],
            $fit['variables_disponibles'],
            $recommendationsJson,
            !empty($data['simulacion_id']) ? (int)$data['simulacion_id'] : null,
        ]);

        Flight::json(['status' => 'success', 'data' => ['id' => (int)$db->lastInsertId()] + $fit], 201);
    } catch (Throwable $error) {
        geoLogFailure('analysis persistence', $error);
        Flight::json(['status' => 'error', 'message' => 'No se pudo guardar el análisis geoespacial. Revisa MySQL y el esquema.'], 500);
    }
});

Flight::route('PUT /api/geo/analisis/@id/simulacion', function ($id) {
    $data = json_decode(Flight::request()->getBody(), true) ?? [];
    $analysisId = filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $simulationId = filter_var($data['simulacion_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if (!$analysisId || !$simulationId) {
        Flight::json(['status' => 'error', 'message' => 'IDs de análisis y simulación inválidos'], 400);
        return;
    }

    try {
        $query = Flight::db()->prepare('UPDATE geo_analisis SET simulacion_id = ? WHERE id = ?');
        $query->execute([$simulationId, $analysisId]);
        if ($query->rowCount() === 0) {
            Flight::json(['status' => 'error', 'message' => 'Análisis no encontrado o ya asociado a esa simulación'], 404);
            return;
        }
        Flight::json(['status' => 'success', 'message' => 'Análisis geográfico asociado a la simulación']);
    } catch (Throwable $error) {
        geoLogFailure('simulation association', $error);
        Flight::json(['status' => 'error', 'message' => 'No se pudo asociar la simulación.'], 500);
    }
});

Flight::route('GET /api/geo/ubicaciones', function () {
    try {
        $rows = Flight::db()->query(
            'SELECT id, nombre, pais, lat, lon, descripcion FROM geo_sites ORDER BY nombre'
        )->fetchAll();
        Flight::json(['status' => 'success', 'data' => $rows]);
    } catch (Throwable $error) {
        geoLogFailure('reference sites', $error);
        Flight::json(['status' => 'error', 'message' => 'No se pudieron cargar las ubicaciones de referencia.'], 500);
    }
});

Flight::route('GET /api/geo/ranking', function () {
    try {
        $rows = Flight::db()->query(
            'SELECT g.id, g.lat, g.lon, g.nombre_lugar, g.especie_id, e.nombre_comun AS especie, '
            . 'g.ocurrencias_gbif, g.indice_idoneidad, g.variables_disponibles, g.created_at '
            . 'FROM geo_analisis g LEFT JOIN especies e ON e.id = g.especie_id '
            . 'ORDER BY (g.indice_idoneidad IS NULL) ASC, g.indice_idoneidad DESC, g.created_at DESC LIMIT 100'
        )->fetchAll();
        Flight::json(['status' => 'success', 'data' => $rows]);
    } catch (Throwable $error) {
        geoLogFailure('suitability ranking', $error);
        Flight::json(['status' => 'error', 'message' => 'No se pudo cargar el ranking de idoneidad.'], 500);
    }
});
