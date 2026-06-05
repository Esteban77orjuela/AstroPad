# Bitácora de Desarrollo Ágil - AstraPad

Este documento sirve como registro (log) de las decisiones técnicas, cambios implementados y Sprints realizados, asegurando que todo el equipo (y futuros mantenedores) entienda el "por qué" detrás del código, conectando las acciones con la Idea General del producto.

---

## Sprint 1: Fundamentos de Ingeniería y Arquitectura
**Fecha de Inicio:** [Fecha Actual]
**Objetivo (Idea Particular):** Establecer las bases del ciclo de vida del software (13 fases) y preparar el entorno de desarrollo para mantener un código limpio y escalable (Fase 4).
**Conexión con Idea General:** Para construir un producto "Premium" y seguro, la base de código debe ser inmaculada. Sin una arquitectura sólida, no hay escalabilidad ni seguridad.

### Tareas Completadas:
- [x] **Visión y Fases:** Documentación de la Visión del Producto (Fase 0) y el modelo de las 13 fases en `docs/VISION_Y_FASES.md`.
- [x] **Bitácora:** Creación de este documento para seguimiento Agile.
- [x] **Clean Code (Fase 4):** Configuración de ESLint y Prettier. Scripts agregados al package.json.

### Siguientes Pasos (Pendientes):
- [ ] Ejecutar el linter para corregir deudas técnicas.

---

## Sprint 2: Clean Architecture (Fase 2)
**Fecha de Inicio:** [Fecha Actual]
**Objetivo:** Separar las responsabilidades del código para que sea escalable y mantenible.
**Conexión con Idea General:** Una base de código organizada garantiza que podamos añadir funcionalidades complejas (sincronización en la nube, IA avanzada) sin romper la app.

### Tareas Completadas:
- [x] **Dominio y Datos:** Creación de las capas lógicas, aislando la estructura (`Note`, `Category`) y las integraciones (`Firebase`, `AsyncStorage`).
- [x] **Presentación:** Agrupación de pantallas, componentes visuales y contexto en la capa `presentation`.
- [x] **Git Base:** Realización del primer gran commit arquitectónico (`refactor: implementar Clean Architecture`).

---

## Sprint 3: Patrones de Diseño (Fase 3)
**Fecha de Inicio:** [Fecha Actual]
**Objetivo:** Separar la lógica de negocio de la interfaz gráfica implementando el patrón Container/Presenter (Custom Hooks).
**Conexión con Idea General:** Una interfaz premium como AstraPad no puede tener archivos "spaghetti" (mezcla de UI y lógica). Al separar la lógica, hacemos que la pantalla sea ligera y fácil de rediseñar.

### Tareas Completadas:
- [x] **Custom Hook (`useNoteEditor`):** Se extrajo el 100% de la lógica de negocio (guardado, AI, estados, exportación) del editor de notas.
- [x] **Refactorización de Pantalla:** `NoteEditorScreen.tsx` pasó de 476 líneas a ser un componente casi exclusivamente visual, importando el hook centralizado.
