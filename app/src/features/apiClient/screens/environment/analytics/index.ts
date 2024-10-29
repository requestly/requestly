import { trackEvent } from "modules/analytics";
import { ENVIRONMENT } from "./constants";
import { EnvironmentAnalyticsContext } from "../types";

export const trackAddVariableClicked = (context: EnvironmentAnalyticsContext, source: string) => {
  trackEvent(ENVIRONMENT.ADD_VARIABLE_CLICKED, { context, source });
};

export const trackVariableValueUpdated = (type: string, source: EnvironmentAnalyticsContext, count: number) => {
  trackEvent(ENVIRONMENT.VARIABLE_VALUE_UPDATED, { type, source, count });
};

export const trackVariableDeleted = () => {
  trackEvent(ENVIRONMENT.VARIABLE_DELETED);
};

export const trackEnvironmentCreated = (num_environments: number, source: string) => {
  trackEvent(ENVIRONMENT.ENVIRONMENT_CREATED, { num_environments, source });
};

export const trackEnvironmentSwitched = (num_environments: number) => {
  trackEvent(ENVIRONMENT.ENVIRONMENT_SWITCHED);
};

export const trackCreateEnvironmentClicked = (source: string) => {
  trackEvent(ENVIRONMENT.CREATE_ENVIRONMENT_CLICKED, { source });
};
