<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../conn.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Usuario y contraseña requeridos"]);
    exit;
}

$username = $data['username'];
$password = $data['password'];

$stmt = $conn->prepare("SELECT u.*, p.nombre, p.apellido 
                       FROM usuarios u 
                       LEFT JOIN pastores p ON u.id_pastor = p.id_pastor 
                       WHERE u.username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {
    // Quitar el hash de la contraseña de la respuesta
    unset($user['password']);
    echo json_encode([
        "message" => "Login exitoso",
        "user" => $user
    ]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Credenciales inválidas"]);
}
?>
