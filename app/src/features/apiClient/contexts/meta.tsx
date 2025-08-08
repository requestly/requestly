import { useContext, useMemo } from "react";
import { ApiClientRepositoryInterface } from "../helpers/modules/sync/interfaces";
import { useApiClientRepository } from "../helpers/modules/sync/useApiClientSyncRepo";
import { AllApiClientStores, ApiRecordsStoreContext } from "../store/apiRecords/ApiRecordsContextProvider";
import { NativeError } from "errors/NativeError";

export type ApiClientFeatureContext = {
  stores: AllApiClientStores;
  repositories: ApiClientRepositoryInterface;
};

export function useApiClientFeatureContext(): ApiClientFeatureContext {
  const stores = useContext(ApiRecordsStoreContext);
  if (!stores) {
    throw new NativeError("Command can't be called before stores are initialized");
  }
  const repositories = useApiClientRepository();

  return useMemo(() => {
    return { stores, repositories };
  }, [stores, repositories]);
}
