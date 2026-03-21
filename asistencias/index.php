<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../conn.php'; 
$pdo = $conn;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $id_reunion = isset($_GET['id_reunion']) ? intval($_GET['id_reunion']) : null;
        if ($id_reunion) {
            $sql = "SELECT 
                        p.id_pastor, p.nombre, p.apellido,
                        a.id_asistencia,
                        CASE WHEN a.id_asistencia IS NOT NULL THEN 'Asistió' ELSE 'Inasistente' END as estatus,
                        a.motivo, a.justificada
                    FROM pastores p
                    LEFT JOIN asistencias a ON p.id_pastor = a.id_pastor AND a.id_reunion = ?
                    ORDER BY p.apellido ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id_reunion]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO asistencias (id_reunion, id_pastor, motivo, justificada) VALUES (?, ?, ?, ?)";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['id_reunion'], 
                $data['id_pastor'], 
                $data['motivo'] ?? '', 
                $data['justificada'] ?? 0
            ]);
            echo json_encode(["message" => "Asistencia registrada", "id" => $pdo->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        
        if ($id) {
            $sql = "UPDATE asistencias SET justificada = ?, motivo = ? WHERE id_asistencia = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['justificada'], 
                $data['motivo'], 
                $id
            ]);
            echo json_encode(["message" => "Datos de asistencia actualizados"]);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $stmt = $pdo->prepare("DELETE FROM asistencias WHERE id_asistencia = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Asistencia eliminada (marcado como inasistente)"]);
        break;
}
?>
