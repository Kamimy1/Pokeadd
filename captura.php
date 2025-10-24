<?php
include 'session.php';
include 'config.php';

if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    exit();
}

$usuario = $_SESSION['usuario'];

// Obtener ID del usuario
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE n_usuario = ?");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$stmt->bind_result($id_usuario);
$stmt->fetch();
$stmt->close();

$id_pokemon = $_POST['id_pokemon'];
$id_generacion = $_POST['id_generacion'];
$capturado = $_POST['capturado'] === 'true';

if ($capturado) {
    // Insertar si no existe
    $stmt = $conn->prepare("SELECT id FROM capturas WHERE id_usuario = ? AND id_pokemon = ? AND id_generacion = ?");
    $stmt->bind_param("iii", $id_usuario, $id_pokemon, $id_generacion);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 0) {
        $stmt = $conn->prepare("INSERT INTO capturas (id_usuario, id_pokemon, id_generacion) VALUES (?, ?, ?)");
        $stmt->bind_param("iii", $id_usuario, $id_pokemon, $id_generacion);
        $stmt->execute();
    }
} else {
    // Eliminar
    $stmt = $conn->prepare("DELETE FROM capturas WHERE id_usuario = ? AND id_pokemon = ? AND id_generacion = ?");
    $stmt->bind_param("iii", $id_usuario, $id_pokemon, $id_generacion);
    $stmt->execute();
}


// Función para obtener la generación desde la tabla `pokemons` + `generaciones`
function get_generacion_por_pokemon($conn, $id_pokemon) {
    $stmt = $conn->prepare("SELECT g.id FROM generaciones g
        JOIN pokemons p ON p.id = ?
        WHERE p.id = ?");
    $stmt->bind_param("ii", $id_pokemon, $id_pokemon);
    $stmt->execute();
    $stmt->bind_result($id_generacion);
    $stmt->fetch();
    $stmt->close();

    return $id_generacion ?? 0;
}
