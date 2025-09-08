import { StoreApi, useStore } from "zustand";
import { ApiRecordsState } from "./apiRecords.store";
import { EnvironmentsState } from "../environments/environments.store";
import { ErroredRecordsState } from "../erroredRecords/erroredRecords.store";
import { useShallow } from "zustand/shallow";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";

export type AllApiClientStores = {
  records: StoreApi<ApiRecordsState>;
  environments: StoreApi<EnvironmentsState>;
  erroredRecords: StoreApi<ErroredRecordsState>;
};

export function useAPIRecords<T>(selector: (state: ApiRecordsState) => T) {
  const store = useApiClientFeatureContext().stores;
  if (!store || !store.records) {
    throw new Error("records store not found!");
  }

  return useStore(store.records, useShallow(selector));
}

export function useAPIRecordsStore() {
  const store = useApiClientFeatureContext().stores;

  if (!store || !store.records) {
    throw new Error("records store not found!");
  }

  return store.records;
}

export function useAPIEnvironment<T>(selector: (state: EnvironmentsState) => T) {
  const store = useApiClientFeatureContext().stores;

  if (!store || !store.environments) {
    throw new Error("environments store not found!");
  }

  return useStore(store.environments, useShallow(selector));
}

export function useAPIEnvironmentStore() {
  const store = useApiClientFeatureContext().stores;

  if (!store || !store.environments) {
    throw new Error("environments store not found!");
  }

  return store.environments;
}

export function useErroredRecords<T>(selector: (state: ErroredRecordsState) => T) {
  const store = useApiClientFeatureContext().stores;

  if (!store || !store.erroredRecords) {
    throw new Error("Errored records store not found!");
  }

  return useStore(store.erroredRecords, useShallow(selector));
}
