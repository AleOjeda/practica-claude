const usuariosService = require("../services/usuariosService");
const { log } = require("../logger");

function listarUsuarios(req, res) {
  try {
    res.json(usuariosService.listarUsuarios());
  } catch (err) {
    log(`Error al listar usuarios: ${err.message}`);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

function obtenerUsuario(req, res) {
  const { id } = req.params;

  if (!usuariosService.esIdValido(id)) {
    return res.status(400).json({ error: "El id debe ser numérico" });
  }

  const usuario = usuariosService.obtenerUsuarioPorId(id);
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.json(usuario);
}

function crearUsuario(req, res) {
  const errorValidacion = usuariosService.validarDatosUsuario(req.body);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const usuario = usuariosService.crearUsuario(req.body);
    log(`Usuario ${usuario.id} creado`);
    res.status(201).json(usuario);
  } catch (err) {
    log(`Error al crear usuario: ${err.message}`);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

function actualizarUsuario(req, res) {
  const { id } = req.params;

  if (!usuariosService.esIdValido(id)) {
    return res.status(400).json({ error: "El id debe ser numérico" });
  }

  const errorValidacion = usuariosService.validarDatosUsuario(req.body);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const usuario = usuariosService.actualizarUsuario(id, req.body);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    log(`Usuario ${id} actualizado`);
    res.json(usuario);
  } catch (err) {
    log(`Error al actualizar usuario ${id}: ${err.message}`);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

function actualizarParcialUsuario(req, res) {
  const { id } = req.params;

  if (!usuariosService.esIdValido(id)) {
    return res.status(400).json({ error: "El id debe ser numérico" });
  }

  const errorValidacion = usuariosService.validarDatosParciales(req.body);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const usuario = usuariosService.actualizarParcialUsuario(id, req.body);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    log(`Usuario ${id} actualizado parcialmente`);
    res.json(usuario);
  } catch (err) {
    log(`Error al actualizar parcialmente usuario ${id}: ${err.message}`);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

function eliminarUsuario(req, res) {
  const { id } = req.params;

  if (!usuariosService.esIdValido(id)) {
    return res.status(400).json({ error: "El id debe ser numérico" });
  }

  try {
    const eliminado = usuariosService.eliminarUsuario(id);
    if (!eliminado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    log(`Usuario ${id} eliminado`);
    res.status(204).end();
  } catch (err) {
    log(`Error al eliminar usuario ${id}: ${err.message}`);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  actualizarParcialUsuario,
  eliminarUsuario,
};
