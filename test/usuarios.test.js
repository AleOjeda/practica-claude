const { test } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../src/app");
const usuariosService = require("../src/services/usuariosService");

const ID_INEXISTENTE = 999999;

// Cada test crea sus propios usuarios para no depender del orden de ejecución.
async function crearUsuario(
  datos = { nombre: "Ana", email: "ana@ejemplo.com" },
) {
  const res = await request(app).post("/usuarios").send(datos);
  assert.strictEqual(res.status, 201);
  return res.body;
}

// --- GET ---

test("GET /usuarios lista los usuarios existentes", async () => {
  const a = await crearUsuario({
    nombre: "Lista A",
    email: "lista.a@ejemplo.com",
  });
  const b = await crearUsuario({
    nombre: "Lista B",
    email: "lista.b@ejemplo.com",
  });
  const res = await request(app).get("/usuarios");

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.deepStrictEqual(
    res.body.find((u) => u.id === a.id),
    a,
  );
  assert.deepStrictEqual(
    res.body.find((u) => u.id === b.id),
    b,
  );
});

test("GET /usuarios respeta el orden de inserción", async () => {
  const a = await crearUsuario({
    nombre: "Orden A",
    email: "orden.a@ejemplo.com",
  });
  const b = await crearUsuario({
    nombre: "Orden B",
    email: "orden.b@ejemplo.com",
  });
  const res = await request(app).get("/usuarios");

  assert.strictEqual(res.status, 200);
  const ids = res.body.map((u) => u.id);
  const posA = ids.indexOf(a.id);
  const posB = ids.indexOf(b.id);
  assert.ok(posA !== -1 && posB !== -1);
  assert.ok(posA < posB, "a debe aparecer antes que b");
});

test("GET /usuarios devuelve elementos con exactamente id, nombre y email", async () => {
  await crearUsuario({ nombre: "Claves", email: "claves@ejemplo.com" });
  const res = await request(app).get("/usuarios");

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.length > 0);
  for (const u of res.body) {
    assert.deepStrictEqual(Object.keys(u).sort(), ["email", "id", "nombre"]);
    assert.strictEqual(typeof u.id, "number");
    assert.strictEqual(typeof u.nombre, "string");
    assert.strictEqual(typeof u.email, "string");
  }
});

test("listarUsuarios devuelve copias: mutar el resultado no cambia el almacén", async () => {
  const creado = await crearUsuario({
    nombre: "Inmutable",
    email: "inmutable@ejemplo.com",
  });

  const lista = usuariosService.listarUsuarios();
  const usuario = lista.find((u) => u.id === creado.id);
  assert.ok(usuario);
  usuario.nombre = "Mutado";
  usuario.email = "mutado@ejemplo.com";
  lista.length = 0;

  const despues = usuariosService.listarUsuarios();
  assert.deepStrictEqual(
    despues.find((u) => u.id === creado.id),
    creado,
  );
  assert.deepStrictEqual(
    usuariosService.obtenerUsuarioPorId(creado.id),
    creado,
  );

  const res = await request(app).get("/usuarios");
  assert.deepStrictEqual(
    res.body.find((u) => u.id === creado.id),
    creado,
  );
});

test("GET /usuarios no incluye usuarios eliminados", async () => {
  const creado = await crearUsuario({
    nombre: "Borrado",
    email: "borrado@ejemplo.com",
  });
  await request(app).delete(`/usuarios/${creado.id}`).expect(204);
  const res = await request(app).get("/usuarios");

  assert.strictEqual(res.status, 200);
  assert.strictEqual(
    res.body.find((u) => u.id === creado.id),
    undefined,
  );
});

