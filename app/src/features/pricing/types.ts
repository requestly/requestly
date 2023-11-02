type PricingPlan = {
  plans: {
    [duration: string]: {
      usd: {
        price: number;
      };
    };
  };
};

export type PricingPlansType = {
  [plan: string]: PricingPlan;
};
