import { GrowthBook } from "@growthbook/growthbook";
import { trackAttr, trackEvent } from "modules/analytics";
import { buildBasicUserProperties } from "modules/analytics/utils";

export const growthbook = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: process.env.VITE_GROWTHBOOK_CLIENT_KEY,
  enableDevMode: true,
  trackingCallback: (experiment, result) => {
    trackEvent("experiment_assigned", { id: experiment.key, value: result.value });
  },
  onFeatureUsage: (featureKey, result) => {
    const attrName = `x_flag_${featureKey}`;
    trackAttr(attrName, result?.value);
  },
});

export const initGrowthbook = (user, userAttributes) => {
  let id = null;
  let email = null;

  if (user) {
    const userData = buildBasicUserProperties(user);

    id = userData?.uid;
    email = userData?.email;
  }

  initGrowthbookAttributes(id, email, userAttributes);
};

// Hard Reset Growthbook Attributes.
// id & email kept here so no one can spoof if email by changing in local storage.
export const initGrowthbookAttributes = (id, email, userAttributes) => {
  const attributes = {
    ...userAttributes,
    id: id,
    email: email,
  };

  growthbook.setAttributes(attributes);
};

// Updates Growthbook attributes after every change in redux/local storage store
export const updateGrowthbookAttributes = (newAttributes = {}) => {
  const attributes = { ...growthbook.getAttributes(), ...newAttributes };
  growthbook.setAttributes(attributes);
};
