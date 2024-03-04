export type PlanFeatures = {
  [key: string]: {
    [plan: string]: {
      planTitle: string;
      heading?: string;
      planDescription?: string;
      features: {
        title: string;
        enabled: boolean;
        tooltip?: string;
        visibleInPricingPageOnly?: boolean;
      }[];
    };
  };
};
