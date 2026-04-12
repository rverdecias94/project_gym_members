# Landing Page (Ruta `/`) — Gym Platform

Este documento describe la landing page pública integrada al proyecto para:

- Presentar la aplicación antes del acceso al sistema.
- Incluir aviso de copyright (protección legal/visual previo al acceso).
- Proveer múltiples puntos de acceso al sistema (login/registro) distribuidos en secciones.
- Mantener consistencia visual con el diseño existente (Tailwind + variables CSS + shadcn/ui).

## Integración en el proyecto

### Rutas públicas

- `/` → Landing (presentación)
- `/login` → Login actual (acceso con flujo existente)
- `/registro` → Registro público (email + password con Supabase)
- `/terms-conditions` → Términos y condiciones

### Rutas protegidas

El sistema interno se mantiene protegido vía `ProtectedRoute` (ej. `/panel`, `/clientes`, `/entrenadores`, `/tienda`, etc.).

### Archivos involucrados

- `src/components/Landing.jsx` (landing pública)
- `src/components/Register.jsx` (registro público)
- `src/App.jsx` (rutas, `validPath`, visibilidad de navbar)
- `src/index.css` + `tailwind.config.js` (tokens/colores y dark mode)

## Objetivos de diseño

- Minimalista: jerarquía clara, poca carga visual, foco en CTA.
- Consistente: no se hardcodean colores (se usan tokens `bg-background`, `text-foreground`, `bg-primary`, etc.).
- Responsive: se adapta a mobile/tablet/desktop con breakpoints estándar (`sm`, `md`, `lg`).
- Accesible: estructura semántica, navegación por teclado, foco visible, textos legibles.
- Rápida: evita imágenes pesadas; usa assets WebP existentes cuando aporta valor.
- Tipografía: fuente moderna Geist (con fallback a sistema).
- Jerarquía visual: títulos de secciones con gradiente en el texto; hero y beneficios con alineación a la izquierda.

## Secciones y contenido

La landing está compuesta por:

1) **Header (sticky)**
   - Logo + nombre “Gym Platform”
   - Navegación por anclas (desktop): Características, Planes, Beneficios, Acceso, Copyright
   - CTA: “Iniciar sesión” + “Crear cuenta” (y “Acceder” en mobile)

2) **Hero**
   - Titular principal sobre el propósito del sistema (gestión de clientes, entrenadores, pagos y tienda)
   - Copy breve y directo
   - CTAs primarios:
     - “Entrar al sistema” → `/login`
     - “Registrarme” → `/registro`
     - “Ver características” → `#caracteristicas`
   - Enlace a términos → `/terms-conditions`

3) **Resumen rápido (bloque de tarjetas en hero)**
   - 4 tarjetas: Panel, Clientes, Entrenadores, Tienda
   - CTA secundario repetido (acceso 1 clic) a `/login` y `/registro`

4) **Características (`#caracteristicas`)**
   - Bloques por tipo de cuenta y audiencia:
     - Para gimnasios: clientes, entrenadores, pagos/planes, checking, estadísticas, acceso seguro
     - Para tiendas: productos/catálogo, órdenes, descuentos, inventario, visibilidad, ventas desde móvil
     - App móvil para clientes: fechas de pago, torneos y compras a tiendas registradas
   - CTA de acceso directo a `/login` y `/registro`

5) **Planes (`#planes`)**
   - 3 tarjetas de planes visibles para usuarios:
     - Estándar (gimnasios)
     - Tienda Fitness (tiendas)
     - Premium (gimnasio + tienda)
   - Estructura visual replicada del diseño de planes (precio, descuento, “El más deseado” en Premium, listas de incluye/promoción), sin botones de seleccionar
   - Link “Ver planes” → `/planes` para detalle completo

6) **Beneficios (`#beneficios`)**
   - Beneficios operativos: ahorro de tiempo, visibilidad, consistencia visual, escalabilidad

7) **Acceso (`#acceso`)**
   - Bloque central con explicación de accesos disponibles en la landing
   - Botones grandes:
     - Login → `/login`
     - Registro → `/registro`
     - Ver términos → `/terms-conditions`

8) **Footer / Copyright (`#copyright`)**
   - Texto “© Año Gym Platform. Todos los derechos reservados…”
   - Links rápidos (CTAs adicionales):
     - Acceder → `/login`
     - Registro → `/registro`
     - Términos → `/terms-conditions`

9) **Contacto con el Equipo (`#contacto`)**
   - Teléfono clickeable: `tel:+5356408532` y acceso a WhatsApp: `https://wa.me/5356408532`
   - Formulario (nombre, email, asunto, mensaje) con validación (requeridos + email válido)
   - Envío vía `mailto:robertoverdeciasanchez@gmail.com` (usa el cliente de correo del usuario)

## Puntos de acceso al sistema (CTAs) y ubicación exacta

