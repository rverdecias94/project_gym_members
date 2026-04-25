export const createPlansTourSteps = () => {
  return [
    {
      selector: '[data-tour="plans-help"]',
      title: "Planes",
      description: "Aquí eliges o cambias el plan para tu negocio. Puedes volver a ver este tour cuando lo necesites.",
    },
    {
      selector: '[data-tour="plans-premium-card"]',
      title: "Plan Premium",
      description: "El plan Premium habilita más funcionalidades y la tienda para gimnasios.",
    },
    {
      selector: '[data-tour="plans-premium-cta"]',
      title: "Activar / Cambiar plan",
      description: "Usa este botón para activar Premium o cambiar tu plan según corresponda.",
    },
  ];
};

