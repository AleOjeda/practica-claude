const { test } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../src/app");

test("GET / sirve la página HTML con el formulario", async () => {
  const res = await request(app).get("/");

  assert.strictEqual(res.status, 200);
  assert.match(res.headers["content-type"], /text\/html/);
  assert.match(res.text, /<form id="formulario"/);
  assert.match(res.text, /name="nombre"/);
  assert.match(res.text, /name="email"/);
  assert.match(res.text, /fetch\("\/usuarios"/);
});
