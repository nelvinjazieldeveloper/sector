<?php
// habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../conn.php'; 

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$database = $conn; 

switch ($method) {
    
    case 'GET':
        if (isset($_GET['id_pastor'])) {
            // Hijos de un pastor específico con el nombre del padre
            $sql = "SELECT h.*, CONCAT(p.nombre, ' ', p.apellido) AS pastor_nombre 
                    FROM hijos_pastores h
                    LEFT JOIN pastores p ON h.id_pastor = p.id_pastor
                    WHERE h.id_pastor = ?";
            $stmt = $database->prepare($sql);
            $stmt->execute([$_GET['id_pastor']]);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } 
        elseif (isset($_GET['id'])) {
            // Un hijo específico con el nombre del padre
            $sql = "SELECT h.*, CONCAT(p.nombre, ' ', p.apellido) AS pastor_nombre 
                    FROM hijos_pastores h
                    LEFT JOIN pastores p ON h.id_pastor = p.id_pastor
                    WHERE h.id_hijo = ?";
            $stmt = $database->prepare($sql);
            $stmt->execute([$_GET['id']]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            // Todos los hijos con el nombre del padre
            $sql = "SELECT h.*, CONCAT(p.nombre, ' ', p.apellido) AS pastor_nombre 
                    FROM hijos_pastores h
                    LEFT JOIN pastores p ON h.id_pastor = p.id_pastor
                    ORDER BY h.id_hijo DESC";
            $stmt = $database->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        echo json_encode($result ? $result : []);
        break;

    case 'POST':
        if (!$input) {
            http_response_code(400);
            echo json_encode(["error" => "Datos no recibidos"]);
            break;
        }
        $sql = "INSERT INTO hijos_pastores (id_pastor, nombre, apellido, sexo, edad, talentos, estudios) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $database->prepare($sql);
        $stmt->execute([
            $input['id_pastor'], 
            $input['nombre'], 
            $input['apellido'], 
            $input['sexo'], 
            $input['edad'],
            $input['talentos'] ?? '',
            $input['estudios'] ?? ''
        ]);
        echo json_encode(["message" => "Hijo(a) registrado con éxito", "id" => $database->lastInsertId()]);
        break;

    case 'PUT':
        if (!isset($_GET['id']) || !$input) {
            http_response_code(400);
            echo json_encode(["error" => "ID y datos requeridos"]);
            break;
        }
        // Nota: usualmente no cambiamos el id_pastor al editar al hijo, 
        // pero si lo necesitas, agrégalo al SET y al execute.
        $sql = "UPDATE hijos_pastores SET nombre=?, apellido=?, sexo=?, edad=?, talentos=?, estudios=? WHERE id_hijo=?";
        $stmt = $database->prepare($sql);
        $stmt->execute([
            $input['nombre'], 
            $input['apellido'], 
            $input['sexo'], 
            $input['edad'], 
            $input['talentos'] ?? '',
            $input['estudios'] ?? '',
            $_GET['id']
        ]);
        echo json_encode(["message" => "Datos del hijo(a) actualizados"]);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID requerido"]);
            break;
        }
        $stmt = $database->prepare("DELETE FROM hijos_pastores WHERE id_hijo = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["message" => "Registro eliminado"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}
?>