<?php
/**
 * Práctica 06 – API REST con FlightPHP
 * Laboratorio Bioinformático de Cultivo
 * 
 * Punto de entrada: php -S localhost:8086 index.php
 */

require __DIR__ . '/vendor/autoload.php';

// ============================================================
// CONFIGURACIÓN DE BASE DE DATOS
// ============================================================
Flight::register('db', PDO::class, [
    sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        getenv('DB_HOST') ?: '127.0.0.1',
        getenv('DB_NAME') ?: 'practica06_geovisualizacion'
    ),
    getenv('DB_USER') ?: 'root',
    getenv('DB_PASS') ?: '',
    [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_TIMEOUT            => 5,
    ]
]);

// ============================================================
// CORS – Permitir peticiones desde el frontend
// ============================================================
Flight::before('start', function () {
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $parts = parse_url($origin);
        $originHost = strtolower(rtrim($parts['host'] ?? '', '.'));
        $originPort = (int)($parts['port'] ?? (($parts['scheme'] ?? '') === 'https' ? 443 : 80));
        $requestHost = strtolower(rtrim(parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST) ?: '', '.'));
        $localHost = in_array($originHost, ['localhost', '127.0.0.1', '::1'], true);
        $validScheme = in_array($parts['scheme'] ?? '', ['http', 'https'], true);
        $allowedPort = in_array($originPort, [80, 443, 3006], true);
        $allowed = $validScheme && $allowedPort && ($localHost || $originHost === $requestHost);

        if ($allowed) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            header('Access-Control-Max-Age: 86400');
        }
    }

    if (Flight::request()->method === 'OPTIONS') {
        if ($origin !== '' && empty($allowed)) {
            Flight::halt(403);
        }
        Flight::halt(200);
    }
});

// ============================================================
// HELPER – leer JSON del body
// ============================================================
function jsonBody(): array {
    $raw = Flight::request()->getBody();
    return json_decode($raw, true) ?? [];
}

// ============================================================
//  RUTAS – ESPECIES
// ============================================================

