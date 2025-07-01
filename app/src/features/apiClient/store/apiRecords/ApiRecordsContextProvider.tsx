import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { ApiRecordsState, createApiRecordsStore } from "./apiRecords.store";
import { useShallow } from "zustand/shallow";
import { useGetApiClientSyncRepo } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { ApiClientProvider } from "features/apiClient/contexts/apiClient";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { notification } from "antd";
import { RQAPI } from "features/apiClient/types";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import { ApiClientRecordsInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { ApiClientLoadingView } from "features/apiClient/screens/apiClient/components/clientView/components/ApiClientLoadingView/ApiClientLoadingView";

export const ApiRecordsStoreContext = createContext<StoreApi<ApiRecordsState>>(null);

export const ApiRecordsProvider = ({ children }: { children: ReactNode }) => {
  const { apiClientRecordsRepository } = useGetApiClientSyncRepo();
  const user = useSelector(getUserAuthDetails);
  const [data, setData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user.loggedIn) {
      return;
    }

    apiClientRecordsRepository.getAllRecords().then((result) => {
      if (!result.success) {
        notification.error({
          message: "Could not fetch records!",
          description: result?.message,
          placement: "bottomRight",
        });
        return;
      }
      setData(result.data);
      setIsLoading(false);
    });
  }, [apiClientRecordsRepository, user.loggedIn]);

  if (isLoading) return <ApiClientLoadingView />;

  return (
    <RecordsProvider data={data} repository={apiClientRecordsRepository}>
      {children}
    </RecordsProvider>
  );
};

const RecordsProvider = ({
  children,
  data,
  repository,
}: {
  children: ReactNode;
  data: { records: RQAPI.Record[]; erroredRecords: ErroredRecord[] };
  repository: ApiClientRecordsInterface<Record<string, any>>;
}) => {
  const store = useMemo(() => createApiRecordsStore(data), [data]);

  return (
    <ApiRecordsStoreContext.Provider value={store}>
      <ApiClientProvider repository={repository}>{children}</ApiClientProvider>
    </ApiRecordsStoreContext.Provider>
  );
};

export function useAPIRecords<T>(selector: (state: ApiRecordsState) => T) {
  const store = useContext(ApiRecordsStoreContext);
  if (!store) {
    throw new Error("store not found!");
  }

  return useStore(store, useShallow(selector));
}
