# Spec — Workout Coach Refactor

**Versión:** 1.0.4  
**Fecha:** 2026-11-10  
**Estado:** En progreso (puntos 2–6 hechos; pendiente tests y entrega)  
**App:** Workout Coach (Angular 20+)

---

## 1. Contexto / problema

La aplicación base es funcional pero legacy de forma deliberada:

- Lógica de negocio, temporizador y UI concentrados en `WorkoutTimerComponent`.
- Tipado débil (`any`), estado mutable local y `setInterval` imperativo.
- Directivas estructurales clásicas (`*ngIf`), inyección por constructor.
- Un único ejercicio mock en `snake_case` consumido directamente desde presentación.
- Sin separación de capas ni contratos de dominio.

**Problema a resolver:** evolucionar la feature hacia una arquitectura sostenible (Clean Architecture + Angular moderno) **sin romper el comportamiento observable**, habilitando además una sesión multi-ejercicio con avance automático.

---

## 2. Alcance

### Dentro de alcance

| # | Entrega |
|---|---|
| SDD | Spec versionada en `docs/spec/` |
| Clean Architecture | Capas `domain` / `application` / `infrastructure` / `presentation` |
| Container / Presentational | Separación de orquestación vs UI pura (`input`/`output`, OnPush) |
| Feature multi-ejercicio | Lista de ejercicios, estados Pendiente / En curso / Completado, avance automático |
| Temporizador | Repetición → descanso → siguiente repetición / ejercicio; Iniciar / Pausar / Reiniciar |
| Angular moderno | Standalone, Signals, `inject()`, `input()`/`output()`, `@if`/`@for`, OnPush, sin `any` |
| Testing | Unitarios de dominio y casos de uso + ≥1 test presentacional |
| Extensión MFE | Sección de diseño (sin implementación obligatoria) |

### Fuera de alcance

- Autenticación, persistencia real o API remota.
- Implementación de Module/Native Federation o NgRx en código.
- i18n, PWA, diseño visual exhaustivo.
- Historial de entrenamientos, métricas o gamificación.
- Refactors ajenos a la feature `workout`.

---

## 3. Diseño propuesto

### Principios

1. **Domain-first:** reglas de transición (fase, repetición, ejercicio) viven en TypeScript puro.
2. **Inversión de dependencias:** `presentation` y `application` dependen de un puerto `WorkoutRepository`; `infrastructure` lo implementa.
3. **DTO ≠ dominio:** el contrato externo conserva `snake_case`; el mapeo ocurre solo en infrastructure.
4. **UI tonta / container inteligente:** el container orquesta casos de uso; los presentacionales no inyectan servicios.
5. **Comportamiento preservado:** mismos tiempos, controles y flujo de fases; ampliado a lista de ejercicios.

### Capas

```text
src/app/features/workout/
├─ domain/           # Modelos, puertos, reglas puras (sin Angular)
├─ application/      # Casos de uso / facade de sesión (depende de domain)
├─ infrastructure/   # DTO, mapper, repositorio mock (implementa puertos)
└─ presentation/     # Container + componentes presentacionales
```

**Reglas de dependencia:**

```text
presentation → application → domain
infrastructure → domain
presentation ↛ infrastructure   (solo vía providers / DI en root o feature)
```

---

## 4. Modelo de dominio

### Entidades / value objects

| Concepto | Descripción |
|----------|-------------|
| `Exercise` | `id`, `name`, `repetitionsNumber`, `repetitionTime`, `restTime` (camelCase) |
| `ExerciseStatus` | `'pending' \| 'in_progress' \| 'completed'` |
| `WorkoutPhase` | `'idle' \| 'exercise' \| 'rest' \| 'finished'` |
| `WorkoutSession` | Snapshot inmutable del estado de la sesión |

### Estado de sesión (`WorkoutSession`)

- `exercises: Exercise[]`
- `statuses: ExerciseStatus[]`
- `currentExerciseIndex: number`
- `completedRepetitions: number`
- `secondsRemaining: number`
- `phase: WorkoutPhase`
- `isRunning: boolean`
- `toastMessage: string`

### Reglas de transición (dominio puro)

