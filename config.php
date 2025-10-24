<?php
$host = "-";
$user = "-";
$pass = "-";
$dbname = "-";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Error en la conexión: " . $conn->connect_error);
}
?>
