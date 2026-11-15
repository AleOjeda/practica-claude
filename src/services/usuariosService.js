// Almacenamiento en memoria (se reinicia al reiniciar el servidor)
const usuarios = new Map();
let siguienteId = 1;

const MAX_NOMBRE = 100;
const MAX_EMAIL = 254;
const MAX_DIGITOS_ID = 15; // garantiza que Number(id) sea un entero seguro

function esIdValido(id) {
  return new RegExp(`^\\d{1,${MAX_DIGITOS_ID}}$`).test(id);
}

function validarDatosUsuario(datos) {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return "El cuerpo debe ser un objeto JSON";
  }
  const { nombre, email } = datos;
  if (typeof nombre !== "string" || nombre.trim() === "") {
    return "El nombre es obligatorio";
  }
  if (nombre.trim().length > MAX_NOMBRE) {
    return `El nombre no puede superar ${MAX_NOMBRE} caracteres`;
  }
  if (typeof email !== "string") {
    return "El email no es válido";
  }
  const emailLimpio = normalizarEmail(email);
  if (
    emailLimpio.length > MAX_EMAIL ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)
  ) {
    return "El email no es válido";
  }
  return null;
}

function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

function normalizarDatos({ nombre, email }) {
  return { nombre: nombre.trim(), email: normalizarEmail(email) };
}

function existeUsuario(id) {
  return usuarios.has(Number(id));
}

function obtenerUsuarioPorId(id) {
  return usuarios.get(Number(id)) || null;
}

function crearUsuario(datos) {
  const usuario = { id: siguienteId++, ...normalizarDatos(datos) };
  usuarios.set(usuario.id, usuario);
  return usuario;
}

function actualizarUsuario(id, datos) {
  if (!existeUsuario(id)) {
    return null;
  }
  const usuario = { id: Number(id), ...normalizarDatos(datos) };
  usuarios.set(usuario.id, usuario);
  return usuario;
}

function eliminarUsuario(id) {
  return usuarios.delete(Number(id));
}

module.exports = {
  esIdValido,
  validarDatosUsuario,
  existeUsuario,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
