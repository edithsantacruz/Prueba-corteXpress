const express = require("express");
const router = express.Router();
const Cliente = require("../controllers/clientesController");
const { keycloak } = require("../config/keycloak"); // Asegúrate de importar keycloak desde el archivo de configuración de Keycloak

// Ruta pública de prueba (antes de proteger con keycloak)
router.get("/debug", (req, res) => {
    const tokenData = req.kauth?.grant?.access_token?.content;
    res.json(tokenData || { message: "No hay token en la sesión" });
  });
  
// Rutas protegidas por el rol "ver_clientes"
router.get("/", keycloak.protect(), Cliente.getClientes);
router.post("/", keycloak.protect("realm:ver_clientes"), Cliente.createCliente);
router.put("/:id", keycloak.protect("realm:ver_clientes"), Cliente.updateCliente);
router.delete("/:id", keycloak.protect("realm:ver_clientes"), Cliente.deleteCliente);

  
module.exports = router;