test("GET /usuarios ignora parámetros de query desconocidos", async () => {
  const res = await request(app).get("/usuarios?foo=bar");

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test("GET /usuarios/:id devuelve un usuario existente", async () => {
  const creado = await crearUsuario();
  const res = await request(app).get(`/usuarios/${creado.id}`);

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, creado);
});

test("GET /usuarios/:id responde 400 si el id no es numérico", async () => {
  const res = await request(app).get("/usuarios/abc");

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El id debe ser numérico" });
});

test("GET /usuarios/:id responde 400 si el id es demasiado grande", async () => {
  const res = await request(app).get("/usuarios/9007199254740993");

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El id debe ser numérico" });
});

test("GET /usuarios/:id responde 404 si el usuario no existe", async () => {
  const res = await request(app).get(`/usuarios/${ID_INEXISTENTE}`);

  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(res.body, { error: "Usuario no encontrado" });
});

// --- POST ---

test("POST /usuarios crea un usuario y responde 201", async () => {
  const datos = { nombre: "Luis", email: "luis@ejemplo.com" };
  const res = await request(app).post("/usuarios").send(datos);

  assert.strictEqual(res.status, 201);
  assert.strictEqual(typeof res.body.id, "number");
  assert.deepStrictEqual(res.body, { id: res.body.id, ...datos });

  const get = await request(app).get(`/usuarios/${res.body.id}`);
  assert.deepStrictEqual(get.body, res.body);
});

test("POST /usuarios normaliza nombre y email", async () => {
  const creado = await crearUsuario({
    nombre: "  Luis  ",
    email: "  Luis@Ejemplo.COM ",
  });

  assert.strictEqual(creado.nombre, "Luis");
  assert.strictEqual(creado.email, "luis@ejemplo.com");
});

test("POST /usuarios no pisa a un usuario ya existente", async () => {
  const primero = await crearUsuario({
    nombre: "Ana",
    email: "ana@ejemplo.com",
  });
  const segundo = await crearUsuario({
    nombre: "Luis",
    email: "luis@ejemplo.com",
  });

  assert.notStrictEqual(primero.id, segundo.id);
  const get = await request(app).get(`/usuarios/${primero.id}`);
  assert.deepStrictEqual(get.body, primero);
});

test("POST /usuarios responde 400 si falta el nombre", async () => {
  const res = await request(app)
    .post("/usuarios")
    .send({ email: "luis@ejemplo.com" });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El nombre es obligatorio" });
});

test("POST /usuarios responde 400 si el nombre es demasiado largo", async () => {
  const res = await request(app)
    .post("/usuarios")
    .send({ nombre: "a".repeat(101), email: "luis@ejemplo.com" });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, {
    error: "El nombre no puede superar 100 caracteres",
  });
});

test("POST /usuarios responde 400 si el email no es válido", async () => {
  const res = await request(app)
    .post("/usuarios")
    .send({ nombre: "Luis", email: "no-es-email" });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El email no es válido" });
});

test("POST /usuarios responde 400 si el email es demasiado largo", async () => {
  const res = await request(app)
    .post("/usuarios")
    .send({ nombre: "Luis", email: `${"a".repeat(250)}@ejemplo.com` });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El email no es válido" });
});

test("POST /usuarios responde 400 si no hay cuerpo", async () => {
  const res = await request(app).post("/usuarios");

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, {
    error: "El cuerpo debe ser un objeto JSON",
  });
});

test("POST /usuarios responde 400 en JSON si el JSON está mal formado", async () => {
  const res = await request(app)
    .post("/usuarios")
    .set("Content-Type", "application/json")
    .send('{"nombre":');

  assert.strictEqual(res.status, 400);
  assert.match(res.headers["content-type"], /application\/json/);
  assert.deepStrictEqual(res.body, { error: "JSON inválido" });
});

test("POST /usuarios responde 413 en JSON si el cuerpo es demasiado grande", async () => {
  const res = await request(app)
    .post("/usuarios")
    .send({ nombre: "a".repeat(200 * 1024), email: "luis@ejemplo.com" });

  assert.strictEqual(res.status, 413);
  assert.deepStrictEqual(res.body, { error: "El cuerpo es demasiado grande" });
});

test("POST /usuarios/:id no existe y responde 404 en JSON", async () => {
  const res = await request(app)
    .post("/usuarios/5")
    .send({ nombre: "Luis", email: "luis@ejemplo.com" });

  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(res.body, { error: "Ruta no encontrada" });
});

// --- PUT ---

test("PUT /usuarios/:id actualiza el usuario y responde 200", async () => {
  const creado = await crearUsuario();
  const datos = { nombre: "Ana María", email: "anamaria@ejemplo.com" };
  const res = await request(app).put(`/usuarios/${creado.id}`).send(datos);

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { id: creado.id, ...datos });

  const get = await request(app).get(`/usuarios/${creado.id}`);
  assert.deepStrictEqual(get.body, { id: creado.id, ...datos });
});

test("PUT /usuarios/:id responde 400 si el id no es numérico", async () => {
  const res = await request(app)
    .put("/usuarios/abc")
    .send({ nombre: "Ana", email: "ana@ejemplo.com" });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El id debe ser numérico" });
});

test("PUT /usuarios/:id responde 400 si los datos son inválidos", async () => {
  const creado = await crearUsuario();
  const res = await request(app)
    .put(`/usuarios/${creado.id}`)
    .send({ nombre: "", email: "no-es-email" });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El nombre es obligatorio" });
});

test("PUT /usuarios/:id responde 404 si el usuario no existe", async () => {
  const res = await request(app)
    .put(`/usuarios/${ID_INEXISTENTE}`)
    .send({ nombre: "Ana", email: "ana@ejemplo.com" });

  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(res.body, { error: "Usuario no encontrado" });
});

