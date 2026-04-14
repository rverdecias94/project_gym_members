import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const TermsAndConditions = () => {
  const lastUpdated = new Intl.DateTimeFormat("es-ES").format(new Date());

  const sections = [
    {
      id: "aceptacion",
      title: "1. Aceptación de los términos",
      content: (
        <p>
          El uso de Tronoss implica tu aceptación expresa y voluntaria de los presentes Términos y Condiciones.
          Si no estás de acuerdo, no debes utilizar la plataforma.
        </p>
      ),
    },
    {
      id: "descripcion",
      title: "2. Descripción del servicio",
      content: (
        <>
          <p>
            Tronoss ofrece un sistema de gestión de miembros dirigido a gimnasios y una herramienta de gestión de
            productos para tiendas relacionadas al ámbito fitness. Las funcionalidades incluyen:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Registro y control de pagos de miembros.</li>
            <li>Estadísticas básicas (cantidad de miembros, género, etc.).</li>
            <li>Gestión de productos y ventas para tiendas y gimnasios.</li>
            <li>Envío de notificaciones externas vía WhatsApp para recordatorios o avisos.</li>
          </ul>
        </>
      ),
    },
    {
      id: "usuarios",
      title: "3. Tipos de usuarios",
      content: (
        <>
          <p>Existen tres tipos de usuarios dentro de Tronoss:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              <span className="font-semibold">Tipo Gym:</span> gimnasios que utilizan la plataforma para gestionar sus
              miembros.
            </li>
            <li>
              <span className="font-semibold">Tipo Tienda:</span> comercios que gestionan sus productos y ventas.
            </li>
            <li>
              <span className="font-semibold">Tipo Miembro:</span> usuarios registrados como miembros de un gimnasio o
              clientes de una tienda.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "registro",
      title: "4. Registro y uso de la plataforma",
      content: (
        <ul className="list-disc space-y-1 pl-5">
          <li>
            El acceso a funciones administrativas está reservado a usuarios tipo Gym y tipo Tienda, previo registro y
            aprobación.
          </li>
          <li>
            El acceso como Miembro es gratuito, pero su información es gestionada por el gimnasio o tienda
            correspondiente.
          </li>
          <li>Es responsabilidad de cada usuario proporcionar datos verídicos, actualizados y completos.</li>
        </ul>
      ),
    },
    {
      id: "pagos",
      title: "5. Costos y pagos",
      content: (
        <ul className="list-disc space-y-2 pl-5">
          <li>
            El uso de la app por parte de los usuarios tipo Miembro es completamente gratuito. No obstante, si el
            usuario asiste a un gimnasio, deberá realizar el pago correspondiente directamente a dicho gimnasio, según
            sus condiciones establecidas. Del mismo modo, cualquier compra realizada dentro de la app deberá ser
            abonada a la tienda correspondiente. En ambos casos, los pagos están sujetos a los términos y condiciones
            definidos por cada proveedor del servicio.
          </li>
          <li>
            Tronoss cobra una mensualidad a los usuarios tipo Gym y tipo Tienda por el uso de la plataforma. En caso de
            incumplimiento en el pago, la cuenta será desactivada de forma automática hasta que se regularice la
            situación y se complete el pago correspondiente.
          </li>
          <li>Los pagos deberán realizarse según las condiciones acordadas dentro de la app o por vía directa con el equipo de Tronoss.</li>
        </ul>
      ),
    },
    {
      id: "prohibiciones",
      title: "6. Uso adecuado y prohibiciones",
      content: (
        <>
          <p>Queda prohibido:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Utilizar Tronoss para fines distintos a los establecidos.</li>
            <li>Compartir datos de acceso con terceros sin autorización.</li>
            <li>Infringir normas legales o dañar el funcionamiento de la plataforma.</li>
          </ul>
        </>
      ),
    },
    {
      id: "responsabilidad",
      title: "7. Limitación de responsabilidad",
      content: (
        <>
          <p>
            Tronoss <span className="font-semibold">no se responsabiliza por la calidad de los productos o servicios ofrecidos</span> por
            gimnasios o tiendas dentro de la plataforma, ni por el cumplimiento de pagos entre las partes.
          </p>
          <p className="mt-3">
            Tampoco se responsabiliza por consecuencias relacionadas con el uso indebido de la plataforma o por
            decisiones tomadas a partir de la información gestionada.
          </p>
        </>
      ),
    },
    {
      id: "datos",
      title: "8. Protección de datos",
      content: (
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Tronoss recopila y almacena información personal de los usuarios con el único fin de facilitar la
            administración por parte de gimnasios y tiendas en caso de necesitarlos.
          </li>
          <li>No compartimos esta información con terceros.</li>
          <li>Los datos son gestionados cumpliendo con principios de confidencialidad y seguridad razonables.</li>
        </ul>
      ),
    },
    {
      id: "propiedad",
      title: "9. Propiedad intelectual",
      content: (
        <>
          <p>
            Todos los derechos de propiedad intelectual sobre la plataforma, diseño, marca <span className="font-semibold">Tronoss</span> y
            su contenido son propiedad exclusiva de sus creadores.
          </p>
          <p className="mt-3">No está permitido copiar, distribuir ni modificar ningún elemento sin autorización previa por escrito.</p>
        </>
      ),
    },
    {
      id: "suspension",
      title: "10. Suspensión y cancelación",
      content: (
        <p>
          Nos reservamos el derecho a suspender o cancelar cuentas que infrinjan estos términos, que estén inactivas o
          que presenten conductas inapropiadas.
        </p>
      ),
    },
    {
      id: "cambios",
      title: "11. Cambios en los términos",
      content: (
        <p>
          Tronoss podrá modificar estos Términos y Condiciones en cualquier momento. Te notificaremos de los cambios
          relevantes a través de la plataforma o por canales de contacto disponibles.
        </p>
      ),
    },
    {
      id: "contacto",
      title: "12. Contacto",
      content: (
        <p>
          Si tienes dudas, sugerencias o deseas reportar un uso indebido, puedes contactarnos a través de nuestro correo
          electrónico <span className="font-semibold">soporte@tronoss.com</span>.
        </p>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground main-content-lading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.20),transparent_55%),radial-gradient(circle_at_80%_20%,hsl(var(--secondary)/0.16),transparent_55%)]"
      />

      <div className="container relative py-10 sm:py-14">
        <header className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Documento legal</p>
              <h1 className="text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">
                Términos y Condiciones de Uso <span className="text-primary">– Tronoss</span>
              </h1>
              <p className="text-sm text-muted-foreground">Versión 1.0 · Última actualización: {lastUpdated}</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to="/">Volver a la landing</Link>
              </Button>
              <Button asChild className="w-full sm:w-auto">
                <Link to="/login">Entrar</Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              Bienvenido a <span className="font-semibold text-foreground">Tronoss</span>, una plataforma digital
              desarrollada con el objetivo de apoyar la gestión de gimnasios y tiendas de suplementos en Cuba. Al
              acceder o utilizar nuestra aplicación, aceptas los siguientes Términos y Condiciones. Te recomendamos
              leerlos detenidamente antes de continuar.
            </p>
          </div>
        </header>

        <div className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-sm font-semibold">Contenido</p>
              <nav className="mt-3 space-y-1 text-sm">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main className="space-y-4">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold tracking-tight text-primary sm:text-lg">{section.title}</h2>
                  <a
                    href="#"
                    className="shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    Inicio
                  </a>
                </div>
                <div className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{section.content}</div>
              </section>
            ))}

            <div className="rounded-2xl border border-border bg-card/70 p-5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm sm:p-6">
              <p>
                Si continúas usando Tronoss después de una actualización, se entiende que aceptas los cambios. Para
                consultas adicionales, escribe a <span className="font-semibold text-foreground">soporte@tronoss.com</span>.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
