import React from "react";
import { Outlet } from "react-router-dom";
import { ApiClientProvider } from "./contexts";

const ApiClientFeatureContainer: React.FC = () => {
  return (
    <ApiClientProvider>
      <Outlet />
    </ApiClientProvider>
  );
};

export default ApiClientFeatureContainer;
