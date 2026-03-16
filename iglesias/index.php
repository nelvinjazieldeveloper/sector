<?php
// allow cross‑origin requests
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// respond to preflight
if (
    isset($_SERVER['REQUEST_METHOD']) &&
    $_SERVER['REQUEST_METHOD'] === 'OPTIONS'
) {
    exit;
}

require_once '../conn.php'; 

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$database = $conn; 

switch ($method) {
    
    // 1. LEER (GET) - Lista todas las iglesias o una por ID
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $database->prepare("SELECT * FROM iglesias WHERE id_iglesia = ?");
            $stmt->execute([$_GET['id']]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            // También podemos filtrar por zona si lo pasas por la URL: api_iglesias.php?zona=1
            if (isset($_GET['zona'])) {
                $stmt = $database->prepare("SELECT * FROM iglesias WHERE zona = ? ORDER BY nombre_iglesia ASC");
                $stmt->execute([$_GET['zona']]);
            } else {
                $stmt = $database->prepare("SELECT * FROM iglesias ORDER BY zona ASC, nombre_iglesia ASC");
                $stmt->execute();
            }
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        echo json_encode($result ? $result : []);
        break;

    // 2. CREAR (POST)
    case 'POST':
        if (!$input) {
            http_response_code(400);
            echo json_encode(["error" => "No se recibieron datos"]);
            break;
        }
        $sql = "INSERT INTO iglesias (nombre_iglesia, direccion, cantidad_miembros, zona, tiene_terreno, tiene_casa_pastoral) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $database->prepare($sql);
        $stmt->execute([
            $input['nombre_iglesia'], 
            $input['direccion'], 
            $input['cantidad_miembros'], 
            $input['zona'],
            $input['tiene_terreno'] ?? 0,
            $input['tiene_casa_pastoral'] ?? 0
        ]);
        echo json_encode(["message" => "Iglesia registrada con éxito", "id" => $database->lastInsertId()]);
        break;

    // 3. ACTUALIZAR (PUT)
    case 'PUT':
        if (!isset($_GET['id']) || !$input) {
            http_response_code(400);
            echo json_encode(["error" => "ID y datos requeridos"]);
            break;
        }
        $sql = "UPDATE iglesias SET nombre_iglesia=?, direccion=?, cantidad_miembros=?, zona=?, tiene_terreno=?, tiene_casa_pastoral=? 
                WHERE id_iglesia=?";
        $stmt = $database->prepare($sql);
        $stmt->execute([
            $input['nombre_iglesia'], 
            $input['direccion'], 
            $input['cantidad_miembros'], 
            $input['zona'], 
            $input['tiene_terreno'] ?? 0,
            $input['tiene_casa_pastoral'] ?? 0,
            $_GET['id']
        ]);
        echo json_encode(["message" => "Datos de la iglesia actualizados"]);
        break;

    // 4. ELIMINAR (DELETE)
    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID requerido"]);
            break;
        }
        // Nota realista: Podrías verificar si hay pastores asociados antes de borrar
        $stmt = $database->prepare("DELETE FROM iglesias WHERE id_iglesia = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["message" => "Iglesia eliminada correctamente"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}
?>