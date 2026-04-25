# Tour guiado (onboarding) para TRONOSS (React)

## Objetivo
Implementar un sistema de tours guiados (onboarding/recap) para que los usuarios puedan:
1) aprender el flujo de cada sección la primera vez, y  
2) “recordar” en cualquier momento qué hace cada botón/área de una pantalla.

Alcance inicial:
- **Clientes**: explicar botones principales (Asociar cliente, Cliente, Aplicar regla, Sel. Todos, Descargar) y explicar el **grupo de acciones por cliente** (3 botones).
- **Tienda** (gym y shop): explicar **filtros** y cada tab **Productos / Órdenes / Estadísticas**.
- **Upgrade Premium (Tienda)**: explicar la vista de “Tienda no habilitada” y el flujo de upgrade.
- **Planes**: explicar “Plan Premium” y CTAs relevantes (seleccionar/upgrade/downgrade).

---

## Librería recomendada
### Recomendación: `@reactour/tour`
Motivos (enfocado a UX/UI moderna y soporte):
- Está diseñada para React y expone un `TourProvider` + hook `useTour` para control declarativo, con tipado y opciones avanzadas por step (acciones, observables de DOM, estilos, accesibilidad).  
- Permite **acciones por step** (`action` / `actionAfter`) para preparar UI (ej: cambiar de tab antes de resaltar un elemento) y soporta escenarios SPA (React Router).  
- Tiene documentación central y ejemplos (incluye “Using React Router with automatic route switching”).  

Referencias:
- NPM: https://www.npmjs.com/package/@reactour/tour  
- Docs: https://docs.react.tours  

### Alternativa: `driver.js`
Es agnóstica del framework y es muy buena para tours rápidos, pero en React termina requiriendo más “pegamento” (lifecycle/refs) y personalización manual para integrarse con estado, tabs y cambios de ruta.

Referencia:
- Docs: https://driverjs.com/docs/installation

Conclusión: para TRONOSS (React + componentes dinámicos + tabs + responsive), **@reactour/tour** encaja mejor como base.

---

## Principios UX/UI (criterios de diseño)
- **No intrusivo**: el tour NO debe impedir uso normal. Se abre solo cuando el usuario lo pide (“¿Cómo funciona?”) y opcionalmente en primer uso.
- **Recaps cortos**: 6–10 pasos por sección (evitar tours largos).
- **Accesible**: soporte teclado (ESC, ←/→), foco, labels.
- **Responsive**: mismos tours deben funcionar en desktop/móvil (usando anchors estables).
- **Anchors estables**: evitar selectores por texto/clases cambiantes. Preferir `data-tour`.

---

## Arquitectura propuesta (estructura de archivos)
Crear un módulo de tours desacoplado de las pantallas:

```
src/
  tours/
    registry.js
    TourShell.jsx
    useAppTour.js
    steps/
      clients.steps.js
      store.steps.js
      storeGym.steps.js
      plans.steps.js
```

### Responsabilidades
- `TourShell.jsx`
  - Envuelve la app con `<TourProvider />`
  - Define estilos globales del tour (popover/mask) para que coincidan con el diseño (variables CSS ya usadas en el proyecto).
  - Expone callbacks globales: `afterOpen`, `beforeClose`, etc.

- `registry.js`
  - Registro de tours por id: `clients`, `store_shop`, `store_gym`, `plans`, `store_gym_upgrade`.
  - Cada entrada define: `id`, `title`, `steps`, `route` (opcional) y `when` (condiciones).

- `useAppTour.js`
  - Hook de orquestación:
    - `startTour(tourId)`
    - `startTourForRoute(routeKey)` (opcional)
    - Persistencia “visto/no visto” (localStorage o Supabase)

---

## Instalación
### 1) Dependencia
```bash
npm i @reactour/tour
```

### 2) Envolver la app
En `src/main.jsx` (o el root donde montas `<App />`), envolver con `TourShell`:
- `<TourShell><App /></TourShell>`

Esto mantiene el provider del tour en el nivel más alto para que funcione en cualquier ruta/modal.

---

## Persistencia (para “ya lo vi” / “repetir tour”)
Recomendación por fases:

### Fase A (rápida): localStorage por usuario
- Key sugerida: `tronoss.tour.v1.{uid}.{tourId}.completed = true`
- Ventaja: simple, sin migraciones.
- Desventaja: no sincroniza entre dispositivos.

