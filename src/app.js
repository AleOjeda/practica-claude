const express = require("express");
const usuariosRoutes = require("./routes/usuarios");

const app = express();

app.use(express.json());

app.get("/salud", (req, res) => {
  res.json({ ok: true });
});

app.use("/usuarios", usuariosRoutes);

module.exports = app;
