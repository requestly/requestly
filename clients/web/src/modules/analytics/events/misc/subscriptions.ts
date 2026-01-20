import { trackEvent } from "modules/analytics";
import { SUBSCRIPTION } from "./constants";

export const trackPersonalSubscriptionInvoiceClicked = () => {
  trackEvent(SUBSCRIPTION.PERSONAL_SUBSCRIPTION_INVOICE_CLICKED);
};
