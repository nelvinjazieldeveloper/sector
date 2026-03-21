<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../conn.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT u.id_usuario, u.username, u.rol, u.id_pastor, u.creado_el, p.nombre, p.apellido 
                               FROM usuarios u 
                               LEFT JOIN pastores p ON u.id_pastor = p.id_pastor");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['username']) || !isset($data['password']) || !isset($data['rol'])) {
            http_response_code(400);
            echo json_encode(["error" => "Datos incompletos"]);
            break;
        }

        $conn->beginTransaction();
        try {
            $rol = $data['rol'];
            $special_roles = ['Presbitero', 'Secretario', 'Tesorero'];
            
            if (in_array($rol, $special_roles)) {
                // Si es un rol especial, quitamos ese rol a cualquier otro que lo tenga
                $conn->prepare("UPDATE usuarios SET rol = 'Pastor' WHERE rol = ?")->execute([$rol]);
            }

            $pass = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO usuarios (username, password, rol, id_pastor) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $data['username'], 
                $pass, 
                $rol, 
                $data['id_pastor'] ?? null
            ]);
            $newId = $conn->lastInsertId();
            $conn->commit();
            echo json_encode(["message" => "Usuario creado", "id" => $newId]);
        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(400);
            echo json_encode(["error" => "El usuario ya existe o error en DB: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        
        $conn->beginTransaction();
        try {
            $rol = $data['rol'] ?? null;
            $special_roles = ['Presbitero', 'Secretario', 'Tesorero'];

            if ($rol && in_array($rol, $special_roles)) {
                // Si estamos asignando un rol especial, otros que lo tengan vuelven a ser 'Pastor'
                // Excepto el usuario que estamos editando actualmente
                $stmt = $conn->prepare("UPDATE usuarios SET rol = 'Pastor' WHERE rol = ? AND id_usuario != ?");
                $stmt->execute([$rol, $id]);
            }

            $sql = "UPDATE usuarios SET rol = ?, id_pastor = ?";
            $params = [$data['rol'], $data['id_pastor'] ?? null];
            
            if (!empty($data['password'])) {
                $sql .= ", password = ?";
                $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
            }
            
            $sql .= " WHERE id_usuario = ?";
            $params[] = $id;
            
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $conn->commit();
            echo json_encode(["message" => "Usuario actualizado"]);
        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(400);
            echo json_encode(["error" => "Error al actualizar usuario: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $stmt = $conn->prepare("DELETE FROM usuarios WHERE id_usuario = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Usuario eliminado"]);
        break;
}
?>