### Fase B (mejor UX): persistir en Supabase (perfil)
- Guardar un JSON `tours_completed` en el perfil del usuario.
- Ventaja: sincroniza entre dispositivos.
- Desventaja: requiere cambio de DB/migración y tipos.

En ambos casos:
- La UI debe tener un botón “¿Cómo funciona?” para relanzar el tour aunque esté “completado”.

---

## Convención de anchors (muy importante)
Agregar atributos `data-tour` en componentes clave. Ejemplo:
```jsx
<Button data-tour="clients-associate">Asociar Cliente</Button>
```

Ventajas:
- Selectores estables y legibles.
- No dependes del texto visible o clases Tailwind.

Convención:
- `data-tour="clients-*"` para Clientes
- `data-tour="store-*"` para Tienda
- `data-tour="plans-*"` para Planes

---

## Diseño de tours por sección (pasos propuestos)
Los pasos usan `StepType` de Reactour:
- `selector`: CSS selector (ej: `[data-tour="clients-associate"]`)
- `content`: texto o función (para meter títulos + acciones)
- `action`: función que se ejecuta al entrar al step (útil para cambiar tabs)

### A) Tour: Clientes (`tourId = "clients"`)
Anchors a crear:
- `[data-tour="clients-tabs"]` (contenedor de tabs)
- `[data-tour="clients-refresh"]` (botón refrescar)
- `[data-tour="clients-associate"]` (Asociar Cliente)
- `[data-tour="clients-new"]` (Cliente / añadir)
- `[data-tour="clients-rule"]` (Aplicar regla)
- `[data-tour="clients-select-all"]` (Sel. Todos)
- `[data-tour="clients-download"]` (Descargar)
- `[data-tour="clients-row-actions"]` (grupo de 3 acciones por cliente en tabla/card)

Propuesta de copy (títulos + descripción):
1. **Gestión de Clientes**
   - “Aquí administras tus clientes: creación, edición, pagos y estado.”
2. **Tabs de estado**
   - “Cambia entre Activos, Por pagar, Pago atrasado e Inactivos.”
3. **Asociar cliente**
   - “Asocia un cliente al sistema usando QR/ID para gestionarlo.”
4. **Nuevo cliente**
   - “Crea un nuevo cliente (según el límite de tu plan).”
5. **Aplicar regla**
   - “Aplica reglas (días/ajustes) a uno o varios clientes seleccionados.”
6. **Seleccionar todos**
   - “Selecciona rápidamente todos los clientes visibles para acciones masivas.”
7. **Descargar**
   - “Exporta el listado en PDF para control o reporte.”
8. **Acciones por cliente**
   - “Estas acciones te permiten: editar, eliminar y ver historial de pagos.”

Notas técnicas:
- En desktop el grupo vive dentro del `DataGrid` (renderCell). En móvil vive dentro del `MemberCard`. Ambos deben compartir el mismo `data-tour="clients-row-actions"` (idealmente en el wrapper del grupo).

### B) Tour: Tienda (cuenta shop) (`tourId = "store_shop"`)
Anchors:
- `[data-tour="store-filters-toggle"]` (solo móvil: botón mostrar/ocultar filtros)
- `[data-tour="store-filters"]` (card de filtros)
- `[data-tour="store-tabs"]` (TabsList)
- `[data-tour="store-tab-products"]` (trigger Productos)
- `[data-tour="store-tab-orders"]` (trigger Órdenes)
- `[data-tour="store-tab-stats"]` (trigger Estadísticas)
- `[data-tour="store-products-area"]` (zona tabla/listado)
- `[data-tour="store-orders-area"]`
- `[data-tour="store-stats-area"]`

Pasos sugeridos:
1. **Gestión de Tienda**
2. **Filtros**
3. **Productos**
4. **Órdenes**
5. **Estadísticas**

Notas técnicas:
- Para tabs, usar steps con `action` que setee el `tabValue` antes de intentar resaltar el contenido:
  - step “Órdenes” → `action: () => setTabValue(1)`
  - step “Estadísticas” → `action: () => setTabValue(3)`

### C) Tour: Tienda (gym) (`tourId = "store_gym"`)
Igual al de shop, pero además:
- `[data-tour="store-gym-settings"]` (Configurar Perfil)
- `[data-tour="store-gym-new-product"]` (Nuevo Producto)

