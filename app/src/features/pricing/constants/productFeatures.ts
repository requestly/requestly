import { PRICING } from "./pricing";

export const PRODUCT_FEATURES = [
  {
    key: PRICING.PRODUCTS.HTTP_RULES,
    title: "HTTP Rules + API client",
    description: "Intercept and modify HTTP requests while testing APIs effortlessly.",
    icon: "/media/pricing/http-rules-bundle.svg",
    activeIcon: "/media/pricing/active-product-tick.svg",
  },
  {
    key: PRICING.PRODUCTS.API_CLIENT,
    title: "API client only",
    description: "Open-source, feature-rich tool for API testing and contract creation.",
    icon: "/media/pricing/api-client.svg",
    activeIcon: "/media/pricing/active-product-tick.svg",
  },
];
