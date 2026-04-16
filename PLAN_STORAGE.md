# Persistencia del plan por usuario

## Problema resuelto

Se eliminó el uso de una clave global `localStorage.selectedPlanId` (compartida por todos los usuarios del navegador), que provocaba que un usuario viera el plan/estado de otro usuario en sesiones posteriores.

## Nuevo modelo

- **Clave por usuario (UUID):** `selectedPlan_<userId>`
- **Valor almacenado:** JSON con versión, `userId`, `planId`, `updatedAt`, `expiresAt`.
- **Validación de integridad:** al leer, se valida que el `userId` del registro coincida con el usuario autenticado y que no esté expirado.
- **Expiración:** por defecto 90 días (`ttlDays`). Si expira, se invalida y se elimina.

## Migración y compatibilidad

- Si existe `localStorage.selectedPlanId` (legacy) y aún no existe registro para el usuario actual, se migra automáticamente a `selectedPlan_<userId>`.
- En cambios de usuario, se limpia la key legacy para evitar contaminación.

## Almacenamiento dual y fallback

- Por defecto se usa `localStorage`.
- Si `localStorage` falla (bloqueado, cuota, etc.), se hace fallback automático a `sessionStorage`.
- El módulo soporta `preferSession` para forzar `sessionStorage` cuando se necesite comportamiento temporal.

## Integración en UI

- `Plans.jsx`: lee/escribe el plan por usuario y muestra confirmación visual al seleccionar.
- `GeneralInfo.jsx` y `ShopInfo.jsx`: usan el plan (state `planId` o el persistido por usuario) para el mensaje de WhatsApp y para derivar `ai_available_requests`.
- `StoreManagmentGym.jsx`: usa el plan persistido únicamente como atajo UI (si es estándar y no hay store en cache), pero la fuente de verdad sigue siendo `gym_info.store`.

## Archivos

- `src/utils/planStorage.js`
- `src/utils/__tests__/planStorage.test.js`

## Tests

- `npm run test`