| Sección | Elemento | Texto CTA | Destino |
|---|---|---:|---|
| Header | Botón (desktop) | Iniciar sesión | `/login` |
| Header | Botón (desktop) | Crear cuenta | `/registro` |
| Header | Botón (mobile) | Acceder | `/login` |
| Hero | Botón principal | Entrar al sistema | `/login` |
| Hero | Botón secundario | Registrarme | `/registro` |
| Hero (texto) | Link | Términos y Condiciones | `/terms-conditions` |
| Hero (panel derecho) | Botones | Iniciar sesión / Crear cuenta | `/login` y `/registro` |
| Características | Bloque CTA | Entrar / Registrarme | `/login` y `/registro` |
| Planes | Botón | Ver planes | `/planes` |
| Acceso | Botones grandes | Iniciar sesión / Crear cuenta / Ver términos | `/login`, `/registro`, `/terms-conditions` |
| Contacto | Enlaces | Teléfono / WhatsApp / Email | `tel:+5356408532`, `https://wa.me/5356408532`, `mailto:robertoverdeciasanchez@gmail.com` |
| Footer | Links | Acceder / Registro / Términos | `/login`, `/registro`, `/terms-conditions` |

## Estructura HTML propuesta (referencia)

La implementación real está en React, pero la estructura semántica equivalente es:

```html
<div class="min-h-screen bg-background text-foreground">
  <a href="#main">Saltar al contenido principal</a>

  <header class="sticky top-0 border-b bg-background/80 backdrop-blur">
    <div class="container h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="/logo_platform.webp" alt="Gym Platform" width="40" height="40" />
        <div>
          <p>Gym Platform</p>
          <p class="text-muted-foreground">Gestión simple para tu negocio</p>
        </div>
      </div>

      <nav aria-label="Navegación principal">
        <a href="#caracteristicas">Características</a>
        <a href="#planes">Planes</a>
        <a href="#beneficios">Beneficios</a>
        <a href="#acceso">Acceso</a>
        <a href="#copyright">Copyright</a>
      </nav>

      <div>
        <a href="/login">Iniciar sesión</a>
        <a href="/registro">Crear cuenta</a>
      </div>
    </div>
  </header>

  <main id="main">
    <section>Hero + CTAs</section>
    <section id="caracteristicas">Características + CTA</section>
    <section id="planes">Planes</section>
    <section id="beneficios">Beneficios</section>
    <section id="acceso">Acceso + CTAs</section>
  </main>

  <footer id="copyright">
    <p>© Año Gym Platform. Todos los derechos reservados.</p>
    <a href="/login">Acceder</a>
    <a href="/registro">Registro</a>
    <a href="/terms-conditions">Términos</a>
  </footer>
</div>
```

## Esquema de estilos (consistencia con el proyecto)

### Principios

- Usar tokens del sistema (Tailwind + variables CSS) definidos en `src/index.css` y mapeados en `tailwind.config.js`.
- Evitar colores hex hardcodeados en la landing.
- Mantener contraste en dark mode automáticamente usando `bg-background`, `text-foreground`, `text-muted-foreground`, etc.

### Tokens (referencia rápida)

- Fondo y texto: `bg-background`, `text-foreground`
- Superficies: `bg-card`, `border-border`
- Texto secundario: `text-muted-foreground`
- CTA primario: `bg-primary text-primary-foreground`
- CTA secundario: `bg-secondary text-secondary-foreground`
- Estados/foco: `focus-visible:ring-ring`, `ring-offset-background`

### Layout responsive recomendado

- Contenedor: `container` (centrado y padding consistente).
- Grillas:
  - Hero: `lg:grid-cols-2`
  - Features / Planes: `sm:grid-cols-2 lg:grid-cols-3`
- Espaciados: `py-16 sm:py-20`, `gap-4`, `gap-10`

### Animaciones (hover)

- Tarjetas con animación sutil: `transition-all`, `hover:-translate-y-1`, `hover:shadow-md`, `hover:border-primary/40` (ajustado para mantener el estilo minimalista).

### Fondo y contraste (modo negro)

- Fondo general: negro (`#000`) con variaciones sutiles por sección (`#0A0A0A`, `#111111`) y bordes semitransparentes (`white/10`).
- Profundidad: sombras suaves y elevación (hover) para separar tarjetas del fondo sin saturar el diseño.

## Navegación

- Desktop: navegación por anclas para secciones (scroll nativo del navegador).
- Mobile: se prioriza CTA “Acceder” para reducir complejidad; el resto se encuentra por scroll.

## Accesibilidad (estándares aplicados)

- “Skip link” para saltar al contenido principal.
- Jerarquía de encabezados: `h1` (hero) → `h2` (secciones).
- `nav` con `aria-label`.
- Componentes con foco visible (shadcn/ui ya incluye `focus-visible:ring-*`).
- Imágenes con `alt` descriptivo y dimensiones explícitas (reduce CLS).

## Optimización de carga

- Uso de imágenes WebP ya existentes (`/logo_platform.webp`).
- Evitar fondos pesados; preferir superficies con `bg-muted/30` y bordes.
- Mantener la landing como componente estático (sin llamadas a API).

## Notas de comportamiento

- Usuarios autenticados que visiten `/` serán redirigidos al flujo existente (`/redirect`) según la lógica actual del `App.jsx`.
- El `Navbar` privado del sistema no se muestra en rutas públicas (`/`, `/login`, `/registro`, `/terms-conditions`) para evitar mezclar navegación interna con presentación pública.
