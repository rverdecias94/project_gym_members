# Mejoras: Clientes (Members)

## Control de foto de perfil por plan

- La sección de foto de perfil en `MembersForm` se muestra únicamente cuando el gimnasio tiene plan premium (`gymInfo.store === true`).
- En plan estándar se oculta completamente la sección de imagen y, al guardar, `image_profile` se fuerza a `null`.

Archivos:

- `src/components/MembersForm.jsx`

## Bug: loading al eliminar el último activo

- Se corrigió la actualización del estado de clientes al refrescar desde Supabase: ahora la lista se actualiza también cuando la consulta retorna `[]`, evitando que la UI quede con datos antiguos al borrar el último miembro.

Archivos:

- `src/context/Context.jsx`

## Badges con contadores en tabs

- Se añadieron badges con el número exacto de elementos en los tabs `Por pagar`, `Pago atrasado` e `Inactivos`.
- Colores: primario en modo claro y amarillo en modo dark.

Archivos:

- `src/components/MembersList.jsx`

## Pruebas

- Se incorporó Vitest + Testing Library.

Comandos:

- `npm run test`
- `npm run test:watch`

Casos cubiertos:

- Premium vs estándar para foto de perfil (render y payload `image_profile`).
- Contadores en tabs.
- `getMembers` actualiza `membersList` correctamente cuando Supabase devuelve lista vacía.

