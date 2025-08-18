import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { ApiRecordsState, createApiRecordsStore } from "./apiRecords.store";
import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { ApiClientProvider } from "features/apiClient/contexts/apiClient";
import { notification } from "antd";
import { RQAPI } from "features/apiClient/types";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { createEnvironmentsStore, EnvironmentsState } from "../environments/environments.store";
import Daemon from "./Daemon";
import { createErroredRecordsStore, ErroredRecordsState } from "../erroredRecords/erroredRecords.store";
import { ApiClientLoadingView } from "features/apiClient/screens/apiClient/components/views/components/ApiClientLoadingView/ApiClientLoadingView";
import { ApiClientFilesProvider } from "../ApiClientFilesContextProvider";
import { useShallow } from "zustand/shallow";

export type AllApiClientStores = {
  records: StoreApi<ApiRecordsState>;
  environments: StoreApi<EnvironmentsState>;
  erroredRecords: StoreApi<ErroredRecordsState>;
};

type FetchedData<T> = { data: T; erroredRecords: ErroredRecord[] };
type FetchedStoreData = {
  records: FetchedData<RQAPI.ApiClientRecord[]>;
  environments: { global: EnvironmentData; nonGlobalEnvironments: FetchedData<EnvironmentMap> };
};
/* todo: rename both context and provider to something close to AllApiClientStores */
export const ApiRecordsStoreContext = createContext<AllApiClientStores | null>(null);
export const ApiRecordsProvider = ({ children }: { children: ReactNode }) => {
  const { apiClientRecordsRepository, environmentVariablesRepository } = useApiClientRepository();

  const [records, setRecords] = useState<FetchedStoreData["records"] | null>(null);
  const [environments, setEnvironments] = useState<FetchedStoreData["environments"] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [fetchedRecordsResult, fetchedEnvResult] = await Promise.all([
          apiClientRecordsRepository.getAllRecords(),
          environmentVariablesRepository.getAllEnvironments(),
        ]);

        if (!fetchedRecordsResult.success) {
          notification.error({
            message: "Could not fetch records!",
            description: fetchedRecordsResult.message || "Please try reloading the app", // fix-me: need good copy here
            placement: "bottomRight",
          });
        } else {
          setRecords({
            data: fetchedRecordsResult.data.records,
            erroredRecords: fetchedRecordsResult.data.erroredRecords,
          });
        }

        if (!fetchedEnvResult.success) {
          notification.error({
            message: "Could not fetch environments!",
            description: "Please try reloading the app", // fix-me: need good copy here
            placement: "bottomRight",
          });
        } else {
          const allEnvironments = fetchedEnvResult.data.environments;
          const globalEnvId = environmentVariablesRepository.getGlobalEnvironmentId();
          const { [globalEnvId]: globalEnv, ...otherEnvs } = allEnvironments;

          if (!globalEnv) throw new Error("Global Environment doesn't exist");

          setEnvironments({
            global: globalEnv,
            nonGlobalEnvironments: {
              data: otherEnvs,
              erroredRecords: fetchedEnvResult.data.erroredRecords,
            },
          });
        }
      } catch (e) {
        console.error(e);
        notification.error({
          message: "Could not fetch data!",
          description: e.message,
          placement: "bottomRight",
        });
      }
    })();
  }, [apiClientRecordsRepository, environmentVariablesRepository]);

  if (!records || !environments) return <ApiClientLoadingView />;

  return <RecordsProvider data={{ records, environments }}>{children}</RecordsProvider>;
};

type RecordsProviderProps = {
  children?: React.ReactNode;
  data: FetchedStoreData;
};
const RecordsProvider: React.FC<RecordsProviderProps> = ({ children, data: { environments, records } }) => {
  const environmentStore = createEnvironmentsStore({
    environments: environments.nonGlobalEnvironments.data,
    globalEnvironment: environments.global,
  });
  const apiRecordsStore = createApiRecordsStore({ records: records.data, erroredRecords: records.erroredRecords });
  const errorStore = createErroredRecordsStore({
    apiErroredRecords: records.erroredRecords,
    environmentErroredRecords: environments.nonGlobalEnvironments.erroredRecords,
  });
  return (
    <ApiRecordsStoreContext.Provider
      value={{
        records: apiRecordsStore,
        environments: environmentStore,
        erroredRecords: errorStore,
      }}
    >
      <Daemon />
      <ApiClientFilesProvider records={records.data}>
        <ApiClientProvider>{children}</ApiClientProvider>
      </ApiClientFilesProvider>
    </ApiRecordsStoreContext.Provider>
  );
};

export function useAPIRecords<T>(selector: (state: ApiRecordsState) => T) {
  const store = useContext(ApiRecordsStoreContext);
  if (!store || !store.records) {
    throw new Error("records store not found!");
  }

  return useStore(store.records, useShallow(selector));
}

export function useAPIRecordsStore() {
  const store = useContext(ApiRecordsStoreContext);

  if (!store || !store.records) {
    throw new Error("records store not found!");
  }

  return store.records;
}

export function useAPIEnvironment<T>(selector: (state: EnvironmentsState) => T) {
  const store = useContext(ApiRecordsStoreContext);
  if (!store || !store.environments) {
    throw new Error("environments store not found!");
  }

  return useStore(store.environments, useShallow(selector));
}

export function useAPIEnvironmentStore() {
  const store = useContext(ApiRecordsStoreContext);
  if (!store || !store.environments) {
    throw new Error("environments store not found!");
  }

  return store.environments;
}

export function useErroredRecords<T>(selector: (state: ErroredRecordsState) => T) {
  const store = useContext(ApiRecordsStoreContext);
  if (!store || !store.erroredRecords) {
    throw new Error("Errored records store not found!");
  }

  return useStore(store.erroredRecords, useShallow(selector));
}
