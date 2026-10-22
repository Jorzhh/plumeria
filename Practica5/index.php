<?php
// Punto de entrada de la práctica cuando Apache abre la carpeta del repositorio.
$paginaPrincipal = __DIR__ . '/public/index.html';

if (!is_file($paginaPrincipal)) {
    http_response_code(500);
    exit('No se encontró public/index.html. Verifica que la carpeta public esté completa.');
}

header('Location: public/', true, 302);
exit;
