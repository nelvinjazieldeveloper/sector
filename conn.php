<?php
// Configuración de la base de datos
$host     = "localhost";
$db_name  = "sector"; // Cambia esto al nombre de tu base de datos
$username = "root";       // Tu usuario de base de datos
$password = "";           // Tu contraseña

try {
    // Creamos la conexión con el set de caracteres UTF-8 para evitar problemas con acentos y la "ñ"
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    
    // Configuramos PDO para que lance excepciones en caso de error
    // Esto es vital para capturar errores de duplicados de cédula o fallos de red
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Desactivamos la emulación de sentencias preparadas para mayor seguridad real
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

} catch(PDOException $exception) {
    // En caso de error, devolvemos un JSON para que el API no rompa el formato de respuesta
    header("Content-Type: application/json");
    http_response_code(500);
    echo json_encode([
        "error" => "Error de conexión: " . $exception->getMessage()
    ]);
    exit;
}