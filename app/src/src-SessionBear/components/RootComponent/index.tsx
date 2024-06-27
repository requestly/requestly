import React from "react";
import { Navigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";

const RootComponent: React.FC = () => {
  return <Navigate to={PATHS.SESSIONS.ABSOLUTE} />;
};

export default RootComponent;
