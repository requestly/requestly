import { apiClientFeatureContextProviderStore } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { refreshContext } from "./refreshContext.command";

export const refreshAllContexts = async () => {
  const contexts = apiClientFeatureContextProviderStore.getState().contexts;

  const promises = Array.from(contexts.values()).map(async (context) => {
    return refreshContext(context.id);
  });

  return Promise.allSettled(promises);
};
