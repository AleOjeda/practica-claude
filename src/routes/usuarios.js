const express = require("express");
const usuariosController = require("../controllers/usuariosController");

const router = express.Router();

router.get("/:id", usuariosController.obtenerUsuario);
router.put("/:id", usuariosController.actualizarUsuario);
router.delete("/:id", usuariosController.eliminarUsuario);

module.exports = router;
