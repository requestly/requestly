import React, { createContext, ReactNode, useEffect, useMemo, useState } from "react";
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

type StorePool = {
  records: StoreApi<ApiRecordsState>;
  environments: StoreApi<EnvironmentsStore>;
};

type FetchedData<T> = { records: T; erroredRecords: ErroredRecord[] };
type FetchedStoreData = {
  records: FetchedData<RQAPI.Record[]>;
  environments: { global: EnvironmentData; nonGlobalEnvironments: FetchedData<EnvironmentMap> };
};

export const ApiClientStoresContext = createContext<StorePool>(null);

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

  const [loadingStates, setLoadingStates] = useState<{ records: boolean; variables: boolean }>({
    records: false,
    variables: false,
  });
  const isLoading = useMemo(() => {
    return loadingStates.records || loadingStates.variables;
  }, [loadingStates]);

  useEffect(() => {
    setLoadingStates((prev) => {
      return { ...prev, records: true };
    });
    apiClientRecordsRepository
      .getAllRecords()
      .then((result) => {
        if (!result.success) {
          notification.error({
            message: "Could not fetch records!",
            description: result?.message,
            placement: "bottomRight",
          });
          return;
        }
        setRecords(result.data);
      })
      .catch((e) => {
        notification.error({
          message: "Could not fetch records!",
          description: e.message,
          placement: "bottomRight",
        });
        return;
      })
      .finally(() => {
        setLoadingStates((prev) => {
          return { ...prev, records: false };
        });
      });
  }, [apiClientRecordsRepository]);

  useEffect(() => {
    setLoadingStates((prev) => {
      return { ...prev, variables: true };
    });
    environmentVariablesRepository
      .getAllEnvironments()
      .then((result) => {
        if (!result.success) {
          notification.error({
            message: "Could not fetch records!",
            description: " result?.message",
            placement: "bottomRight",
          });
          return;
        }
        const allEnvironments = result.data.environments;
        const globalEnvId = environmentVariablesRepository.getGlobalEnvironmentId();

        const { [globalEnvId]: globalEnv, ...otherEnvs } = allEnvironments;
        if (!globalEnv) throw new Error("Global Environment doesn't exist");

        setEnvironments({
          global: globalEnv,
          nonGlobalEnvironments: {
            records: otherEnvs,
            erroredRecords: result.data.erroredRecords,
          },
        });
      })
      .catch((e) => {
        notification.error({
          message: "Could not fetch records!",
          description: e.message,
        });
        return;
      })
      .finally(() => {
        setLoadingStates((prev) => {
          return { ...prev, variables: true };
        });
      });
  }, [environmentVariablesRepository]);

  if (isLoading) return <ApiClientLoadingView />; // todo: decide if we need a new loader

  return <APIStoresAssembler data={{ records, environments }}>{children}</APIStoresAssembler>;
};

export default APIStoresAggregator;
