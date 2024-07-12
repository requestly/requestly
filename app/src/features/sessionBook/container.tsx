import React from "react";
import { Outlet } from "react-router-dom";
import { SessionsContextProvider } from "./context";

const SessionsFeatureContainer: React.FC = () => {
  return (
    <SessionsContextProvider>
      <Outlet />
    </SessionsContextProvider>
  );
};

export default SessionsFeatureContainer;
