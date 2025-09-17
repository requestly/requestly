import { RQBrowserstackPlanIdMap } from "./constants/pricingPlans";

export const shouldShowNewCheckoutFlow = (isBStackIntegrationEnabled: boolean, isBStackCheckoutEnabled: boolean) => {
  return isBStackIntegrationEnabled && isBStackCheckoutEnabled;
};

export const createBStackCheckoutUrl = (
  planName: string,
  quantity: number,
  isAnnual: boolean,
  sourceUrl: string = window.location.origin + "/pricing"
): string => {
  const searchParams = new URLSearchParams({
    source: sourceUrl,
    plan: RQBrowserstackPlanIdMap[planName],
    annual: isAnnual.toString(),
    quantity: quantity.toString(),
    product_type: "requestly",
  });

  return `${process.env.VITE_BROWSERSTACK_BASE_URL}/user/pricing-to-checkout?${searchParams.toString()}`;
};
