import React from "react";
import { Outlet } from "react-router-dom";
import { ApiClientProvider } from "./contexts";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { TabsLayoutContainer } from "layouts/TabsLayout";
import { Feature } from "layouts/TabsLayout/contexts/tabsLayoutContext";
import "./container.scss";

const ApiClientFeatureContainer: React.FC = () => {
  return (
    <TabsLayoutContainer childFeatureName={Feature.API_CLIENT}>
      <ApiClientProvider>
        <div className="api-client-container">
          <APIClientSidebar />

          {/* TODO: Improve Outlet prop */}
          <TabsLayoutContainer.TabsLayoutContent Outlet={(props: any) => <Outlet {...props} />} />
        </div>
      </ApiClientProvider>
    </TabsLayoutContainer>
  );
};

export default ApiClientFeatureContainer;
