<?php
// endpoint ubicado en la carpeta "path" (accesible a través de /path/ o /path/index.php)
// sirve como ejemplo rápido para el frontend

// permitir CORS (ajusta el origen si quieres restringirlo en producción)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

header("Content-Type: application/json; charset=UTF-8");

// responder a preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$response = [
    "message" => "Endpoint de ejemplo funcionando (ruta /path/)",
    "time" => date("c"),
];

echo json_encode($response);
