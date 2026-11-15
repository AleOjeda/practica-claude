---
name: feature
description: Flujo completo para desarrollar una funcionalidad nueva de la API - implementa, revisa con un revisor independiente, corrige y prueba. Úsala cuando se pida desarrollar una funcionalidad completa.
---

Sigue este flujo en orden, sin saltarte pasos:

1. **Implementa** la funcionalidad siguiendo CLAUDE.md. Si hay trabajo en el back, usa la skill `nuevo-endpoint`; si hay trabajo en el front, usa la skill `nuevo-componente`.
2. **Revisa**: llama al subagente `code-reviewer` y espera su informe.
3. **Corrige** los problemas relevantes que reportó. Máximo 2 rondas de revisión; si después de la segunda quedan observaciones, déjalas listadas en el resumen final.
4. **Prueba**: llama al subagente `test-writer`.
5. Si los tests revelan un bug, corrígelo y vuelve a correr `npm test`.
6. **Informe final** (máximo 8 líneas): qué se implementó, qué encontró el revisor, qué se corrigió, resultado de los tests y pendientes.
