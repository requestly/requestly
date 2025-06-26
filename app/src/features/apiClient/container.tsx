import React from "react";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import { TabServiceProvider } from "componentsV2/Tabs/store/TabServiceContextProvider";
import ApiClientLoggedOutView from "./components/common/LoggedOutView/LoggedOutView";
import { LocalSyncRefreshHandler } from "./LocalSyncRefreshHandler";
import "./container.scss";
import { ApiRecordsProvider } from "./store/apiRecords/ApiRecordsContextProvider";

const ApiClientFeatureContainer: React.FC = () => {
  const user = useSelector(getUserAuthDetails);

  if (!user.loggedIn) {
    return <ApiClientLoggedOutView />;
  }

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
