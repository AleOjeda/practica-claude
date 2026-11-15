const path = require("path");
const express = require("express");
const usuariosRoutes = require("./routes/usuarios");
const { log } = require("./logger");

const app = express();

app.use(express.json());

// Página HTML con el formulario de alta de usuarios (public/index.html en /)
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/salud", (req, res) => {
  res.json({ ok: true });
});

app.use("/usuarios", usuariosRoutes);

// Rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Errores no capturados (JSON mal formado, cuerpo demasiado grande, etc.)
// Express reconoce el manejador de errores por sus 4 parámetros: no quitar `next`.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "El cuerpo es demasiado grande" });
  }
  log(
    `Error no controlado en ${req.method} ${req.originalUrl}: ${err.message}`,
  );
  res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;
