export const createStoreTourSteps = (ctx = {}) => {
  const setTabValue = ctx?.setTabValue;
  const openFilters = ctx?.openFilters;

  const goTab = (value) => {
    if (typeof setTabValue === "function") setTabValue(value);
  };

  const ensureFilters = () => {
    if (typeof openFilters === "function") openFilters();
  };

  return [
    {
      selector: '[data-tour="store-tabs"]',
      title: "Gestión de Tienda",
      description: "Aquí gestionas productos, órdenes y estadísticas de tu tienda.",
      action: () => {
        ensureFilters();
        goTab(0);
      },
    },
    {
      selector: '[data-tour="store-filters"]',
      title: "Filtros",
      description: "Filtra por criterios para encontrar productos u órdenes más rápido.",
      action: () => ensureFilters(),
    },
    {
      selector: '[data-tour="store-tab-products"]',
      title: "Productos",
      description: "Administra tu catálogo: crear, editar, eliminar y habilitar productos.",
      action: () => goTab(0),
    },
    {
      selector: '[data-tour="store-products-area"]',
      title: "Listado de productos",
      description: "Aquí ves los productos filtrados y puedes operar sobre cada uno.",
      action: () => goTab(0),
    },
    {
      selector: '[data-tour="store-tab-orders"]',
      title: "Órdenes",
      description: "Gestiona pedidos y cambia su estado según el flujo de entrega.",
      action: () => goTab(1),
    },
    {
      selector: '[data-tour="store-orders-area"]',
      title: "Listado de órdenes",
      description: "Consulta pedidos, detalles del cliente y cambia estados.",
      action: () => goTab(1),
    },
    {
      selector: '[data-tour="store-tab-stats"]',
      title: "Estadísticas",
      description: "Visualiza métricas y rendimiento de la tienda.",
      action: () => goTab(3),
    },
    {
      selector: '[data-tour="store-stats-area"]',
      title: "Panel de estadísticas",
      description: "Revisa gráficos y datos clave para decisiones.",
      position: "top",
      action: () => goTab(3),
    },
  ];
};
