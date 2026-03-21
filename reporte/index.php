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
        } elseif (!empty($_GET['id_pastor'])) {
            $sql = "SELECT r.*, CONCAT(p.nombre, ' ', p.apellido) AS pastor_nombre, i.nombre_iglesia AS iglesia_nombre
                    FROM reportes_mensuales r
                    INNER JOIN pastores p ON r.id_pastor = p.id_pastor
                    INNER JOIN iglesias i ON r.id_iglesia = i.id_iglesia
                    WHERE r.id_pastor = ?
                    ORDER BY r.anio_reportado DESC, r.mes_reportado DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$_GET['id_pastor']]);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
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
        $sql = "INSERT INTO reportes_mensuales (
            id_pastor, id_iglesia, mes_reportado, anio_reportado,
            diezmos_bs, poder_del_uno_bs, unica_sectorial_bs, campamento_bs, convencion_bs,
            ofrenda_1_nombre, ofrenda_1_bs, ofrenda_2_nombre, ofrenda_2_bs,
            diezmos_usd, poder_del_uno_usd, unica_sectorial_usd, campamento_usd, convencion_usd,
            ofrenda_1_usd, ofrenda_2_usd,
            diezmos_cop, poder_del_uno_cop, unica_sectorial_cop, campamento_cop, convencion_cop,
            ofrenda_1_cop, ofrenda_2_cop,
            tipo_pago, banco_destino, fecha_pago, referencia, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['id_pastor'] ?? null, $data['id_iglesia'] ?? null, $data['mes_reportado'] ?? null, $data['anio_reportado'] ?? null,
            $data['diezmos_bs'] ?? 0, $data['poder_del_uno_bs'] ?? 0, $data['unica_sectorial_bs'] ?? 0, $data['campamento_bs'] ?? 0, $data['convencion_bs'] ?? 0,
            $data['ofrenda_1_nombre'] ?? null, $data['ofrenda_1_bs'] ?? 0, $data['ofrenda_2_nombre'] ?? null, $data['ofrenda_2_bs'] ?? 0,
            $data['diezmos_usd'] ?? 0, $data['poder_del_uno_usd'] ?? 0, $data['unica_sectorial_usd'] ?? 0, $data['campamento_usd'] ?? 0, $data['convencion_usd'] ?? 0,
            $data['ofrenda_1_usd'] ?? 0, $data['ofrenda_2_usd'] ?? 0,
            $data['diezmos_cop'] ?? 0, $data['poder_del_uno_cop'] ?? 0, $data['unica_sectorial_cop'] ?? 0, $data['campamento_cop'] ?? 0, $data['convencion_cop'] ?? 0,
            $data['ofrenda_1_cop'] ?? 0, $data['ofrenda_2_cop'] ?? 0,
            $data['tipo_pago'] ?? 'Efectivo', $data['banco_destino'] ?? null, $data['fecha_pago'] ?? null, $data['referencia'] ?? null, $data['observaciones'] ?? null
        ]);
        echo json_encode(["message" => "Reporte guardado", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE reportes_mensuales SET 
            diezmos_bs=?, poder_del_uno_bs=?, unica_sectorial_bs=?, campamento_bs=?, convencion_bs=?,
            ofrenda_1_nombre=?, ofrenda_1_bs=?, ofrenda_2_nombre=?, ofrenda_2_bs=?,
            diezmos_usd=?, poder_del_uno_usd=?, unica_sectorial_usd=?, campamento_usd=?, convencion_usd=?,
            ofrenda_1_usd=?, ofrenda_2_usd=?,
            diezmos_cop=?, poder_del_uno_cop=?, unica_sectorial_cop=?, campamento_cop=?, convencion_cop=?,
            ofrenda_1_cop=?, ofrenda_2_cop=?,
            tipo_pago=?, banco_destino=?, fecha_pago=?, referencia=?, observaciones=?
            WHERE id_reporte=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['diezmos_bs'] ?? 0, $data['poder_del_uno_bs'] ?? 0, $data['unica_sectorial_bs'] ?? 0, $data['campamento_bs'] ?? 0, $data['convencion_bs'] ?? 0,
            $data['ofrenda_1_nombre'] ?? null, $data['ofrenda_1_bs'] ?? 0, $data['ofrenda_2_nombre'] ?? null, $data['ofrenda_2_bs'] ?? 0,
            $data['diezmos_usd'] ?? 0, $data['poder_del_uno_usd'] ?? 0, $data['unica_sectorial_usd'] ?? 0, $data['campamento_usd'] ?? 0, $data['convencion_usd'] ?? 0,
            $data['ofrenda_1_usd'] ?? 0, $data['ofrenda_2_usd'] ?? 0,
            $data['diezmos_cop'] ?? 0, $data['poder_del_uno_cop'] ?? 0, $data['unica_sectorial_cop'] ?? 0, $data['campamento_cop'] ?? 0, $data['convencion_cop'] ?? 0,
            $data['ofrenda_1_cop'] ?? 0, $data['ofrenda_2_cop'] ?? 0,
            $data['tipo_pago'] ?? 'Efectivo', $data['banco_destino'] ?? null, $data['fecha_pago'] ?? null, $data['referencia'] ?? null, $data['observaciones'] ?? null,
            $id
        ]);
        echo json_encode(["message" => "Reporte actualizado"]);
        break;

    case 'DELETE':
        $stmt = $pdo->prepare("DELETE FROM reportes_mensuales WHERE id_reporte = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Reporte eliminado"]);
        break;
}