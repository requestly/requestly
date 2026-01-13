import { useApiClientSelector } from "../hooks/base.hooks";
import type { RQAPI } from "features/apiClient/types";
import type { RunResult } from "../common/runResults/types";
import { selectCollectionHistory } from "./selectors";

export function useCollectionHistory(collectionId: RQAPI.CollectionRecord["id"]): RunResult[] {
  return useApiClientSelector((state) => selectCollectionHistory(state, collectionId));
}
