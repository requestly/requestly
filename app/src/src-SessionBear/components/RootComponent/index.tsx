import React from "react";
import { Navigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
// @ts-ignore

/**
 * @description On initial render depending upon the app mode, this component will redirect
 * the root route ie "/" to the rules page or network traffic page.
 */
const RootComponent: React.FC = () => {
  return <Navigate to={PATHS.SESSIONS.ABSOLUTE} />;
};

export default RootComponent;
