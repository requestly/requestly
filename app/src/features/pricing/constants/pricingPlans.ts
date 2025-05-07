import { PricingPlansType } from "../types";
import { PRICING } from "./pricing";

export const PricingPlans: PricingPlansType = {
  free: {
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
  lite: {
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
  basic: {
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
  professional: {
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
  session_free: {
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
  session_professional: {
    plans: {
      monthly: {
        usd: {
          price: 10,
        },
      },
      annually: {
        usd: {
          price: 120,
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
