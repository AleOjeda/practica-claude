---
name: nuevo-endpoint
description: Crea un endpoint REST en Express siguiendo las convenciones del proyecto. Úsala cuando se pida agregar, crear o modificar un endpoint, ruta o API.
---

Sigue estos pasos en orden:

1. Crea el service en `src/services/` con la lógica de negocio.
2. Crea el controller en `src/controllers/` que llama al service y maneja errores.
3. Registra la ruta en `src/routes/` (solo conecta URL con controller).
4. Valida los parámetros de entrada; si son inválidos responde `{ "error": "mensaje" }` con status 400.
5. Escribe un test con supertest para: caso feliz, entrada inválida y recurso inexistente.
6. Ejecuta `npm test` y corrige hasta que pase.
7. Al terminar, resume en 3 líneas qué archivos creaste.
