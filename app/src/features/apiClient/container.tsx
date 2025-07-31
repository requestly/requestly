import React from "react";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import { TabServiceProvider } from "componentsV2/Tabs/store/TabServiceContextProvider";
import { LocalSyncRefreshHandler } from "./LocalSyncRefreshHandler";
import "./container.scss";
import { ApiRecordsProvider } from "./store/apiRecords/ApiRecordsContextProvider";
import { ApiClientRepositoryContext, useGetApiClientSyncRepo } from "./helpers/modules/sync/useApiClientSyncRepo";

const ApiClientFeatureContainer: React.FC = () => {
  const repository = useGetApiClientSyncRepo();
  const key = repository.constructor.name;
  return (
    <TabServiceProvider>
      <ApiClientRepositoryContext.Provider value={repository} key={key}>
        <ApiRecordsProvider>
          <LocalSyncRefreshHandler />
          <div className="api-client-container">
            <APIClientSidebar />
            <TabsContainer />
          </div>
        </ApiRecordsProvider>
      </ApiClientRepositoryContext.Provider>
    </TabServiceProvider>
  );
};

export default ApiClientFeatureContainer;
