import { PricingPlansType } from "../types";
import { PRICING } from "./pricing";

export const PricingPlans: PricingPlansType = {
  [PRICING.PLAN_NAMES.FREE]: {
    plans: {
      monthly: {
        usd: {
          price: 0,
        },
      },
      annually: {
        usd: {
          price: 0,
        },
      },
    },
  },
  [PRICING.PLAN_NAMES.LITE]: {
    plans: {
      monthly: {
        usd: {
          price: 8,
        },
      },
      annually: {
        usd: {
          price: 90,
        },
      },
    },
  },
  [PRICING.PLAN_NAMES.BASIC]: {
    plans: {
      monthly: {
        usd: {
          price: 19,
        },
      },
      annually: {
        usd: {
          price: 180,
        },
      },
    },
  },
  [PRICING.PLAN_NAMES.PROFESSIONAL]: {
    plans: {
      monthly: {
        usd: {
          price: 29,
        },
      },
      annually: {
        usd: {
          price: 270,
        },
      },
    },
  },
  [PRICING.PLAN_NAMES.SESSION_FREE]: {
    plans: {
      monthly: {
        usd: {
          price: 0,
        },
      },
      annually: {
        usd: {
          price: 0,
        },
      },
    },
  },
  [PRICING.PLAN_NAMES.API_CLIENT_ENTERPRISE]: {
    plans: {
      monthly: {
        usd: {
          price: 10,
        },
      },
      annually: {
        usd: {
          price: 100,
        },
      },
    },
  },
};

export const RQBrowserstackPlanIdMap: Record<string, string> = {
  [PRICING.PLAN_NAMES.LITE]: "lite",
  [PRICING.PLAN_NAMES.BASIC]: "basic",
  [PRICING.PLAN_NAMES.PROFESSIONAL]: "professional",
};
