import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { getAppMode, getLastUsedFeaturePath } from "store/selectors";
import PATHS from "config/constants/sub/paths";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

/**
 * @description On initial render depending upon the app mode, this component will redirect
 * the root route ie "/" to the rules page or network traffic page.
 */
const RootComponent: React.FC = () => {
  const location = useLocation();
  const appMode = useSelector(getAppMode);
  const storedFeaturePath = useSelector(getLastUsedFeaturePath);

  const isOpenedInDesktopMode = PATHS.ROOT === location.pathname && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;

  if (location.pathname === PATHS.ROOT) {
    if (storedFeaturePath && storedFeaturePath !== PATHS.ROOT) {
      return <Navigate to={storedFeaturePath} />;
    }
    return <Navigate to={isOpenedInDesktopMode ? PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE : PATHS.HOME.ABSOLUTE} />;
  }
};

export default RootComponent;
