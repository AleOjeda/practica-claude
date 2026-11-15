const app = require("./src/app");
const { log } = require("./src/logger");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  log(`Servidor escuchando en http://localhost:${PORT}`);
});
