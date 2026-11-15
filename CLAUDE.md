# Proyecto de práctica: API Express

## Comandos

- Iniciar servidor: `npm start`
- Tests: `npm test`

## Convenciones

- Estructura: routes/ → controllers/ → services/
- Las rutas solo conectan URLs con controllers; la lógica va en services/
- No usar `console.log`; usar la función `log()` de `src/logger.js`
- Todas las respuestas de error devuelven `{ "error": "mensaje" }`
- Cada ruta nueva lleva un test con supertest

## No hacer

- No instalar librerías nuevas sin avisarme
