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

export const trackEnvironmentCreatedInDB = (environmentId: string, type: "global" | "non_global") => {
  trackEvent(ENVIRONMENT.ENVIRONMENT_CREATED_IN_DB, { environmentId, type });
};

export const trackEnvironmentUpdatedInDB = (environmentId: string, type: "global" | "non_global") => {
  trackEvent(ENVIRONMENT.ENVIRONMENT_UPDATED_IN_DB, { environmentId, type });
};

export const trackEnvironmentDeletedFromDB = (environmentId: string) => {
  trackEvent(ENVIRONMENT.ENVIRONMENT_DELETED_FROM_DB, { environmentId });
};

export const trackCreateEnvironmentClicked = (source: string) => {
  trackEvent(ENVIRONMENT.CREATE_ENVIRONMENT_CLICKED, { source });
};
