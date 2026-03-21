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
        } elseif (isset($_GET['cedula'])) {
            $sql = "SELECT p.*, i.nombre_iglesia 
                    FROM pastores p
                    LEFT JOIN iglesias i ON p.id_iglesia = i.id_iglesia 
                    WHERE p.cedula = ?";
            $stmt = $database->prepare($sql);
            $stmt->execute([$_GET['cedula']]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
        } elseif (!empty($_GET['id_pastor'])) {
            $sql = "SELECT p.*, i.nombre_iglesia 
                    FROM pastores p
                    LEFT JOIN iglesias i ON p.id_iglesia = i.id_iglesia 
                    WHERE p.id_pastor = ?";
            $stmt = $database->prepare($sql);
            $stmt->execute([$_GET['id_pastor']]);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
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
            $database->beginTransaction();
            
            // 1. Insertar el pastor
            $sql = "INSERT INTO pastores (nombre, apellido, cedula, edad, esposa, hijos, anos_ministerio, tipo_licencia, cargo, id_iglesia, zona, estatus_activo) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $database->prepare($sql);
            $stmt->execute([
                $input['nombre'] ?? null, $input['apellido'] ?? null, $input['cedula'] ?? null, 
                $input['edad'] ?? null, $input['esposa'] ?? null, $input['hijos'] ?? 0, 
                $input['anos_ministerio'] ?? null, $input['tipo_licencia'] ?? null, 
                $input['cargo'] ?? null, $input['id_iglesia'] ?? null, $input['zona'] ?? null, $input['estatus_activo'] ?? 1
            ]);
            
            $id_pastor = $database->lastInsertId();
            
            // 2. Crear automáticamente el usuario
            if (isset($input['cedula'])) {
                $username = $input['cedula'];
                $password = password_hash($username, PASSWORD_DEFAULT);
                $rol = 'Pastor';
                
                $sql_user = "INSERT INTO usuarios (username, password, rol, id_pastor) VALUES (?, ?, ?, ?)";
                $stmt_user = $database->prepare($sql_user);
                $stmt_user->execute([$username, $password, $rol, $id_pastor]);
            }
            
            $database->commit();
            echo json_encode(["message" => "Pastor y usuario creados con éxito", "id" => $id_pastor]);
            
        } catch (PDOException $e) {
            $database->rollBack();
            if ($e->getCode() == 23000) {
                http_response_code(409);
                echo json_encode(["error" => "La cédula ya existe (o el usuario ya existe)"]);
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
                    anos_ministerio=?, tipo_licencia=?, cargo=?, id_iglesia=?, zona=?, estatus_activo=? 
                    WHERE id_pastor=?";
            $stmt = $database->prepare($sql);
            $stmt->execute([
                $input['nombre'] ?? null, $input['apellido'] ?? null, $input['edad'] ?? null, 
                $input['esposa'] ?? null, $input['hijos'] ?? 0, $input['anos_ministerio'] ?? null, 
                $input['tipo_licencia'] ?? null, $input['cargo'] ?? null, $input['id_iglesia'] ?? null, 
                $input['zona'] ?? null, $input['estatus_activo'] ?? 1, $_GET['id']
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