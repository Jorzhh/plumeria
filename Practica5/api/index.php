<?php
require_once __DIR__ . '/vendor/autoload.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

Flight::register('db', 'PDO', array('mysql:host=localhost;dbname=practica05_bioinformatica;charset=utf8mb4', 'root', ''), function($db) {
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
});

// Ruta 1: Catálogo Botánico
Flight::route('GET /api/especies', function() {
    $db = Flight::db();
    $stmt = $db->query("SELECT * FROM especies ORDER BY id ASC");
    Flight::json($stmt->fetchAll());
});

// Ruta 2: Guardar Simulación
Flight::route('POST /api/simulaciones', function() {
    $db = Flight::db();
    $data = Flight::request()->data->getData();

    $sql = "INSERT INTO simulaciones 
            (nombre, especie_id, modelo, temperatura, luz, agua, nutrientes, co2, param_r, param_k, dias_simulados, estado, notas, biomasa_final, altura_final, hojas_total, ramas_total, estres_promedio) 
            VALUES (:nombre, :especie_id, :modelo, :temperatura, :luz, :agua, :nutrientes, :co2, :param_r, :param_k, :dias_simulados, :estado, :notas, :biomasa_final, :altura_final, :hojas_total, :ramas_total, :estres_promedio)";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':nombre' => $data['nombre'] ?? 'Ensayo de Cultivo 3D',
        ':especie_id' => $data['especie_id'],
        ':modelo' => $data['modelo'],
        ':temperatura' => $data['temperatura'],
        ':luz' => $data['luz'],
        ':agua' => $data['agua'],
        ':nutrientes' => $data['nutrientes'],
        ':co2' => $data['co2'],
        ':param_r' => $data['param_r'],
        ':param_k' => $data['param_k'],
        ':dias_simulados' => $data['dias_simulados'],
        ':estado' => $data['estado'] ?? 'en_curso',
        ':notas' => $data['notas'] ?? '',
        ':biomasa_final' => $data['biomasa_final'] ?? 0,
        ':altura_final' => $data['altura_final'] ?? 0,
        ':hojas_total' => $data['hojas_total'] ?? 0,
        ':ramas_total' => $data['ramas_total'] ?? 0,
        ':estres_promedio' => $data['estres_promedio'] ?? 0
    ]);

    $id = $db->lastInsertId();
    Flight::json(['success' => true, 'id' => $id, 'message' => 'Simulación guardada en MySQL']);
});

// Ruta 3: Historial
Flight::route('GET /api/simulaciones', function() {
    $db = Flight::db();
    $sql = "SELECT s.*, e.nombre_comun AS especie_nombre, e.nombre_cientifico 
            FROM simulaciones s 
            JOIN especies e ON s.especie_id = e.id 
            ORDER BY s.id DESC";
    $stmt = $db->query($sql);
    Flight::json($stmt->fetchAll());
});

// Ruta 4: Registro de Mediciones por Lote
Flight::route('POST /api/mediciones/batch', function() {
    $db = Flight::db();
    $mediciones = Flight::request()->data->getData();

    if (empty($mediciones) || !is_array($mediciones)) {
        Flight::json(['error' => 'Datos inválidos'], 400);
        return;
    }

    $db->beginTransaction();
    try {
        $sql = "INSERT INTO mediciones 
                (simulacion_id, dia, biomasa, altura, num_hojas, num_ramas, icr, estres_total, indice_estres_hidrico, indice_estres_termico, indice_estres_luminico, indice_estres_nutricional) 
                VALUES (:simulacion_id, :dia, :biomasa, :altura, :num_hojas, :num_ramas, :icr, :estres_total, :indice_estres_hidrico, :indice_estres_termico, :indice_estres_luminico, :indice_estres_nutricional)";
        
        $stmt = $db->prepare($sql);
        foreach ($mediciones as $m) {
            $stmt->execute([
                ':simulacion_id' => $m['simulacion_id'],
                ':dia' => $m['dia'],
                ':biomasa' => $m['biomasa'],
                ':altura' => $m['altura'],
                ':num_hojas' => $m['num_hojas'],
                ':num_ramas' => $m['num_ramas'],
                ':icr' => $m['icr'],
                ':estres_total' => $m['estres_total'],
                ':indice_estres_hidrico' => $m['indice_estres_hidrico'] ?? 0,
                ':indice_estres_termico' => $m['indice_estres_termico'] ?? 0,
                ':indice_estres_luminico' => $m['indice_estres_luminico'] ?? 0,
                ':indice_estres_nutricional' => $m['indice_estres_nutricional'] ?? 0
            ]);
        }
        $db->commit();
        Flight::json(['success' => true, 'insertados' => count($mediciones)]);
    } catch (Exception $e) {
        $db->rollBack();
        Flight::json(['error' => $e->getMessage()], 500);
    }
});

// Ruta 5: Reportes Bioinformáticos
Flight::route('GET /api/reportes', function() {
    $db = Flight::db();
    
    $topBiomasa = $db->query("SELECT s.nombre, e.nombre_comun AS especie, s.modelo, s.biomasa_final, s.altura_final 
                              FROM simulaciones s 
                              JOIN especies e ON s.especie_id = e.id 
                              ORDER BY s.biomasa_final DESC LIMIT 5")->fetchAll();

    $eficiencia = $db->query("SELECT e.nombre_comun AS especie, 
                                     ROUND(AVG(s.biomasa_final / NULLIF(s.dias_simulados, 0)), 2) AS eficiencia_g_dia,
                                     ROUND(AVG(s.estres_promedio), 1) AS estres_prom,
                                     COUNT(s.id) AS corridas
                              FROM simulaciones s
                              JOIN especies e ON s.especie_id = e.id
                              GROUP BY e.id")->fetchAll();

    Flight::json([
        'top_biomasa' => $topBiomasa,
        'eficiencia' => $eficiencia
    ]);
});

Flight::start();