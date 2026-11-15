// Revisa cada comando de terminal antes de que Claude lo ejecute
const reglas = [
  { re: /\brm\s+-\w*(rf|fr)\w*/, motivo: "rm -rf (borrado recursivo forzado)" },
  { re: /\bgit\s+push\b.*(--force|\s-f\b)/, motivo: "git push --force" },
  {
    re: /\bgit\s+reset\s+--hard\b/,
    motivo: "git reset --hard (descarta cambios)",
  },
  // Cualquier acceso a .env, pero se permite .env.example
  {
    re: /(^|[\s"'\/\\])\.env(\.(?!example)\w+)?($|[\s"';|&>])/,
    motivo: "acceso a archivos .env",
  },
];

let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  const comando = JSON.parse(data).tool_input?.command ?? "";
  for (const { re, motivo } of reglas) {
    if (re.test(comando)) {
      console.error(
        `Bloqueado por política del proyecto: ${motivo}. Pide confirmación al usuario o usa una alternativa más segura.`,
      );
      process.exit(2); // el código 2 bloquea
    }
  }
});
