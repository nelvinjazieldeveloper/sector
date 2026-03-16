<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once '../conn.php'; 
$pdo = $conn;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM reuniones ORDER BY fecha DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        // SQL ajustado: id_reunion y creado_el son gestionados por MySQL
        $sql = "INSERT INTO reuniones (titulo, fecha, lugar, descripcion) VALUES (?, ?, ?, ?)";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['titulo'] ?? 'Reunión sin título', 
                $data['fecha']  ?? date('Y-m-d'), 
                $data['lugar']  ?? '', 
                $data['descripcion'] ?? ''
            ]);
            echo json_encode(["message" => "Reunión guardada exitosamente", "id" => $pdo->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["error" => "Error SQL: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $id_edit = isset($_GET['id']) ? intval($_GET['id']) : null;
        $data = json_decode(file_get_contents("php://input"), true);
        
        if ($id_edit) {
            $sql = "UPDATE reuniones SET titulo=?, fecha=?, lugar=?, descripcion=? WHERE id_reunion=?";
            try {
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $data['titulo'], 
                    $data['fecha'], 
                    $data['lugar'], 
                    $data['descripcion'], 
                    $id_edit
                ]);
                echo json_encode(["message" => "Reunión actualizada"]);
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode(["error" => $e->getMessage()]);
            }
        }
        break;

    case 'DELETE':
        $id_del = isset($_GET['id']) ? intval($_GET['id']) : null;
        try {
            $stmt = $pdo->prepare("DELETE FROM reuniones WHERE id_reunion = ?");
            $stmt->execute([$id_del]);
            echo json_encode(["message" => "Registro eliminado"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>