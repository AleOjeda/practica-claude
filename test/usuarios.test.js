const { test } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../src/app");

test("GET /usuarios/:id devuelve un usuario de ejemplo", async () => {
  const res = await request(app).get("/usuarios/42");

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.id, 42);
  assert.ok(res.body.nombre);
});

test("GET /usuarios/:id responde 400 si el id no es numérico", async () => {
  const res = await request(app).get("/usuarios/abc");

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El id debe ser numérico" });
});

test("DELETE /usuarios/:id elimina el usuario y responde 204", async () => {
  const res = await request(app).delete("/usuarios/7");

  assert.strictEqual(res.status, 204);
});

test("DELETE /usuarios/:id responde 400 si el id no es numérico", async () => {
  const res = await request(app).delete("/usuarios/abc");

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El id debe ser numérico" });
});

test("DELETE /usuarios/:id responde 404 si el usuario no existe", async () => {
  await request(app).delete("/usuarios/8");
  const res = await request(app).delete("/usuarios/8");

  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(res.body, { error: "Usuario no encontrado" });
});

test("PUT /usuarios/:id actualiza el usuario y responde 200", async () => {
  const datos = { nombre: "Ana", email: "ana@ejemplo.com" };
  const res = await request(app).put("/usuarios/10").send(datos);

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { id: 10, ...datos });

  const get = await request(app).get("/usuarios/10");
  assert.deepStrictEqual(get.body, { id: 10, ...datos });
});

test("PUT /usuarios/:id responde 400 si el id no es numérico", async () => {
  const res = await request(app)
    .put("/usuarios/abc")
    .send({ nombre: "Ana", email: "ana@ejemplo.com" });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El id debe ser numérico" });
});

test("PUT /usuarios/:id responde 400 si los datos son inválidos", async () => {
  const res = await request(app)
    .put("/usuarios/10")
    .send({ nombre: "", email: "no-es-email" });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El nombre es obligatorio" });
});

test("PUT /usuarios/:id responde 404 si el usuario no existe", async () => {
  await request(app).delete("/usuarios/11");
  const res = await request(app)
    .put("/usuarios/11")
    .send({ nombre: "Ana", email: "ana@ejemplo.com" });

  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(res.body, { error: "Usuario no encontrado" });
});
