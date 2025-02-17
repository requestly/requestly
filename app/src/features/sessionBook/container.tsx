import React from "react";
import { Outlet } from "react-router-dom";
import { SessionsContextProvider } from "./context";
import { useSelector } from "react-redux";
import { getIsWorkspaceLocal } from "store/features/teams/selectors";

const SessionsFeatureContainer: React.FC = () => {
  const isWorkspaceLocal = useSelector(getIsWorkspaceLocal);

  if (isWorkspaceLocal) {
    return <div>NO ACCESS - LOCAL WORKSPACE</div>;
  }

  return (
    <SessionsContextProvider>
      <Outlet />
    </SessionsContextProvider>
  );
};

export default SessionsFeatureContainer;
