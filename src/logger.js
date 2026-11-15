function log(...args) {
  const timestamp = new Date().toISOString();
  process.stdout.write(`[${timestamp}] ${args.join(" ")}\n`);
}

module.exports = { log };
