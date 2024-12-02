import React from "react";
import { Outlet } from "react-router-dom";
import { ApiClientProvider } from "./contexts";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import "./container.scss";

const ApiClientFeatureContainer: React.FC = () => {
  return (
    <ApiClientProvider>
      <div className="api-client-container">
        <APIClientSidebar />
        <Outlet />
      </div>
    </ApiClientProvider>
  );
};

export default ApiClientFeatureContainer;
