import React from "react";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import { TabServiceProvider } from "componentsV2/Tabs/store/TabServiceContextProvider";
import { LocalSyncRefreshHandler } from "./LocalSyncRefreshHandler";
import "./container.scss";
import { ApiRecordsProvider } from "./store/apiRecords/ApiRecordsContextProvider";

const ApiClientFeatureContainer: React.FC = () => {
  return (
    <TabServiceProvider>
      <ApiRecordsProvider>
        <LocalSyncRefreshHandler />
        <div className="api-client-container">
          <APIClientSidebar />
          <TabsContainer />
        </div>
      </ApiRecordsProvider>
    </TabServiceProvider>
  );
};

export default ApiClientFeatureContainer;
