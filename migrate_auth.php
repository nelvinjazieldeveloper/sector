<?php
require_once 'conn.php';

try {
    // 1. Crear tabla de usuarios
    $sql = "CREATE TABLE IF NOT EXISTS `usuarios` (
      `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
      `username` varchar(50) NOT NULL,
      `password` varchar(255) NOT NULL,
      `rol` enum('Admin','Presbitero','Tesorero','Secretario','Pastor') NOT NULL DEFAULT 'Pastor',
      `id_pastor` int(11) DEFAULT NULL,
      `creado_el` timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id_usuario`),
      UNIQUE KEY `username` (`username`),
      KEY `id_pastor` (`id_pastor`),
      CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_pastor`) REFERENCES `pastores` (`id_pastor`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
    
    $conn->exec($sql);
    
    // 2. Insertar usuario admin inicial (si no existe)
    $checkAdmin = $conn->query("SELECT id_usuario FROM usuarios WHERE username = 'admin'")->fetch();
    if (!$checkAdmin) {
        $pass = password_hash('password', PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO usuarios (username, password, rol) VALUES ('admin', ?, 'Admin')");
        $stmt->execute([$pass]);
        echo "<p>Usuario 'admin' creado (password: 'password')</p>";
    }

    echo "<h1>Migración de Usuarios Completada</h1>";
    echo "<p>La tabla 'usuarios' ha sido creada exitosamente.</p>";
    echo "<a href='migrate_db.php'>Volver (o borrar este archivo)</a>";
    
} catch (PDOException $e) {
    echo "<h1>Error en la Migración</h1>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
