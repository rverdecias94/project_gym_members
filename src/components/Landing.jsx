import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BadgePercent,
  BarChart3,
  CalendarDays,
  CreditCard,
  Crown,
  Dumbbell,
  Eye,
  LayoutDashboard,
  Mail,
  Percent,
  Phone,
  Receipt,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  Trophy,
  Users,
} from "lucide-react";

function Landing() {
  useEffect(() => {
    document.title = "Gym Platform | Gestión para gimnasios";
  }, []);

  const cardInteractive =
    "landing-card relative overflow-hidden border border-white/10 bg-[#0A0A0A] elev-1 hover-elev-2 transition-all duration-300 ease-out hover:-translate-y-1";

  const iconBox =
    "absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] ring-1 ring-white/10";

  const iconClass = "h-6 w-6 text-secondary";

  const contactNameId = useId();
  const contactEmailId = useId();
  const contactSubjectId = useId();
  const contactMessageId = useId();

  const [contact, setContact] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [contactTouched, setContactTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  const contactErrors = useMemo(() => {
    const errors = {};
    const email = contact.email.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!contact.name.trim()) errors.name = "Nombre es requerido.";
    if (!email) errors.email = "Email es requerido.";
    else if (!emailOk) errors.email = "Email no es válido.";
    if (!contact.subject.trim()) errors.subject = "Asunto es requerido.";
    if (!contact.message.trim()) errors.message = "Mensaje es requerido.";

    return errors;
  }, [contact.email, contact.message, contact.name, contact.subject]);

  const contactIsValid = Object.keys(contactErrors).length === 0;

  const onContactChange = (key) => (e) => {
    const value = e.target.value;
    setContact((prev) => ({ ...prev, [key]: value }));
  };

  const onContactBlur = (key) => () => {
    setContactTouched((prev) => ({ ...prev, [key]: true }));
  };

  const onContactSubmit = (e) => {
    e.preventDefault();
    setContactTouched({ name: true, email: true, subject: true, message: true });
    if (!contactIsValid) return;

    const to = "robertoverdeciasanchez@gmail.com";
    const subject = contact.subject.trim();
    const body = [
      `Nombre: ${contact.name.trim()}`,
      `Email: ${contact.email.trim()}`,
      "",
      contact.message.trim(),
    ].join("\n");

    const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  const plans = [
    {
      id: "estandar",
      name: "Estándar",
      description:
        "Ideal para gimnasios que desean gestionar sus operaciones de forma simple y eficiente.",
      originalPrice: 15,
      currentPrice: 12,
      discount: 20,
      renewalPrice: 15,
      renewalMonth: 3,
      highlights: ["El primer mes Gratis", "El segundo mes un 20% de descuento"],
      includes: [
        "Registro de hasta 80 clientes (en promedio los gimnasios tienen 50-60 clientes)",
        "Agregar y gestionar clientes y entrenadores",
        "Función de Checking en el gym",
        "Estadísticas generales (clientes, entrenadores y relaciones)",
        "Acceso a funciones IA en app móvil (10 solicitudes)",
      ],
      accent: "primary",
      popular: false,
    },
    {
      id: "tienda-fitness",
      name: "Tienda Fitness",
      description: "Diseñado para tiendas que quieren escalar y vender más fácil.",
      originalPrice: 15,
      currentPrice: 12,
      discount: 20,
      renewalPrice: 15,
      renewalMonth: 3,
      highlights: ["El primer mes Gratis", "El segundo mes un 20% de descuento"],
      includes: [
        "Visibilidad directa en la comunidad fitness",
        "Agregar productos y catálogo",
        "Gestión de pedidos y estados",
        "Promociones y descuentos",
        "Posicionamiento como líder del mercado fitness",
      ],
      accent: "secondary",
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      description:
        "Para negocios que combinan gimnasio y tienda con estadísticas y alcance ampliado.",
      originalPrice: 28,
      currentPrice: 19.6,
      discount: 30,
      renewalPrice: 28,
      renewalMonth: 4,
      highlights: [
        "El primer mes Gratis",
        "El segundo y tercer mes un 30% de descuento",
      ],
      includes: [
        "Todas las funciones del plan Estándar y Tienda",
        "Registro ilimitado de clientes",
        "Los clientes del gimnasio tendrán acceso a funciones IA en su aplicación de Tronoss para temas fitness (40 solicitudes)",
        "Estadísticas de negocio y estratégicas (retención, ingresos proyectados, rango de edad, pagos y tendencias.)",
        "Catálogo de productos",
        "Gestión de pedidos"
      ],
      accent: "complementary",
      popular: true,
    },
  ];

  return (
    <div className="landing min-h-screen bg-black text-white main-content-lading">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-black focus:px-4 focus:py-2 focus:text-white focus:shadow"
      >
        Saltar al contenido principal
      </a>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="leading-tight">
              <img
                src="/logo_platform.webp"
                alt="Tronoss"
                width={80}
                height={80}
                className="h-35 w-35 object-contain"
                decoding="async"
              />
              <p className="text-xs text-white/70">
                Gestión simple para tu negocio
              </p>
            </div>
          </div>

          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-6 md:flex"
          >
            <a href="#caracteristicas" className="text-sm text-white/70 hover:text-white">
              Características
            </a>
            <a href="#planes" className="text-sm text-white/70 hover:text-white">
              Planes
            </a>
            <a href="#beneficios" className="text-sm text-white/70 hover:text-white">
              Beneficios
            </a>
            <a href="#acceso" className="text-sm text-white/70 hover:text-white">
              Acceso
            </a>
            <a href="#contacto" className="text-sm text-white/70 hover:text-white">
              Contacto
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="hidden border-white/20 bg-white/0 text-white hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-white/0 text-white hover:bg-white/10 hover:text-white sm:hidden"
            >
              <Link to="/login">Acceder</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="relative py-16 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(97,87,214,0.38),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(228,156,16,0.16),transparent_55%)]"
          />
          <div className="container relative">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="space-y-6">
                <h1 className="title-left text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                  La plataforma completa para{" "}
                  <span className="text-secondary font-extrabold">gestionar tu negocio</span>
                </h1>

                <p className="text-pretty text-base text-white/70 sm:text-lg">
                  Una aplicación enfocada en reducir tareas manuales y centralizar la
                  operación diaria. Accede con seguridad, administra tu información y
                  mantén visibilidad de tu negocio.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
                    <Link to="/login">Entrar al sistema</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/0 text-white hover:bg-white/10 hover:text-white"
                  >
                    <a href="#caracteristicas">Ver características</a>
                  </Button>
                </div>

                <p className="text-xs text-white/60">
                  Al iniciar sesión o registrarte, aceptas los{" "}
                  <Link to="/terms-conditions" className="underline underline-offset-4 hover:text-white">
                    Términos y Condiciones
                  </Link>
                  .
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 elev-3">
                <p className="text-sm font-semibold">Panel de acceso rápido</p>
                <p className="mt-1 text-sm text-white/70">
                  Todo lo que necesitas para operar desde un solo lugar
                </p>

                <Separator className="my-6 bg-white/10" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className={cardInteractive}>
                    <CardHeader className="p-4 pt-14">
                      <div className={iconBox}>
                        <LayoutDashboard className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-base">Panel</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-white/70">
                      Métricas rápidas y acceso a módulos clave.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="p-4 pt-14">
                      <div className={iconBox}>
                        <Users className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-base">Clientes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-white/70">
                      Alta, seguimiento y control de estado.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="p-4 pt-14">
                      <div className={iconBox}>
                        <Dumbbell className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-base">Entrenadores</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-white/70">
                      Gestión de equipo y listados.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="p-4 pt-14">
                      <div className={iconBox}>
                        <ShoppingBag className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-base">Tienda</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-white/70">
                      Productos, órdenes y estados.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="caracteristicas" className="border-t border-white/10 bg-[#0A0A0A] py-16">
          <div className="container">
            <div className="max-w-full space-y-3">
              <h2 className="section-title text-gradient text-4xl font-semibold tracking-tight">
                Características principales
              </h2>
              <p className="text-white/70 text-center">
                Funcionalidades para gimnasios, tiendas y clientes finales, con un
                mismo ecosistema.
              </p>
            </div>

            <div className="mt-10 space-y-10">
              <div className="space-y-3">
                <h3 className="section-title text-secondary text-lg font-semibold tracking-tight">
                  Para gimnasios
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <Users className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Clientes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Registro, edición, control de estado y listados optimizados.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <Dumbbell className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Entrenadores</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Gestión del equipo, alta y mantenimiento desde el sistema.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <CreditCard className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Pagos y planes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Seguimiento de pagos, fechas y estado del servicio.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <CalendarDays className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Checking</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Control de asistencia y verificación en el gimnasio.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <BarChart3 className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Estadísticas</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Vista general para decisiones rápidas y seguimiento.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <ShieldCheck className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Acceso seguro</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Autenticación con Supabase y rutas protegidas.
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="section-title text-secondary text-lg font-semibold tracking-tight">
                  Para tiendas
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <Store className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Productos y catálogo</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Alta de productos, fichas y catálogo listo para vender.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <Receipt className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Órdenes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Gestión de pedidos, estados y flujo de atención.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <BadgePercent className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Descuentos</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Promociones y precios especiales para impulsar ventas.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <BarChart3 className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Estadísticas</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Vista general para decisiones rápidas y seguimiento.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <Eye className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Visibilidad</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Presencia dentro del ecosistema fitness para llegar a más clientes.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <Smartphone className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Ventas desde móvil</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Los clientes podrán comprar productos desde la app móvil.
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="section-title text-secondary text-lg font-semibold tracking-tight">
                  App móvil para clientes
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <CalendarDays className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Fechas de pago</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Ver próximas fechas, estado y recordatorios.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <Trophy className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Torneos</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Participación en torneos creados por los gimnasios.
                    </CardContent>
                  </Card>
                  <Card className={cardInteractive}>
                    <CardHeader className="pt-14">
                      <div className={iconBox}>
                        <ShoppingCart className={iconClass} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg">Compras</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white/70">
                      Comprar productos de tiendas registradas dentro del sistema.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="planes" className="border-t border-white/10 bg-black py-16">
          <div className="container">
            <div className="max-w-full space-y-3">
              <h2 className="section-title text-gradient text-4xl font-semibold tracking-tight">
                Planes
              </h2>
              <p className="text-white/70 text-center">
                Comienza con un plan que se adapte a tu negocio. Puedes ver el detalle
                completo al crearte la cuenta en{" "}
                <Link to="/login" className="underline underline-offset-4 hover:text-white">
                  Tronoss
                </Link>
                .
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={[
                    "landing-card relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] p-6",
                    "elev-1 hover-elev-2 transition-all duration-300 ease-out hover:-translate-y-1",
                    plan.popular ? "border-[#D4AF37]/40" : "",
                  ].join(" ")}
                >
                  {plan.popular && (
                    <div className="absolute right-4 top-0 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-extrabold tracking-wide text-black shadow-[0_10px_25px_rgba(212,175,55,0.35)] w-28 text-center float-right">
                      MÁS DESEADO
                    </div>
                  )}

                  <div className="relative space-y-4 pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1 pt-2">
                        <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
                        <p className="text-sm text-white/70">{plan.description}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/50 line-through">
                          ${plan.originalPrice}
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white">
                          -{plan.discount}%
                        </span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-semibold tracking-tight">
                          ${plan.currentPrice}
                        </span>
                        <span className="pb-1 text-xs text-white/60">USD</span>
                      </div>
                      <p className="text-xs text-white/60">
                        Renovación: ${plan.renewalPrice} / al {plan.renewalMonth} mes
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Promoción</p>
                      <ul className="space-y-1 text-sm text-white/70">
                        {plan.highlights.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span aria-hidden className="pt-0.5 text-emerald-400">
                              ✓
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Incluye</p>
                      <ul className="space-y-1 text-sm text-white/70">
                        {plan.includes.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span aria-hidden className="pt-0.5 text-emerald-400">
                              ✓
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium">¿Quieres más detalle?</p>
                <p className="text-sm text-white/70">
                  Consulta la página de planes para ver el desglose completo.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="w-full border-white/20 bg-white/0 text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <Link to="/planes">Ver planes</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="beneficios" className="border-t border-white/10 bg-[#0A0A0A] py-16">
          <div className="container ml-0">

            <div className="grid gap-10 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="title-left text-gradient text-4xl font-semibold tracking-tight">
                  Beneficios que impulsan tu negocio
                </h2>
                <p className="text-white/70 w-full">
                  Simplifica tu gestión diaria con una herramienta que evoluciona contigo. Recupera el control de tu tiempo y la claridad de tu negocio, permitiéndote enfocarte en lo que realmente importa: hacer crecer tu visión sin complicaciones técnicas
                </p>
                <p className="text-white/70 w-full">
                  Potencia tu operatividad con tecnología de vanguardia. Nuestra plataforma no solo centraliza tus tareas, sino que proyecta una imagen de excelencia y solidez ante tus clientes, garantizando una escalabilidad fluida y sin fricciones
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className={cardInteractive}>
                  <CardHeader className="p-4 pt-14">
                    <div className={iconBox}>
                      <Rocket className={iconClass} aria-hidden="true" />
                    </div>
                    <CardTitle className="text-base">Ahorro de tiempo</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-white/70">
                    Centraliza módulos y reduce tareas repetitivas.
                  </CardContent>
                </Card>
                <Card className={cardInteractive}>
                  <CardHeader className="p-4 pt-14">
                    <div className={iconBox}>
                      <Eye className={iconClass} aria-hidden="true" />
                    </div>
                    <CardTitle className="text-base">Visibilidad</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-white/70">
                    Panel y listados para entender el estado del negocio.
                  </CardContent>
                </Card>
                <Card className={cardInteractive}>
                  <CardHeader className="p-4 pt-14">
                    <div className={iconBox}>
                      <Smartphone className={iconClass} aria-hidden="true" />
                    </div>
                    <CardTitle className="text-base">Imagen profesional</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-white/70">
                    Interfaz moderna y consistente que transmite confianza.
                  </CardContent>
                </Card>
                <Card className={cardInteractive}>
                  <CardHeader className="p-4 pt-14">
                    <div className={iconBox}>
                      <Percent className={iconClass} aria-hidden="true" />
                    </div>
                    <CardTitle className="text-base">Escalable</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-white/70">
                    Crece sin preocupaciones: la plataforma se adapta a tu tamaño.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="acceso" className="border-t border-white/10 bg-black py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0A0A0A] p-8 elev-3">
              <h2 className="section-title text-gradient text-2xl font-semibold tracking-tight">
                Acceso al sistema
              </h2>
              <p className="mt-2 text-sm text-white/70 text-center">
                Entra a tu cuenta o crea una nueva. También puedes revisar términos
                antes de acceder.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row justify-center">
                <Button asChild size="lg" className="w-full bg-white text-black hover:bg-white/90 sm:w-auto">
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-white/20 bg-white/0 text-white hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  <Link to="/terms-conditions">Ver términos</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="border-t border-white/10 bg-[#0A0A0A] py-16">
          <div className="container">
            <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black p-8 elev-3">
                <h2 className="section-title text-gradient text-2xl font-semibold tracking-tight">
                  Contacto con el Equipo
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  Escríbenos para soporte, cambios de plan o dudas generales.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0A0A0A] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] ring-1 ring-white/10">
                      <Phone className="h-6 w-6 text-secondary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Teléfono</p>
                      <a
                        href="tel:+5356408532"
                        className="mt-1 block text-sm text-white/80 underline underline-offset-4 hover:text-white"
                      >
                        +53 56408532
                      </a>
                      <a
                        href="https://wa.me/5356408532"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block text-sm text-white/80 underline underline-offset-4 hover:text-white"
                      >
                        Abrir WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0A0A0A] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] ring-1 ring-white/10">
                      <Mail className="h-6 w-6 text-secondary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Email</p>
                      <a
                        href="mailto:robertoverdeciasanchez@gmail.com"
                        className="mt-1 block break-all text-sm text-white/80 underline underline-offset-4 hover:text-white"
                      >
                        robertoverdeciasanchez@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black p-8 elev-3">
                <h3 className="section-title text-gradient text-xl font-semibold tracking-tight">
                  Enviar mensaje
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  El envío se realiza mediante tu cliente de correo.
                </p>

                <form onSubmit={onContactSubmit} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={contactNameId} className="text-white">
                      Nombre
                    </Label>
                    <Input
                      id={contactNameId}
                      value={contact.name}
                      onChange={onContactChange("name")}
                      onBlur={onContactBlur("name")}
                      required
                      className="border-white/10 bg-[#0A0A0A] text-white placeholder:text-white/40"
                      aria-invalid={Boolean(contactTouched.name && contactErrors.name)}
                    />
                    {contactTouched.name && contactErrors.name && (
                      <p className="text-xs text-red-400">{contactErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={contactEmailId} className="text-white">
                      Email
                    </Label>
                    <Input
                      id={contactEmailId}
                      type="email"
                      value={contact.email}
                      onChange={onContactChange("email")}
                      onBlur={onContactBlur("email")}
                      required
                      className="border-white/10 bg-[#0A0A0A] text-white placeholder:text-white/40"
                      aria-invalid={Boolean(contactTouched.email && contactErrors.email)}
                    />
                    {contactTouched.email && contactErrors.email && (
                      <p className="text-xs text-red-400">{contactErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={contactSubjectId} className="text-white">
                      Asunto
                    </Label>
                    <Input
                      id={contactSubjectId}
                      value={contact.subject}
                      onChange={onContactChange("subject")}
                      onBlur={onContactBlur("subject")}
                      required
                      className="border-white/10 bg-[#0A0A0A] text-white placeholder:text-white/40"
                      aria-invalid={Boolean(contactTouched.subject && contactErrors.subject)}
                    />
                    {contactTouched.subject && contactErrors.subject && (
                      <p className="text-xs text-red-400">{contactErrors.subject}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={contactMessageId} className="text-white">
                      Mensaje
                    </Label>
                    <Textarea
                      id={contactMessageId}
                      value={contact.message}
                      onChange={onContactChange("message")}
                      onBlur={onContactBlur("message")}
                      required
                      className="border-white/10 bg-[#0A0A0A] text-white placeholder:text-white/40"
                      aria-invalid={Boolean(contactTouched.message && contactErrors.message)}
                    />
                    {contactTouched.message && contactErrors.message && (
                      <p className="text-xs text-red-400">{contactErrors.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">
                    Enviar
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="copyright" className="border-t border-white/10 bg-black py-10">
        <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">© {new Date().getFullYear()} Tronoss</p>
            <p className="text-xs text-white/60">
              Todos los derechos reservados. El contenido, diseño y funcionalidades
              están protegidos por derechos de autor.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="link" className="px-0 text-secondary">
              <Link to="/login">Acceder</Link>
            </Button>
            <Button asChild variant="link" className="px-0 text-secondary">
              <Link to="/registro">Registro</Link>
            </Button>
            <Button asChild variant="link" className="px-0 text-secondary">
              <Link to="/terms-conditions">Términos</Link>
            </Button>
            <Button asChild variant="link" className="px-0 text-secondary">
              <a href="#contacto">Contacto</a>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;