// GET /api/especies – Todas las especies
Flight::route('GET /api/especies', function () {
    try {
        $db = Flight::db();
        $rows = $db->query("SELECT * FROM especies ORDER BY nombre_comun")->fetchAll();
        Flight::json(['status' => 'success', 'data' => $rows]);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// GET /api/especies/@id – Una especie
Flight::route('GET /api/especies/@id', function ($id) {
    try {
        $db = Flight::db();
        $stmt = $db->prepare("SELECT * FROM especies WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) { Flight::json(['status' => 'error', 'message' => 'Especie no encontrada'], 404); return; }
        Flight::json(['status' => 'success', 'data' => $row]);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// ============================================================
//  RUTAS – SIMULACIONES
// ============================================================

// GET /api/simulaciones – Todas (con nombre de especie)
Flight::route('GET /api/simulaciones', function () {
    try {
        $db = Flight::db();
        $rows = $db->query("
            SELECT s.*, e.nombre_comun AS especie_nombre, e.nombre_cientifico
            FROM simulaciones s
            JOIN especies e ON s.especie_id = e.id
            ORDER BY s.created_at DESC
        ")->fetchAll();
        Flight::json(['status' => 'success', 'data' => $rows]);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// GET /api/simulaciones/@id
Flight::route('GET /api/simulaciones/@id', function ($id) {
    try {
        $db = Flight::db();
        $stmt = $db->prepare("
            SELECT s.*, e.nombre_comun AS especie_nombre, e.nombre_cientifico,
                   e.temp_optima, e.luz_optima, e.agua_optima, e.nutrientes_opt, e.co2_optimo,
                   e.tasa_r AS especie_r, e.capacidad_k AS especie_k, e.dias_madurez,
                   e.biomasa_max, e.color_tallo, e.color_hoja, e.color_flor
            FROM simulaciones s
            JOIN especies e ON s.especie_id = e.id
            WHERE s.id = ?
        ");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) { Flight::json(['status' => 'error', 'message' => 'Simulación no encontrada'], 404); return; }
        Flight::json(['status' => 'success', 'data' => $row]);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// POST /api/simulaciones – Crear simulación
Flight::route('POST /api/simulaciones', function () {
    $d = jsonBody();
    $required = ['nombre', 'especie_id'];
    foreach ($required as $f) {
        if (empty($d[$f])) {
            Flight::json(['status' => 'error', 'message' => "Campo '$f' requerido"], 400);
            return;
        }
    }
    try {
        $db = Flight::db();
        $stmt = $db->prepare("
            INSERT INTO simulaciones (nombre, especie_id, modelo, temperatura, luz, agua, nutrientes, co2, param_r, param_k, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $d['nombre'], $d['especie_id'],
            $d['modelo']       ?? 'logistico',
            $d['temperatura']  ?? 25,
            $d['luz']          ?? 800,
            $d['agua']         ?? 55,
            $d['nutrientes']   ?? 70,
            $d['co2']          ?? 400,
            $d['param_r']      ?? 0.15,
            $d['param_k']      ?? 100,
            $d['notas']        ?? null,
        ]);
        $newId = $db->lastInsertId();
        Flight::json(['status' => 'success', 'message' => 'Simulación creada', 'data' => ['id' => $newId]], 201);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// PUT /api/simulaciones/@id – Actualizar resultados
Flight::route('PUT /api/simulaciones/@id', function ($id) {
    $d = jsonBody();
    try {
        $db = Flight::db();
        $fields = [];
        $values = [];
        $allowed = ['dias_simulados','estado','notas','biomasa_final','altura_final','hojas_total','ramas_total','estres_promedio'];
        foreach ($allowed as $f) {
            if (isset($d[$f])) { $fields[] = "$f = ?"; $values[] = $d[$f]; }
        }
        if (empty($fields)) { Flight::json(['status' => 'error', 'message' => 'Sin campos'], 400); return; }
        $values[] = $id;
        $db->prepare("UPDATE simulaciones SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);
        Flight::json(['status' => 'success', 'message' => 'Simulación actualizada']);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// DELETE /api/simulaciones/@id
Flight::route('DELETE /api/simulaciones/@id', function ($id) {
    try {
        $db = Flight::db();
        $stmt = $db->prepare("DELETE FROM simulaciones WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) { Flight::json(['status' => 'error', 'message' => 'No encontrada'], 404); return; }
        Flight::json(['status' => 'success', 'message' => 'Simulación eliminada']);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// ============================================================
//  RUTAS – MEDICIONES
// ============================================================

// GET /api/simulaciones/@id/mediciones
Flight::route('GET /api/simulaciones/@id/mediciones', function ($id) {
    try {
        $db = Flight::db();
        $stmt = $db->prepare("SELECT * FROM mediciones WHERE simulacion_id = ? ORDER BY dia");
        $stmt->execute([$id]);
        Flight::json(['status' => 'success', 'data' => $stmt->fetchAll()]);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// POST /api/mediciones – Guardar medición
Flight::route('POST /api/mediciones', function () {
    $d = jsonBody();
    if (empty($d['simulacion_id']) || !isset($d['dia'])) {
        Flight::json(['status' => 'error', 'message' => 'simulacion_id y dia requeridos'], 400);
        return;
    }
    try {
        $db = Flight::db();
        $stmt = $db->prepare("
            INSERT INTO mediciones (simulacion_id, dia, altura, biomasa, num_hojas, num_ramas,
              indice_estres_hidrico, indice_estres_termico, indice_estres_luminico, indice_estres_nutricional,
              estres_total, icr, prediccion_cosecha_dias)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $d['simulacion_id'], $d['dia'],
            $d['altura'] ?? 0, $d['biomasa'] ?? 0,
            $d['num_hojas'] ?? 0, $d['num_ramas'] ?? 0,
            $d['indice_estres_hidrico'] ?? 0, $d['indice_estres_termico'] ?? 0,
            $d['indice_estres_luminico'] ?? 0, $d['indice_estres_nutricional'] ?? 0,
            $d['estres_total'] ?? 0, $d['icr'] ?? 0,
            $d['prediccion_cosecha_dias'] ?? null,
        ]);
        Flight::json(['status' => 'success', 'message' => 'Medición guardada', 'data' => ['id' => $db->lastInsertId()]], 201);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// POST /api/mediciones/batch – Guardar múltiples mediciones
Flight::route('POST /api/mediciones/batch', function () {
    $d = jsonBody();
    if (empty($d['mediciones']) || !is_array($d['mediciones'])) {
        Flight::json(['status' => 'error', 'message' => 'Se requiere array "mediciones"'], 400);
        return;
    }
    try {
        $db = Flight::db();
        $db->beginTransaction();
        $stmt = $db->prepare("
            INSERT INTO mediciones (simulacion_id, dia, altura, biomasa, num_hojas, num_ramas,
              indice_estres_hidrico, indice_estres_termico, indice_estres_luminico, indice_estres_nutricional,
              estres_total, icr, prediccion_cosecha_dias)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($d['mediciones'] as $m) {
            $stmt->execute([
                $m['simulacion_id'], $m['dia'],
                $m['altura'] ?? 0, $m['biomasa'] ?? 0,
                $m['num_hojas'] ?? 0, $m['num_ramas'] ?? 0,
                $m['indice_estres_hidrico'] ?? 0, $m['indice_estres_termico'] ?? 0,
                $m['indice_estres_luminico'] ?? 0, $m['indice_estres_nutricional'] ?? 0,
                $m['estres_total'] ?? 0, $m['icr'] ?? 0,
                $m['prediccion_cosecha_dias'] ?? null,
            ]);
        }
        $db->commit();
        Flight::json(['status' => 'success', 'message' => count($d['mediciones']) . ' mediciones guardadas'], 201);
    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// ============================================================
//  RUTAS – DECISIONES
// ============================================================

// GET /api/simulaciones/@id/decisiones
Flight::route('GET /api/simulaciones/@id/decisiones', function ($id) {
    try {
        $db = Flight::db();
        $stmt = $db->prepare("SELECT * FROM decisiones WHERE simulacion_id = ? ORDER BY dia DESC, prioridad DESC");
        $stmt->execute([$id]);
        Flight::json(['status' => 'success', 'data' => $stmt->fetchAll()]);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// POST /api/decisiones
Flight::route('POST /api/decisiones', function () {
    $d = jsonBody();
    if (empty($d['simulacion_id']) || empty($d['mensaje'])) {
        Flight::json(['status' => 'error', 'message' => 'simulacion_id y mensaje requeridos'], 400);
        return;
    }
    try {
        $db = Flight::db();
        $stmt = $db->prepare("
            INSERT INTO decisiones (simulacion_id, dia, tipo, prioridad, mensaje, valor_actual, valor_sugerido)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $d['simulacion_id'], $d['dia'] ?? 0,
            $d['tipo'] ?? 'general', $d['prioridad'] ?? 'media',
            $d['mensaje'],
            $d['valor_actual'] ?? null, $d['valor_sugerido'] ?? null,
        ]);
        Flight::json(['status' => 'success', 'data' => ['id' => $db->lastInsertId()]], 201);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// ============================================================
//  RUTAS – REPORTES Y ANALÍTICA
// ============================================================

// GET /api/reportes/top-biomasa – Top 5 por biomasa
Flight::route('GET /api/reportes/top-biomasa', function () {
    try {
        $db = Flight::db();
        $rows = $db->query("
            SELECT s.id, s.nombre, s.biomasa_final, s.altura_final, s.dias_simulados, s.modelo,
                   e.nombre_comun AS especie, e.nombre_cientifico
            FROM simulaciones s JOIN especies e ON s.especie_id = e.id
            WHERE s.estado = 'completada'
            ORDER BY s.biomasa_final DESC LIMIT 5
        ")->fetchAll();
        Flight::json(['status' => 'success', 'data' => $rows]);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// GET /api/reportes/eficiencia – Especie más eficiente (biomasa/día)
Flight::route('GET /api/reportes/eficiencia', function () {
    try {
        $db = Flight::db();
        $rows = $db->query("
            SELECT e.nombre_comun, e.nombre_cientifico,
                   ROUND(AVG(s.biomasa_final / NULLIF(s.dias_simulados,0)), 2) AS eficiencia_g_dia,
                   ROUND(AVG(s.biomasa_final), 2) AS biomasa_promedio,
                   ROUND(AVG(s.estres_promedio), 2) AS estres_promedio,
                   COUNT(s.id) AS num_simulaciones
            FROM simulaciones s JOIN especies e ON s.especie_id = e.id
            WHERE s.estado = 'completada'
            GROUP BY e.id
            ORDER BY eficiencia_g_dia DESC
        ")->fetchAll();
        Flight::json(['status' => 'success', 'data' => $rows]);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// GET /api/reportes/promedio-madurez – Tiempo promedio a madurez por especie
Flight::route('GET /api/reportes/promedio-madurez', function () {
    try {
        $db = Flight::db();
        $rows = $db->query("
            SELECT e.nombre_comun, e.nombre_cientifico, e.dias_madurez AS madurez_teorica,
                   ROUND(AVG(s.dias_simulados), 0) AS dias_promedio_simulados,
                   COUNT(s.id) AS num_simulaciones
            FROM simulaciones s JOIN especies e ON s.especie_id = e.id
            WHERE s.estado = 'completada'
            GROUP BY e.id
            ORDER BY dias_promedio_simulados ASC
        ")->fetchAll();
        Flight::json(['status' => 'success', 'data' => $rows]);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// GET /api/reportes/comparar/@id1/@id2 – Comparar dos simulaciones A/B
Flight::route('GET /api/reportes/comparar/@id1/@id2', function ($id1, $id2) {
    try {
        $db = Flight::db();
        $stmt = $db->prepare("
            SELECT s.*, e.nombre_comun AS especie, e.nombre_cientifico
            FROM simulaciones s JOIN especies e ON s.especie_id = e.id
            WHERE s.id IN (?, ?)
        ");
        $stmt->execute([$id1, $id2]);
        $sims = $stmt->fetchAll();

        // Mediciones de ambas
        $stmtM = $db->prepare("SELECT * FROM mediciones WHERE simulacion_id IN (?, ?) ORDER BY simulacion_id, dia");
        $stmtM->execute([$id1, $id2]);
        $mediciones = $stmtM->fetchAll();

        $medA = array_values(array_filter($mediciones, fn($m) => $m['simulacion_id'] == $id1));
        $medB = array_values(array_filter($mediciones, fn($m) => $m['simulacion_id'] == $id2));

        Flight::json([
            'status' => 'success',
            'data' => [
                'simulacion_a' => $sims[0] ?? null,
                'simulacion_b' => $sims[1] ?? null,
                'mediciones_a' => $medA,
                'mediciones_b' => $medB,
            ]
        ]);
    } catch (Exception $e) {
        Flight::json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// ============================================================
//  RUTA RAÍZ – Info
// ============================================================
Flight::route('GET /', function () {
    Flight::json([
        'api'     => 'Observatorio Global de Cultivos – Práctica 06',
        'version' => '1.0.0',
        'rutas'   => [
            'GET /api/especies',
            'GET /api/especies/{id}',
            'GET /api/simulaciones',
            'GET /api/simulaciones/{id}',
            'POST /api/simulaciones',
            'PUT /api/simulaciones/{id}',
            'DELETE /api/simulaciones/{id}',
            'GET /api/simulaciones/{id}/mediciones',
            'POST /api/mediciones',
            'POST /api/mediciones/batch',
            'GET /api/simulaciones/{id}/decisiones',
            'POST /api/decisiones',
            'GET /api/reportes/top-biomasa',
            'GET /api/reportes/eficiencia',
            'GET /api/reportes/promedio-madurez',
            'GET /api/reportes/comparar/{id1}/{id2}',
            'GET /api/geo/clima?lat={lat}&lon={lon}',
            'GET /api/geo/historico?lat={lat}&lon={lon}',
            'GET /api/geo/nasa?lat={lat}&lon={lon}',
            'GET /api/geo/suelo?lat={lat}&lon={lon}',
            'GET /api/geo/ocurrencias?especie={nombre}&lat={lat}&lon={lon}',
            'POST /api/geo/analisis',
            'GET /api/geo/ranking',
            'GET /api/geo/ubicaciones',
        ]
    ]);
});

require_once __DIR__ . '/geo-routes.php';

Flight::start();
