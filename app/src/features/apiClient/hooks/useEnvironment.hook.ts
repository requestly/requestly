import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useApiClientFeatureContext } from "../contexts/meta";
import { EnvironmentState } from "../store/environments/environments.store";
import { NativeError } from "errors/NativeError";

export function useEnvironment<T>(id: string, selector: (state: EnvironmentState) => T) {
  const {
    stores: { environments },
  } = useApiClientFeatureContext();

  const envState = environments.getState();
  const globalEnv = envState.globalEnvironment;
  const globalEnvState = globalEnv.getState();

  const environmentStore =
    globalEnvState.id === id
      ? globalEnv
      : environments
          .getState()
          .getAllEnvironmentStores()
          .find((e) => e.getState().id === id);

  if (!environmentStore) {
    throw new NativeError("Environment not found!").addContext({ envId: id });
  }

  const environment = useStore(environmentStore, useShallow(selector));

  return environment;
}
