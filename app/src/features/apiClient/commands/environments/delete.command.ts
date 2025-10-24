import { getApiClientEnvironmentsStore } from "../store.utils";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export const deleteEnvironment = async (ctx: ApiClientFeatureContext, params: { environmentId: string }) => {
  const { repositories } = ctx;
  const { environmentId } = params;

  await repositories.environmentVariablesRepository.deleteEnvironment(environmentId);
  const {
    environments,
    activeEnvironment,
    delete: deleteEnvironmentFromStore,
    setActive,
  } = getApiClientEnvironmentsStore(ctx).getState();

  const newActiveEnv = (() => {
    if (activeEnvironment?.getState().id !== environmentId) {
      return activeEnvironment;
    }

    if (environments.length - 1 === 0) {
      return null;
    }

    const currentIndex = environments.findIndex((e) => e.getState().id === environmentId);
    if (currentIndex === environments.length - 1) {
      return environments[currentIndex - 1];
    }
    return environments[currentIndex + 1];
  })();

  deleteEnvironmentFromStore(environmentId);
  setActive(newActiveEnv?.getState()?.id);
};
