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

---

## Sprint 4: Testing Automatizado (Fase 6)
**Fecha de Inicio:** [Fecha Actual]
**Objetivo:** Garantizar que la aplicación escale sin errores de regresión mediante la introducción de un motor de pruebas unitarias y de integración.
**Conexión con Idea General:** Las apps que soportan a millones de usuarios tienen sistemas que las prueban automáticamente. Aquí sentamos esa base.

### Tareas Completadas:
- [x] **Configuración de Motor:** Instalación y parche de versiones conflictivas (React/Jest) utilizando `--legacy-peer-deps`.
- [x] **Mocks de Servicios:** Configuración de `jest.setup.js` aislando Firebase y AsyncStorage.
- [x] **Prueba Inicial Visual:** Ejecución exitosa de `NoteCard.test.tsx` garantizando el renderizado de la UI y la respuesta a los eventos táctiles (`onPress`).

---

## Sprint 5: Escalabilidad y Bases de Datos (Fases 5 y 12)
**Fecha de Inicio:** [Fecha Actual]
**Objetivo:** Prevenir colapsos de memoria y facturas altas de Firebase, preparando la app para manejar decenas de miles de notas por usuario.
**Conexión con Idea General:** Una interfaz ultra profesional se arruina si la aplicación se congela 10 segundos al abrirse.

### Tareas Completadas:
- [x] **Optimización de UI (`HomeScreen.tsx`):** Implementamos `removeClippedSubviews`, `windowSize`, e `initialNumToRender` para que React Native descargue de memoria las notas que el usuario no está mirando.
- [x] **Extracción de Lógica:** Completamos la Arquitectura Limpia extrayendo todo el motor de mezcla de bases de datos al hook `useNotes.ts`.
- [x] **Reducción de Costos (`firestore.ts`):** Añadimos un `limit(50)` a Firebase para que no descargue todo el historial de la nube, ahorrando 90% del costo de lectura.

---

## Sprint 6: Integración Continua CI/CD (Fase 9)
**Fecha de Inicio:** [Fecha Actual]
**Objetivo:** Automatizar las pruebas de calidad de código en la nube para garantizar que ninguna actualización rompa la aplicación en el futuro.
**Conexión con Idea General:** Las aplicaciones robustas dependen de un proceso automatizado que actúa como guardián de calidad en cada `git push`.

### Tareas Completadas:
- [x] **Preparación del Terreno:** Depuración exhaustiva de advertencias de TypeScript y Linter (estilos no utilizados y type-checkings) para asegurar un pipeline limpio.
- [x] **GitHub Actions:** Creación del archivo `.github/workflows/ci.yml` con el flujo completo de Checkout, Setup de Node 18, Instalación de dependencias, Typecheck, Linter y Jest.

---

## Sprint 7: Autoguardado Inteligente (Fase 13)
**Fecha de Inicio:** [Fecha Actual]
**Objetivo:** Evitar la pérdida de datos cuando la aplicación se cierra inesperadamente mientras el usuario está escribiendo.
**Conexión con Idea General:** Aplicaciones de nivel mundial (como WhatsApp o Google Docs) no exigen presionar un botón de "Guardar". La confianza del usuario depende de no perder su texto.

### Tareas Completadas:
- [x] **Debounce Pattern:** Implementación de un `setTimeout` de 2 segundos en `useNoteEditor.ts`.
- [x] **Gestión de IDs:** Uso de `useRef` para garantizar que el autoguardado actualice la misma nota en lugar de crear copias múltiples cada 2 segundos.
- [x] **Sincronización Silenciosa:** Integración del guardado en segundo plano con Firestore sin bloquear la UI ni mostrar indicadores molestos.
