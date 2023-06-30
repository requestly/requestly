import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useSearchParams, useNavigate, useRoutes } from "react-router-dom";
import { routes } from "routes";
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//UTILS
import { getAppMode } from "store/selectors";
import { getRouteFromCurrentPath } from "utils/URLUtils";
import { trackPageViewEvent } from "modules/analytics/events/misc/pageView";
import CommonModals from "./CommonModals";
const { PATHS } = APP_CONSTANTS;

const DashboardContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appRoutes = useRoutes(routes);
  const [searchParams] = useSearchParams();

  const appMode = useSelector(getAppMode);

  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const prevProps = usePrevious({ location });

  useEffect(() => {
    if (PATHS.ROOT === location.pathname && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      navigate(PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE);
    }
  }, [appMode, location, navigate]);

  useEffect(() => {
    if (prevProps && prevProps.location !== location) {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      document.getElementById("dashboardMainContent").scrollTop = 0;
    }

    // ANALYTICS
    if (!prevProps || prevProps.location !== location) {
      trackPageViewEvent(getRouteFromCurrentPath(location.pathname), Object.fromEntries(searchParams));
    }
  }, [location, prevProps, searchParams]);

  return (
    <>
      <div id="dashboardMainContent">{appRoutes}</div>
      <CommonModals />
    </>
  );
};

export default DashboardContent;
