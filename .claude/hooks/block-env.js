// Lee el evento que envía Claude Code por stdin
let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  const input = JSON.parse(data);
  const file = input.tool_input?.file_path ?? "";
  if (/(^|[\\/])\.env/.test(file)) {
    console.error("Bloqueado: los archivos .env no se editan.");
    process.exit(2); // el código 2 bloquea la acción
  }
});
