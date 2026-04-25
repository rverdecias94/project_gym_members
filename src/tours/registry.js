import { createClientsTourSteps } from "./steps/clients.steps";
import { createStoreTourSteps } from "./steps/store.steps";
import { createPlansTourSteps } from "./steps/plans.steps";
import { createStoreUpgradeTourSteps } from "./steps/storeUpgrade.steps";

export const TOUR_IDS = {
  CLIENTS: "clients",
  STORE_GYM: "store_gym",
  STORE_SHOP: "store_shop",
  STORE_GYM_UPGRADE: "store_gym_upgrade",
  PLANS: "plans",
};

export const TOURS_REGISTRY = {
  [TOUR_IDS.CLIENTS]: {
    id: TOUR_IDS.CLIENTS,
    title: "Clientes",
    createSteps: createClientsTourSteps,
  },
  [TOUR_IDS.STORE_GYM]: {
    id: TOUR_IDS.STORE_GYM,
    title: "Tienda (Gimnasio)",
    createSteps: createStoreTourSteps,
  },
  [TOUR_IDS.STORE_SHOP]: {
    id: TOUR_IDS.STORE_SHOP,
    title: "Tienda",
    createSteps: createStoreTourSteps,
  },
  [TOUR_IDS.STORE_GYM_UPGRADE]: {
    id: TOUR_IDS.STORE_GYM_UPGRADE,
    title: "Activar Tienda",
    createSteps: createStoreUpgradeTourSteps,
  },
  [TOUR_IDS.PLANS]: {
    id: TOUR_IDS.PLANS,
    title: "Planes",
    createSteps: createPlansTourSteps,
  },
};

