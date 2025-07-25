import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { ApiRecordsState, createApiRecordsStore } from "./apiRecords.store";
import { useShallow } from "zustand/shallow";
import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { ApiClientProvider } from "features/apiClient/contexts/apiClient";
import { notification } from "antd";
import { RQAPI } from "features/apiClient/types";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import { ApiClientLoadingView } from "features/apiClient/screens/apiClient/components/clientView/components/ApiClientLoadingView/ApiClientLoadingView";
import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { createEnvironmentsStore, EnvironmentsStore } from "../environments/environments.store";
import { Daemon } from "./Daemon";
import { createErroredRecordsStore, ErroredRecordsStore } from "../erroredRecords/erroredRecords.store";

type AllApiClientStores = {
  records: StoreApi<ApiRecordsState>;
  environments: StoreApi<EnvironmentsStore>;
  errorRecords: StoreApi<ErroredRecordsStore>;
};

type FetchedData<T> = { records: T; erroredRecords: ErroredRecord[] };
type FetchedStoreData = {
  records: FetchedData<RQAPI.Record[]>;
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
        const [recordsResult, envResult] = await Promise.all([
          apiClientRecordsRepository.getAllRecords(),
          environmentVariablesRepository.getAllEnvironments(),
        ]);

        if (!recordsResult.success) {
          notification.error({
            message: "Could not fetch records!",
            description: recordsResult.message || "Please try reloading the app", // fix-me: need good copy here
            placement: "bottomRight",
          });
        } else {
          setRecords(recordsResult.data);
        }

        if (!envResult.success) {
          notification.error({
            message: "Could not fetch environments!",
            description: "Please try reloading the app", // fix-me: need good copy here
            placement: "bottomRight",
          });
        } else {
          const allEnvironments = envResult.data.environments;
          const globalEnvId = environmentVariablesRepository.getGlobalEnvironmentId();
          const { [globalEnvId]: globalEnv, ...otherEnvs } = allEnvironments;

          if (!globalEnv) throw new Error("Global Environment doesn't exist");

          setEnvironments({
            global: globalEnv,
            nonGlobalEnvironments: {
              records: otherEnvs,
              erroredRecords: envResult.data.erroredRecords,
            },
          });
        }
      } catch (e) {
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
    environments: environments.nonGlobalEnvironments.records,
    global: environments.global, // note: expecting an update in the createEnvironmentsStore interface
  });
  const apiRecordsStore = createApiRecordsStore(records);
  const errorStore = createErroredRecordsStore({
    apiErroredRecords: records.erroredRecords,
    environmentErroredRecords: environments.nonGlobalEnvironments.erroredRecords,
  });
  return (
    <ApiRecordsStoreContext.Provider
      value={{
        records: apiRecordsStore,
        environments: environmentStore,
        errorRecords: errorStore,
      }}
    >
      <Daemon />
      <ApiClientProvider>{children}</ApiClientProvider>
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

export function useAPIEnvironment<T>(selector: (state: EnvironmentsStore) => T) {
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
