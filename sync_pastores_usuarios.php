<?php
require_once 'conn.php';

try {
    // 1. Obtener todos los pastores que NO tienen un usuario vinculado
    $sql = "SELECT p.id_pastor, p.cedula, p.nombre, p.apellido 
            FROM pastores p 
            WHERE p.id_pastor NOT IN (SELECT id_pastor FROM usuarios WHERE id_pastor IS NOT NULL)";
    $stmt = $conn->query($sql);
    $pastores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $count = 0;
    foreach ($pastores as $p) {
        // El username será la cédula
        // El password por defecto será la cédula
        $username = $p['cedula'];
        $password = password_hash($p['cedula'], PASSWORD_DEFAULT);
        $id_pastor = $p['id_pastor'];
        $rol = 'Pastor';

        // Insertar en usuarios
        // Usar INSERT IGNORE o verificar duplicidad de username por si acaso
        $check = $conn->prepare("SELECT id_usuario FROM usuarios WHERE username = ?");
        $check->execute([$username]);
        if (!$check->fetch()) {
            $insert = $conn->prepare("INSERT INTO usuarios (username, password, rol, id_pastor) VALUES (?, ?, ?, ?)");
            $insert->execute([$username, $password, $rol, $id_pastor]);
            $count++;
        }
    }

    echo "<h1>Sincronización Completada</h1>";
    echo "<p>Se han creado <strong>$count</strong> nuevas cuentas de usuario para pastores.</p>";
    echo "<p>Credenciales predeterminadas: Usuario y Contraseña = Cédula del pastor.</p>";
    echo "<a href='index.php'>Volver</a>";

} catch (PDOException $e) {
    echo "<h1>Error en la Sincronización</h1>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
