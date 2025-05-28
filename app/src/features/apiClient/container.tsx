import React from "react";
import { ApiClientProvider } from "./contexts";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import { TabServiceProvider } from "componentsV2/Tabs/store/TabServiceContextProvider";
import ApiClientLoggedOutView from "./components/common/LoggedOutView/LoggedOutView";
import "./container.scss";

const ApiClientFeatureContainer: React.FC = () => {
  const user = useSelector(getUserAuthDetails);

  if (!user.loggedIn) {
    return <ApiClientLoggedOutView />;
  }

  return (
    <TabServiceProvider>
      <ApiClientProvider>
        <div className="api-client-container">
          <APIClientSidebar />
          {user.loggedIn ? <TabsContainer /> : <ApiClientLoggedOutView />}
        </div>
      </ApiClientProvider>
    </TabServiceProvider>
  );
};

export default ApiClientFeatureContainer;
