<?php
include 'session.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Pokédex</title>
  <link rel="stylesheet" href="style.css">
</head>
<body data-logged="<?= isset($_SESSION['usuario']) ? 'true' : 'false' ?>" data-usuario="<?= $_SESSION['usuario'] ?? '' ?>">

  <div id="user-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1em;">
    <h1>Pokédex</h1>
    <div>
      <?php if (isset($_SESSION['usuario'])): ?>
        <span>👤 <?= htmlspecialchars($_SESSION['usuario']) ?></span>
        <a href="dashboard.php"><button>Dashboard</button></a>
        <a href="logout.php"><button>Cerrar sesión</button></a>
      <?php else: ?>
        <a href="login.php"><button>Iniciar sesión</button></a>
        <a href="register.php"><button>Registrarse</button></a>
      <?php endif; ?>
    </div>
  </div>

  <div id="generation-buttons">
    <button data-gen="1">Generación 1</button>
    <button data-gen="2">Generación 2</button>
    <button data-gen="3">Generación 3</button>
  </div>

  <div id="pokemon-container"></div>

  <script src="script.js"></script>
</body>
</html>
