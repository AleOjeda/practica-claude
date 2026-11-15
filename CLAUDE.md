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

## Front (carpeta web/)

- React + TypeScript con Vite. Iniciar: `cd web && npm run dev` (puerto 5173)
- Tests: `cd web && npm test` (Vitest + React Testing Library)
- Componentes funcionales con hooks; sin `any`
- Llamadas a la API solo desde `web/src/api/`, nunca `fetch` dentro de componentes
- Cada componente tiene estados de carga y de error visibles
- Estilos con CSS Modules
