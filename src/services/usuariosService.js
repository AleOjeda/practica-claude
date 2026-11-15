// Almacenamiento en memoria (se reinicia al reiniciar el servidor)
const usuariosEliminados = new Set();
const usuariosActualizados = new Map();

function esIdValido(id) {
  return /^\d+$/.test(id);
}

function validarDatosUsuario(datos) {
  if (!datos || typeof datos !== "object") {
    return "El cuerpo debe ser un objeto JSON";
  }
  const { nombre, email } = datos;
  if (typeof nombre !== "string" || nombre.trim() === "") {
    return "El nombre es obligatorio";
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "El email no es válido";
  }
  return null;
}

function existeUsuario(id) {
  return !usuariosEliminados.has(Number(id));
}

function obtenerUsuarioPorId(id) {
  return (
    usuariosActualizados.get(Number(id)) || {
      id: Number(id),
      nombre: "Usuario de ejemplo",
      email: `usuario${id}@ejemplo.com`,
    }
  );
}

function actualizarUsuario(id, { nombre, email }) {
  if (!existeUsuario(id)) {
    return null;
  }
  const usuario = { id: Number(id), nombre: nombre.trim(), email };
  usuariosActualizados.set(Number(id), usuario);
  return usuario;
}

function eliminarUsuario(id) {
  if (!existeUsuario(id)) {
    return false;
  }
  usuariosEliminados.add(Number(id));
  usuariosActualizados.delete(Number(id));
  return true;
}

module.exports = {
  esIdValido,
  validarDatosUsuario,
  existeUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
};