1. Carga → todos `pending`, `phase = idle`, no corre solo.
2. **Start** (desde idle/paused) → activa el ejercicio actual (`in_progress`), fase `exercise`, cuenta `repetitionTime`.
3. Tick a 0 en `exercise` → fase `rest`, `restTime`, toast de descanso.
4. Tick a 0 en `rest` → `completedRepetitions++`, vuelve a `exercise` (o completa ejercicio).
5. Si `completedRepetitions >= repetitionsNumber` → ejercicio `completed`; si hay siguiente, lo activa; si no, `finished`.
6. **Pause** → detiene ticks, conserva progreso.
7. **Reset** → estado inicial de la lista cargada.

### Puerto

```typescript
abstract class WorkoutRepository {
  abstract getExercises(): Observable<Exercise[]>;
}
```

---

## 5. Contratos infrastructure

### DTO externo (`snake_case`)

```typescript
interface ExerciseDto {
  exercise_name: string;
  repetitions_number: number;
  repetition_time: number;
  rest_time: number;
}
```

El mock retorna `ExerciseDto[]`. El mapper produce `Exercise[]` (asignando `id` estable).

---

## 6. Application

`WorkoutSessionFacade` (o servicio de aplicación):

- Carga ejercicios vía `WorkoutRepository`.
- Expone estado con Signals.
- Delega transiciones a funciones/servicios de dominio puros.
- Gestiona el reloj (único dueño del `setInterval` / timer), **fuera del componente**.
- API: `load()`, `start()`, `pause()`, `reset()`.

---

## 7. Presentation (objetivo final)

| Componente | Rol |
|------------|-----|
| `WorkoutPageComponent` | Container: inject facade, cablea eventos |
| `WorkoutTimerComponent` | Presentational: fase, segundos, controles |
| `ExerciseListComponent` | Presentational: lista |
| `ExerciseItemComponent` | Presentational: ítem + estado |
| `WorkoutToastComponent` | Presentational: mensaje |

Todos los presentacionales: `input()` / `output()`, `ChangeDetectionStrategy.OnPush`, sin inyección de repositorio/facade.

---

## 8. Flujo de datos

```text
[Mock JSON snake_case]
        ↓
 MockWorkoutRepository (infrastructure)
        ↓ mapDto → Exercise[]
 WorkoutRepository (port)
        ↓
 WorkoutSessionFacade (application)
        ↓ domain transitions + timer
 Signals (session state)
        ↓
 WorkoutPageComponent (container)
        ↓ inputs / outputs
 Presentational components
```

---

## 9. Workstreams

| ID | Workstream | Dependencias | Estado |
|----|------------|--------------|--------|
| WS0 | Spec SDD versionada | — | Hecho (esta spec) |
| WS1 | Clean Architecture (capas + puerto + mapper + lógica fuera del UI) | WS0 | Hecho |
| WS2 | Container / Presentational | WS1 | Hecho |
| WS3 | Feature multi-ejercicio + criterios de aceptación | WS1, WS2 | Hecho |
| WS4 | Angular moderno (signals, @if/@for, OnPush, cleanup) | WS1–WS3 | Hecho |
| WS5 | Tests dominio / application / presentational | WS1–WS3 | Pendiente |
| WS6 | Sección microfrontends en spec | WS0 | Hecho (sección 11) |
| WS7 | Evidencia build/tests + entrega | WS1–WS5 | Pendiente |

---

## 10. Criterios de aceptación

### Feature (entrenamiento completo)

- [x] Al cargar, todos los ejercicios están pendientes y la sesión no inicia sola.
- [x] Iniciar activa el primer ejercicio y su `repetition_time`.
- [x] Al llegar a cero se inicia descanso con `rest_time`.
- [x] Al terminar descanso se incrementa la repetición completada.
- [x] Al completar repeticiones, el ejercicio se completa y arranca el siguiente.
- [x] Al completar el último ejercicio, el entrenamiento finaliza.
- [x] Pausar conserva progreso. Reiniciar vuelve al estado inicial.

Verificación automatizada del dominio: `npx tsx scripts/verify-acceptance.mts`.

### Arquitectura