// --- PATCH ---

test("PATCH /usuarios/:id actualiza solo el nombre y conserva el email", async () => {
  const creado = await crearUsuario();
  const res = await request(app)
    .patch(`/usuarios/${creado.id}`)
    .send({ nombre: "  Ana María  " });

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, {
    id: creado.id,
    nombre: "Ana María",
    email: creado.email,
  });

  const get = await request(app).get(`/usuarios/${creado.id}`);
  assert.deepStrictEqual(get.body, res.body);
});

test("PATCH /usuarios/:id actualiza solo el email normalizado y conserva el nombre", async () => {
  const creado = await crearUsuario();
  const res = await request(app)
    .patch(`/usuarios/${creado.id}`)
    .send({ email: "  Nueva@Ejemplo.COM " });

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, {
    id: creado.id,
    nombre: creado.nombre,
    email: "nueva@ejemplo.com",
  });

  const get = await request(app).get(`/usuarios/${creado.id}`);
  assert.deepStrictEqual(get.body, res.body);
});

test("PATCH /usuarios/:id actualiza nombre y email a la vez", async () => {
  const creado = await crearUsuario();
  const datos = { nombre: "Luis", email: "luis@ejemplo.com" };
  const res = await request(app).patch(`/usuarios/${creado.id}`).send(datos);

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { id: creado.id, ...datos });

  const get = await request(app).get(`/usuarios/${creado.id}`);
  assert.deepStrictEqual(get.body, { id: creado.id, ...datos });
});

test("PATCH /usuarios/:id responde 400 si el id no es numérico", async () => {
  const res = await request(app).patch("/usuarios/abc").send({ nombre: "Ana" });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El id debe ser numérico" });
});

test("PATCH /usuarios/:id responde 400 si el cuerpo es un array", async () => {
  const creado = await crearUsuario();
  const res = await request(app)
    .patch(`/usuarios/${creado.id}`)
    .send([{ nombre: "Ana" }]);

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, {
    error: "El cuerpo debe ser un objeto JSON",
  });
});

test("PATCH /usuarios/:id responde 400 si no se envía ningún campo", async () => {
  const creado = await crearUsuario();
  const res = await request(app).patch(`/usuarios/${creado.id}`).send({});

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "Debe enviar nombre y/o email" });
});

test("PATCH /usuarios/:id responde 400 si el nombre está vacío", async () => {
  const creado = await crearUsuario();
  const res = await request(app)
    .patch(`/usuarios/${creado.id}`)
    .send({ nombre: "" });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El nombre es obligatorio" });
});

test("PATCH /usuarios/:id responde 400 si el nombre es null", async () => {
  const creado = await crearUsuario();
  const res = await request(app)
    .patch(`/usuarios/${creado.id}`)
    .send({ nombre: null });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El nombre es obligatorio" });
});

test("PATCH /usuarios/:id responde 400 si el nombre es demasiado largo", async () => {
  const creado = await crearUsuario();
  const res = await request(app)
    .patch(`/usuarios/${creado.id}`)
    .send({ nombre: "a".repeat(101) });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, {
    error: "El nombre no puede superar 100 caracteres",
  });
});

test("PATCH /usuarios/:id responde 400 si el email no es válido", async () => {
  const creado = await crearUsuario();
  const res = await request(app)
    .patch(`/usuarios/${creado.id}`)
    .send({ email: "no-es-email" });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El email no es válido" });

  const get = await request(app).get(`/usuarios/${creado.id}`);
  assert.deepStrictEqual(get.body, creado);
});

test("PATCH /usuarios/:id responde 404 si el usuario no existe", async () => {
  const res = await request(app)
    .patch(`/usuarios/${ID_INEXISTENTE}`)
    .send({ nombre: "Ana" });

  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(res.body, { error: "Usuario no encontrado" });
});

// --- DELETE ---

test("DELETE /usuarios/:id elimina el usuario y responde 204", async () => {
  const creado = await crearUsuario();
  const res = await request(app).delete(`/usuarios/${creado.id}`);

  assert.strictEqual(res.status, 204);
  const get = await request(app).get(`/usuarios/${creado.id}`);
  assert.strictEqual(get.status, 404);
});

test("DELETE /usuarios/:id responde 400 si el id no es numérico", async () => {
  const res = await request(app).delete("/usuarios/abc");

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: "El id debe ser numérico" });
});

test("DELETE /usuarios/:id responde 404 si el usuario no existe", async () => {
  const creado = await crearUsuario();
  await request(app).delete(`/usuarios/${creado.id}`);
  const res = await request(app).delete(`/usuarios/${creado.id}`);

  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(res.body, { error: "Usuario no encontrado" });
});
