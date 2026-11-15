---
name: nuevo-componente
description: Crea un componente React con tipos, estilos y tests. Úsala al agregar componentes o pantallas en la carpeta web/.
---

1. Crea la carpeta `web/src/components/<Nombre>/` con `index.tsx`, `<Nombre>.module.css` y `<Nombre>.test.tsx`.
2. Props tipadas con una interface exportada.
3. Si necesita datos del servidor, usa una función de `web/src/api/`; no hagas fetch en el componente.
4. Muestra estados de carga y de error.
5. Test con React Testing Library: render, interacción del usuario y estado de error.
6. Ejecuta `cd web && npm test` y corrige hasta que pase.
