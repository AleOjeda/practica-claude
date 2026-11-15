const express = require("express");
const usuariosController = require("../controllers/usuariosController");

const router = express.Router();

router.get("/", usuariosController.listarUsuarios);
router.post("/", usuariosController.crearUsuario);
router.get("/:id", usuariosController.obtenerUsuario);
router.put("/:id", usuariosController.actualizarUsuario);
router.patch("/:id", usuariosController.actualizarParcialUsuario);
router.delete("/:id", usuariosController.eliminarUsuario);

module.exports = router;
