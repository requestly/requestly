import { PricingPlansType } from "../types";

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
          price: 276,
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
};
