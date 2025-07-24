import React, { createContext, ReactNode, useEffect, useState } from "react";
import { useApiClientRepository } from "../../helpers/modules/sync/useApiClientSyncRepo";
import { notification } from "antd";
import { ApiClientLoadingView } from "../../screens/apiClient/components/clientView/components/ApiClientLoadingView/ApiClientLoadingView";
import { RQAPI } from "../../types";
import { ErroredRecord } from "../../helpers/modules/sync/local/services/types";
import { ApiRecordsState, createApiRecordsStore } from "../apiRecords/apiRecords.store";
import { StoreApi } from "zustand";
import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientProvider } from "../../contexts";
import { Daemon } from "./Daemon";

import { createEnvironmentsStore, EnvironmentsStore } from "../environments/environments.store";

type AllApiClientStores = {
  records: StoreApi<ApiRecordsState>;
  environments: StoreApi<EnvironmentsStore>;
};

type FetchedData<T> = { records: T; erroredRecords: ErroredRecord[] };
type FetchedStoreData = {
  records: FetchedData<RQAPI.Record[]>;
  environments: { global: EnvironmentData; nonGlobalEnvironments: FetchedData<EnvironmentMap> };
};

export const ApiClientStoresContext = createContext<AllApiClientStores>(null);

type AssemblerProps = {
  children?: React.ReactNode;
  data: FetchedStoreData;
};
const APIStoresAssembler: React.FC<AssemblerProps> = ({ children, data: { environments, records } }) => {
  // todo: pass global separately
  // pass errors to error store separately
  const environmentStore = createEnvironmentsStore({
    environments: environments.nonGlobalEnvironments.records,
    erroredRecords: environments.nonGlobalEnvironments.erroredRecords,
  });
  const apiRecordsStore = createApiRecordsStore(records);

  return (
    <ApiClientStoresContext.Provider
      value={{
        records: apiRecordsStore,
        environments: environmentStore,
      }}
    >
      <Daemon />
      <ApiClientProvider>{children}</ApiClientProvider>
    </ApiClientStoresContext.Provider>
  );
};

const APIStoresAggregator: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { apiClientRecordsRepository, environmentVariablesRepository } = useApiClientRepository();

  const [records, setRecords] = useState<FetchedStoreData["records"]>(null);
  const [environments, setEnvironments] = useState<FetchedStoreData["environments"]>(null);

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

  return <APIStoresAssembler data={{ records, environments }}>{children}</APIStoresAssembler>;
};

export default APIStoresAggregator;
