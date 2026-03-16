<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../conn.php'; 

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$database = $conn; 

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $sql = "SELECT p.*, i.nombre_iglesia 
                    FROM pastores p
                    LEFT JOIN iglesias i ON p.id_iglesia = i.id_iglesia 
                    WHERE p.id_pastor = ?";
            $stmt = $database->prepare($sql);
            $stmt->execute([$_GET['id']]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            $sql = "SELECT p.*, i.nombre_iglesia 
                    FROM pastores p
                    LEFT JOIN iglesias i ON p.id_iglesia = i.id_iglesia 
                    ORDER BY p.id_pastor DESC";
            $stmt = $database->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        echo json_encode($result ? $result : []);
        break;

    case 'POST':
        if (!$input) {
            http_response_code(400);
            echo json_encode(["error" => "No se recibieron datos"]);
            break;
        }
        try {
            $sql = "INSERT INTO pastores (nombre, apellido, cedula, edad, esposa, hijos, anos_ministerio, tipo_licencia, cargo, id_iglesia, zona) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $database->prepare($sql);
            $stmt->execute([
                $input['nombre'], $input['apellido'], $input['cedula'], 
                $input['edad'] ?? null, $input['esposa'] ?? null, $input['hijos'] ?? 0, 
                $input['anos_ministerio'] ?? null, $input['tipo_licencia'], 
                $input['cargo'], $input['id_iglesia'], $input['zona']
            ]);
            echo json_encode(["message" => "Creado con éxito", "id" => $database->lastInsertId()]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                http_response_code(409);
                echo json_encode(["error" => "La cédula ya existe"]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => $e->getMessage()]);
            }
        }
        break;

    case 'PUT':
        if (!isset($_GET['id']) || !$input) {
            http_response_code(400);
            echo json_encode(["error" => "ID y datos requeridos"]);
            break;
        }
        try {
            // NOTA: Se excluye la cédula del UPDATE para evitar errores de duplicidad
            $sql = "UPDATE pastores SET nombre=?, apellido=?, edad=?, esposa=?, hijos=?, 
                    anos_ministerio=?, tipo_licencia=?, cargo=?, id_iglesia=?, zona=? 
                    WHERE id_pastor=?";
            $stmt = $database->prepare($sql);
            $stmt->execute([
                $input['nombre'], $input['apellido'], $input['edad'] ?? null, 
                $input['esposa'] ?? null, $input['hijos'] ?? 0, $input['anos_ministerio'] ?? null, 
                $input['tipo_licencia'], $input['cargo'], $input['id_iglesia'], 
                $input['zona'], $_GET['id']
            ]);
            echo json_encode(["message" => "Actualizado con éxito"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $stmt = $database->prepare("DELETE FROM pastores WHERE id_pastor = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["message" => "Eliminado"]);
        break;
}