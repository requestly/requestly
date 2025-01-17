import httpRulesBundle from "../assets/http-rules-bundle.svg";
import apiClientIcon from "../assets/api-client.svg";
import activeTick from "../assets/active-product-tick.svg";
import { PRICING } from "./pricing";

export const PRODUCT_FEATURES = [
  {
    key: PRICING.PRODUCTS.HTTP_RULES,
    title: "HTTP Rules + API client",
    description: "Intercept and modify HTTP requests while testing APIs effortlessly.",
    icon: httpRulesBundle,
    activeIcon: activeTick,
  },
  {
    key: PRICING.PRODUCTS.API_CLIENT,
    title: "API client only",
    description: "Open-source, feature-rich tool for API testing and contract creation.",
    icon: apiClientIcon,
    activeIcon: activeTick,
  },
];
