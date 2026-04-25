export const createClientsTourSteps = (ctx = {}) => {
  const setClientsTab = ctx?.setClientsTab;

  return [
    {
      selector: '[data-tour="clients-tabs"]',
      title: "Gestión de Clientes",
      description: "Usa estas pestañas para cambiar entre clientes activos, por pagar, pago atrasado e inactivos.",
      action: () => {
        if (typeof setClientsTab === "function") setClientsTab("activos");
      },
    },
    {
      selector: '[data-tour="clients-refresh"]',
      title: "Actualizar datos",
      description: "Recarga el listado de clientes y sus estados para ver la información más reciente.",
    },
    {
      selector: '[data-tour="clients-associate"]',
      title: "Asociar cliente",
      description: "Asocia un cliente al sistema (por QR/ID) para poder gestionarlo dentro de Tronoss.",
    },
    {
      selector: '[data-tour="clients-new"]',
      title: "Crear cliente",
      description: "Crea un nuevo cliente (según el límite de tu plan).",
    },
    {
      selector: '[data-tour="clients-rule"]',
      title: "Aplicar regla",
      description: "Aplica reglas a uno o varios clientes seleccionados (acciones masivas).",
    },
    {
      selector: '[data-tour="clients-select-all"]',
      title: "Seleccionar todos",
      description: "Selecciona rápidamente todos los clientes visibles para acciones masivas.",
    },
    {
      selector: '[data-tour="clients-download"]',
      title: "Descargar",
      description: "Exporta el listado para control o reportes.",
    },
    {
      selector: '[data-tour="clients-row-actions"]',
      title: "Acciones por cliente",
      description: "Estas acciones permiten editar, eliminar y ver el historial de pagos del cliente.",
    },
  ];
};

