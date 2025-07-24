import { ApiRecordsState } from "features/apiClient/store/apiRecords/apiRecords.store";
import { EnvironmentsStore } from "features/apiClient/store/environments/environments.store";
import { ApiClientStoresContext } from "features/apiClient/store/APIStoresAggregator";
import { useContext } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";

export function useApiClientStores() {
  const repository = useContext(ApiClientStoresContext);
  if (!repository) {
    throw new Error("No API Client repository in context!");
  }

  return repository;
}

export function useAPIRecordsV2<T>(selector: (state: ApiRecordsState) => T) {
  const { records } = useContext(ApiClientStoresContext);
  if (!records) {
    throw new Error("records store not found!");
  }

  return useStore(records, useShallow(selector));
}

export function useAPIRecordStoreV2() {
  const { records } = useContext(ApiClientStoresContext);
  if (!records) {
    throw new Error("records store not found!");
  }

  return records;
}

export function useAPIEnvironmentV2<T>(selector: (state: EnvironmentsStore) => T) {
  const { environments } = useContext(ApiClientStoresContext);
  if (!environments) {
    throw new Error("environments store not found!");
  }

  return useStore(environments, useShallow(selector));
}

export function useAPIEnvironmentStoreV2() {
  const { environments } = useContext(ApiClientStoresContext);
  if (!environments) {
    throw new Error("environments store not found!");
  }

  return environments;
}
