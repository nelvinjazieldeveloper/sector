<?php
require_once 'conn.php';
$stmt = $conn->query("SELECT id_usuario, username, rol, id_pastor FROM usuarios");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
