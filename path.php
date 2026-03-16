<?php
// simple example endpoint used by the frontend demo

header("Content-Type: application/json; charset=UTF-8");

// return a fixed JSON object; you can modify as needed
$response = [
    "message" => "Endpoint de ejemplo funcionando",
    "time" => date("c"),
    // puedes agregar más campos aquí para simular datos reales
];
echo json_encode($response);
