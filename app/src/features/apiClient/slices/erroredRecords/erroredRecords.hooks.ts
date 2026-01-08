import { useApiClientSelector } from "../hooks/base.hooks";
import { selectApiErroredRecords, selectEnvironmentErroredRecords, selectAllErroredRecords } from "./selectors";

export function useApiErroredRecords() {
  return useApiClientSelector(selectApiErroredRecords);
}

export function useEnvironmentErroredRecords() {
  return useApiClientSelector(selectEnvironmentErroredRecords);
}

export function useAllErroredRecords() {
  return useApiClientSelector(selectAllErroredRecords);
}
