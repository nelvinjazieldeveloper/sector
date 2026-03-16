<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../conn.php'; 
$pdo = $conn;

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $sql = "SELECT r.*, CONCAT(p.nombre, ' ', p.apellido) AS pastor_nombre, i.nombre_iglesia AS iglesia_nombre
                    FROM reportes_mensuales r
                    INNER JOIN pastores p ON r.id_pastor = p.id_pastor
                    INNER JOIN iglesias i ON r.id_iglesia = i.id_iglesia
                    WHERE r.id_reporte = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            $sql = "SELECT r.*, CONCAT(p.nombre, ' ', p.apellido) AS pastor_nombre, i.nombre_iglesia AS iglesia_nombre
                    FROM reportes_mensuales r
                    INNER JOIN pastores p ON r.id_pastor = p.id_pastor
                    INNER JOIN iglesias i ON r.id_iglesia = i.id_iglesia
                    ORDER BY r.anio_reportado DESC, r.mes_reportado DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        echo json_encode($result ? $result : []);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO reportes_mensuales (id_pastor, id_iglesia, mes_reportado, anio_reportado, diezmos_bs, diezmos_usd, tipo_pago, referencia) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['id_pastor'], $data['id_iglesia'], $data['mes_reportado'], 
            $data['anio_reportado'], $data['diezmos_bs'], $data['diezmos_usd'], 
            $data['tipo_pago'], $data['referencia']
        ]);
        echo json_encode(["message" => "Reporte guardado", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE reportes_mensuales SET diezmos_bs=?, diezmos_usd=?, tipo_pago=?, referencia=? WHERE id_reporte=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['diezmos_bs'], $data['diezmos_usd'], $data['tipo_pago'], $data['referencia'], $id]);
        echo json_encode(["message" => "Reporte actualizado"]);
        break;

    case 'DELETE':
        $stmt = $pdo->prepare("DELETE FROM reportes_mensuales WHERE id_reporte = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Reporte eliminado"]);
        break;
}