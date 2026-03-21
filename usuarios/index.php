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
        $pass = password_hash($data['password'], PASSWORD_DEFAULT);
        try {
            $stmt = $conn->prepare("INSERT INTO usuarios (username, password, rol, id_pastor) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $data['username'], 
                $pass, 
                $data['rol'], 
                $data['id_pastor'] ?? null
            ]);
            echo json_encode(["message" => "Usuario creado", "id" => $conn->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["error" => "El usuario ya existe o error en DB"]);
        }
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        
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
        echo json_encode(["message" => "Usuario actualizado"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $stmt = $conn->prepare("DELETE FROM usuarios WHERE id_usuario = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Usuario eliminado"]);
        break;
}
?>
