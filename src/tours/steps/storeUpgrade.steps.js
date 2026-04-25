export const createStoreUpgradeTourSteps = () => {
  return [
    {
      selector: '[data-tour="store-upsell-hero"]',
      title: "Tienda no habilitada",
      description: "Esta sección se activa al tener Premium. Aquí verás el resumen y las opciones para habilitar la tienda.",
    },
    {
      selector: '[data-tour="store-upsell-upgrade"]',
      title: "Upgrade a Premium",
      description: "Activa Premium para habilitar la tienda y acceder a productos, órdenes y estadísticas.",
    },
    {
      selector: '[data-tour="store-upsell-benefits"]',
      title: "Beneficios",
      description: "Con Premium obtienes gestión completa de tienda y herramientas para escalar tu negocio.",
    },
    {
      selector: '[data-tour="store-upsell-whatsapp"]',
      title: "Soporte",
      description: "Si tienes dudas, puedes consultar por WhatsApp para completar la activación.",
    },
  ];
};

