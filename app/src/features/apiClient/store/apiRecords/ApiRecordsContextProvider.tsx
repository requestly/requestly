import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { ApiRecordsState, createApiRecordsStore } from "./apiRecords.store";
import { useShallow } from "zustand/shallow";
import { useGetApiClientSyncRepo } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { ApiClientProvider } from "features/apiClient/contexts/apiClient";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { notification } from "antd";

export const ApiRecordsStoreContext = createContext<StoreApi<ApiRecordsState>>(null);

export const ApiRecordsProvider = ({ children }: { children: ReactNode }) => {
  const { apiClientRecordsRepository } = useGetApiClientSyncRepo();
  const [store] = useState(() => createApiRecordsStore([]));
  const user = useSelector(getUserAuthDetails);

  useEffect(() => {
    if (!user.loggedIn) {
      return;
    }

    store.getState().setIsApiClientRecordsLoading(true);
    apiClientRecordsRepository.getAllRecords().then((result) => {
      if (!result.success) {
        notification.error({
          message: "Could not fetch records!",
          description: result?.message,
          placement: "bottomRight",
        });
        store.getState().setIsApiClientRecordsLoading(false);
        return;
      }

      store.getState().refresh(result.data.records);
      store.getState().setErroredRecords(result.data.erroredRecords);
      store.getState().setIsApiClientRecordsLoading(false);
    });
  }, [apiClientRecordsRepository, store, user.loggedIn]);

  return (
    <ApiRecordsStoreContext.Provider value={store}>
      <ApiClientProvider repository={apiClientRecordsRepository}>{children}</ApiClientProvider>
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
