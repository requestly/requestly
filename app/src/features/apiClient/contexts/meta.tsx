import { useContext } from "react";
import { ApiClientRepositoryInterface } from "../helpers/modules/sync/interfaces";
import { useApiClientRepository } from "../helpers/modules/sync/useApiClientSyncRepo";
import { AllApiClientStores, ApiRecordsStoreContext } from "../store/apiRecords/ApiRecordsContextProvider";

export type ApiClientFeatureContext = {
  stores: AllApiClientStores;
  repositories: ApiClientRepositoryInterface;
};
export function useApiClientFeatureContext() {
  const stores = useContext(ApiRecordsStoreContext);
  const repositories = useApiClientRepository();

  return { stores, repositories };
}