### D) Tour: Upgrade Tienda (gym sin premium) (`tourId = "store_gym_upgrade"`)
Aplica cuando la tienda no está habilitada.
Anchors:
- `[data-tour="store-upsell-hero"]`
- `[data-tour="store-upsell-upgrade"]` (Upgrade a Premium)
- `[data-tour="store-upsell-whatsapp"]` (Consultar por WhatsApp)
- `[data-tour="store-upsell-benefits"]` (cards de beneficios)

Pasos sugeridos:
1. **Tienda no habilitada**
2. **Upgrade a Premium**
3. **Beneficios**
4. **Soporte por WhatsApp**

### E) Tour: Planes (`tourId = "plans"`)
Anchors:
- `[data-tour="plans-premium-card"]`
- `[data-tour="plans-premium-cta"]`
- `[data-tour="plans-standard-card"]` (opcional)

Pasos sugeridos:
1. **Planes disponibles**
2. **Plan Premium**
3. **Cómo activar / cambiar plan**

---

## UI para disparar el tour (recordatorio)
Recomendación:
- Añadir un botón visible y consistente: **“¿Cómo funciona?”** (icono + tooltip)
- Ubicación sugerida:
  - Clientes: en el header, cerca del refresh.
  - Tienda: en el header “Gestión de Tienda”.
  - Planes: header principal.

Comportamiento:
- Click → `startTour("clients")` / `startTour("store_gym")` / etc.

---

## Estilos (match con diseño actual)
Objetivo: que el popover se sienta nativo con el sistema de diseño (shadcn/tailwind).

En `TourShell.jsx` (global `styles` de Reactour):
- Fondo popover: `hsl(var(--background))`
- Texto: `hsl(var(--foreground))`
- Borde: `hsl(var(--border))`
- Sombra: similar a cards del proyecto
- Botones: usar `nextButton/prevButton` para renderizar botones con estilos equivalentes a `Button`

Opciones recomendadas:
- `scrollSmooth: true`
- `disableWhenSelectorFalsy: true` (evita tours rotos si un elemento no está en pantalla)
- `accessibilityOptions` (aria labels)

---

## Plan de implementación (paso a paso)
1) **Instalar `@reactour/tour`**.  
2) **Crear `src/tours/TourShell.jsx`** y envolver `<App />` en `main.jsx`.  
3) **Crear `registry.js`** con tours + steps iniciales.  
4) **Crear `useAppTour.js`** para:
   - setear steps según `tourId`
   - abrir/cerrar tour
   - guardar completion (localStorage fase A)
5) **Agregar `data-tour` anchors** en:
   - Clientes (`MembersList.jsx`, `TableMembersList.jsx`, `TablePendingPay.jsx`, `TablePagoRetardado.jsx`, `MembersInactive.jsx`)
   - Tienda (`StoreManagment.jsx`, `StoreManagmentGym.jsx`, `StoreFiltersCard.jsx`, `ProductsTab.jsx`, `OrdersTab.jsx`, `StoreStatsTab.jsx` / `GymStoreStatsTab.jsx`)
   - Upgrade (`GymStoreNotEnabledView.jsx`, `UpgradePremiumDialog.jsx`)
   - Planes (`Plans.jsx`)
6) **Agregar botón “¿Cómo funciona?”** por sección para relanzar el tour.  
7) **Acciones por step**: asegurar que los tabs correctos estén activos antes de resaltar contenido.  
8) **Pulir copy + estilos** (microcopy claro, corto y consistente).  
9) **QA**:
   - móvil/desktop (responsive)
   - dark/light mode
   - rutas (React Router)
   - estados vacíos (sin datos)
   - elementos condicionales (premium/standard)
10) (Opcional) **Persistencia en Supabase** para sincronizar completion entre dispositivos.

---

## Preguntas (para cerrar requisitos antes de codificar)
1) ¿Quieres que el tour se abra **automáticamente la primera vez** que el usuario entra a Clientes/Tienda/Planes, o solo con el botón “¿Cómo funciona?”?
2) ¿La preferencia “ya vi el tour” debe sincronizarse entre dispositivos (Supabase) o es suficiente localStorage?
3) ¿Los tours deben ser **idénticos** en móvil/desktop o prefieres copy/orden distintos por breakpoint?

