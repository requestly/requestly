import React from "react";
import { ApiClientProvider } from "./contexts";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import { TabServiceProvider } from "componentsV2/Tabs/store/TabServiceContextProvider";
import { LocalSyncRefreshHandler } from "./LocalSyncRefreshHandler";
import "./container.scss";

const ApiClientFeatureContainer: React.FC = () => {
  return (
    <TabServiceProvider>
      <ApiClientProvider>
        <>
          <LocalSyncRefreshHandler />
          <div className="api-client-container">
            <APIClientSidebar />
            <TabsContainer />
          </div>
        </>
      </ApiClientProvider>
    </TabServiceProvider>
  );
};

export default ApiClientFeatureContainer;