- [x] Estructura de cuatro capas según sección 3.
- [x] `domain` sin imports de Angular (puerto con `Promise`; transiciones TypeScript puro).
- [x] Presentation no importa infrastructure.
- [x] DTO `snake_case` mapeado en infrastructure.
- [x] Lógica de temporizador/transiciones fuera del componente de UI.

### Angular moderno

- [x] Standalone components en toda la feature y `AppComponent`.
- [x] Signals + `computed()` en `WorkoutSessionFacade`; template del container signal-driven.
- [x] `inject()` (sin inyección por constructor de dependencias).
- [x] `input()` / `output()` en presentacionales.
- [x] Control flow `@if` / `@for` (sin `*ngIf` / `*ngFor`).
- [x] `ChangeDetectionStrategy.OnPush` en container, presentacionales y root.
- [x] TypeScript estricto sin `any` en la feature.
- [x] Cleanup de timer con `DestroyRef.onDestroy()` (sin fugas al destruir el facade).

### Calidad

- [x] TypeScript estricto sin `any` en la feature.
- [ ] Tests de dominio y application + ≥1 presentacional.
- [ ] `npm run build` y `npm test` en verde (evidencia en sección 12).

---

## 11. Extensión técnica — Microfrontends (diseño)

> Diseño conceptual; **no se implementa** en el código del reto.

### Shell / Host y Remotes

- **Host (Shell):** layout, routing top-level, autenticación compartida, carga de remotes.
- **Remote `workout`:** expone la feature `workout` (ruta `/workout`) como remote Federation.
- Otros remotes futuros (p. ej. `profile`, `history`) se integran igual sin acoplar dominio.

### Module / Native Federation

- Preferir **Native Federation** / `@angular-architects/native-federation` alineado con Angular 20+ y esbuild.
- El remote expone un `routes` o un bootstrap component; el host lazy-load vía `loadRemoteModule`.
- Versionado semántico del remote; contrato estable de la API pública del remote (rutas + providers mínimos).

### Shared dependencies

- Compartir singleton: `@angular/core`, `@angular/common`, `@angular/router`, `rxjs`.
- **No compartir** el dominio interno de `workout` con otros remotes (evitar acoplamiento).
- Librería compartida opcional solo para design system / tokens UI.

### Estado local vs compartido

| Estado | Dónde |
|--------|--------|
| Sesión de entrenamiento (fase, timer, reps) | **Local al remote** `workout` |
| Usuario autenticado / tema | Shell (contexto mínimo) |
| Cross-feature (p. ej. “último workout”) | Event bus / API BFF, no store global prematuro |

### Cuándo NgRx (o equivalente)

Usar store global **solo si**:

- Varios containers del remote necesitan la misma sesión con reglas complejas, o
- Hay side-effects asíncronos recurrentes (sync con backend, analytics) que justifiquen Effects.

Piezas típicas si se adoptara:

- **Store:** `WorkoutSessionState`
- **Actions:** `loadExercises`, `start`, `pause`, `reset`, `tick`
- **Reducers:** transiciones puras (o delegando al domain service)
- **Effects:** carga vía `WorkoutRepository`, scheduling del tick
- **Selectors:** ejercicio actual, estados de lista, toast, controles habilitados

Para el alcance actual del reto, el **Facade + Signals + domain puro** es suficiente y más simple.

---

## 12. Evidencia de build / tests

> Se actualizará al cerrar WS5–WS7.

```text
npm run build  → OK (2026-11-10) — bundle en dist/workout-coach
npm test       → (pendiente — WS5)
```

---

## 13. Historial de cambios de la spec

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0.0 | 2026-11-10 | Spec inicial: SDD completo + diseño Clean Architecture, feature multi-ejercicio, MFE/NgRx (diseño) |
| 1.0.1 | 2026-11-10 | WS1 aplicado: capas domain/application/infrastructure/presentation; evidencia de build OK |
| 1.0.2 | 2026-11-10 | WS2: Container WorkoutPage + presentacionales Timer/List/Item/Toast (input/output/OnPush) |
| 1.0.3 | 2026-11-10 | WS3: entrenamiento completo multi-ejercicio; criterios de aceptación verificados |
| 1.0.4 | 2026-11-10 | WS4: Angular moderno — Signals/computed, DestroyRef, OnPush root, template signal-driven |
