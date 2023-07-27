import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { getAppMode } from "store/selectors";
import { useFeatureValue } from "@growthbook/growthbook-react";
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
  const ecosystemExperiment = useFeatureValue("ecosystem-experiment", null);

  const isOpenedInDesktopMode = PATHS.ROOT === location.pathname && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;

  return (
    <Navigate
      to={
        isOpenedInDesktopMode
          ? PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE
          : ecosystemExperiment === "ecosystem"
          ? PATHS.HOME.RELATIVE
          : PATHS.RULES.MY_RULES.ABSOLUTE
      }
    />
  );
};

export default RootComponent;
