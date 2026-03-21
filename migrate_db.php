<?php
require_once 'conn.php';

try {
    $conn->exec("RENAME TABLE inasistencias TO asistencias");
    $conn->exec("ALTER TABLE asistencias CHANGE id_inasistencia id_asistencia INT(11) NOT NULL AUTO_INCREMENT");
    
    echo "<h1>Migración Exitosa</h1>";
    echo "<p>La tabla ha sido renombrada de 'inasistencias' a 'asistencias'.</p>";
    echo "<a href='index.php'>Volver al inicio</a>";
    
    // Autodelete this script for security
    // unlink(__FILE__); 
    
} catch (PDOException $e) {
    echo "<h1>Error en la Migración</h1>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
