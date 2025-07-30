import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { ApiRecordsState } from "features/apiClient/store/apiRecords/apiRecords.store";
import { EnvironmentsState } from "features/apiClient/store/environments/environments.store";
import { ErroredRecordsState } from "features/apiClient/store/erroredRecords/erroredRecords.store";
import { StoreApi } from "zustand";

// stubs
export type AllApiClientStores = {
  records: StoreApi<ApiRecordsState>;
  environments: StoreApi<EnvironmentsState>;
  erroredRecords: StoreApi<ErroredRecordsState>;
};

export type ApiClientFeatureContext = {
  stores: AllApiClientStores;
  repositories: ApiClientRepositoryInterface;
};
