# Date & Time Pickers (React)

Este proyecto reemplaza los campos nativos `type="date"` por un selector moderno consistente con el diseño actual (shadcn/Radix) y con soporte de localización en español.

## Librería instalada

- Fechas: `react-day-picker` (render del calendario)
- UI: componentes shadcn/Radix ya existentes (`Popover`, `Button`, etc.)

## Componentes

### `DatePicker`

- Archivo: [date-picker.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/components/ui/date-picker.jsx)
- Usa: [calendar.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/components/ui/calendar.jsx) + `react-day-picker`
- Localización: `date-fns/locale/es`
- Formato de valor: `YYYY-MM-DD` (string)
- Soporta validación por rango:
  - `min`: `YYYY-MM-DD` o `Date`
  - `max`: `YYYY-MM-DD` o `Date`

Ejemplo:

```jsx
import { DatePicker } from "@/components/ui/date-picker";

<DatePicker
  value={form.pay_date}
  onChange={(val) => setForm(prev => ({ ...prev, pay_date: val }))}
  min="2026-01-01"
  max="2026-12-31"
/>
```

### `TimePicker`

- Archivo: [time-picker.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/components/ui/time-picker.jsx)
- Implementación: `Popover` + listas scrollables de horas (00623) y minutos (00659)
- Formato de valor: `HH:mm` (string)
- Opcional:
  - `minuteStep` (por defecto `1`)
  - `min` / `max` en `HH:mm` para restringir opciones

Ejemplo:

```jsx
import { TimePicker } from "@/components/ui/time-picker";

<TimePicker
  value={slot.start}
  onChange={(val) => updateSlot(val)}
  minuteStep={5}
/>
```

## Migración realizada

Se sustituyeron todos los `Input type="date"` y los horarios `Input type="time"` en:

- Fechas:
  - [AdminPanel.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/admin/AdminPanel.jsx)
  - [AdminRaffle.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/admin/AdminRaffle.jsx)
  - [MembersForm.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/components/MembersForm.jsx)
  - [StoreManagment.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/components/StoreManagment.jsx)
  - [StoreManagmentGym.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/components/StoreManagmentGym.jsx)
Horas:

- [GeneralInfo.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/components/GeneralInfo.jsx)
- [SettingsAccountGym.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/components/SettingsAccountGym.jsx)
- [SettingsAccountShop.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/components/SettingsAccountShop.jsx)
- [ShopInfo.jsx](file:///c:/Warehouse/PROYECTOS/Project-Supabase/Gym/src/components/ShopInfo.jsx)

## Notas de compatibilidad

- Los valores siguen siendo strings (`YYYY-MM-DD` y `HH:mm`), por lo que la lógica existente de Supabase/validaciones continúa funcionando.
- El calendario está localizado en español, incluyendo nombres de meses/días.
