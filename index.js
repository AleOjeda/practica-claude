const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/salud", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
