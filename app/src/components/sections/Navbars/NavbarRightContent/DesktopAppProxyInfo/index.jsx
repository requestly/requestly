import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllLogs } from "store/features/desktop-traffic-table/selectors";
import { getAppMode, getDesktopSpecificDetails } from "store/selectors";
import { useLocation } from "react-router-dom";
import { globalActions } from "store/slices/global/slice";
import { RQButton } from "lib/design-system-v2/components";
import { ProxyServerStatusIcon } from "componentsV2/ProxyServerStatusIcon/ProxyServerStatusIcon";
import { getConnectedAppsCount } from "utils/Misc";
import { trackConnectAppsClicked } from "modules/analytics/events/desktopApp/apps";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PATHS from "config/constants/sub/paths";
import "./desktopAppProxyInfo.scss";

const DesktopAppProxyInfo = () => {
  // Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const { pathname } = useLocation();
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const networkLogs = useSelector(getAllLogs);
  const { isBackgroundProcessActive, isProxyServerRunning, proxyPort, proxyIp, appsList } = desktopSpecificDetails;
  const isProxyInfoVisible = useMemo(
    () => pathname.includes(PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE) || pathname.includes(PATHS.RULES.RELATIVE),
    [pathname]
  );

  const [numberOfConnectedApps, setNumberOfConnectedApps] = useState(0);

  const hasInterceptionStarted = useRef(false);

  useEffect(() => {
    if (!hasInterceptionStarted.current && networkLogs.length > 0) {
      hasInterceptionStarted.current = true;
    }
  }, [networkLogs.length]);

  useEffect(() => {
    setNumberOfConnectedApps(getConnectedAppsCount(Object.values(appsList)));
  }, [appsList]);

  const handleConnectAppsButtonClick = () => {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "connectedAppsModal",
        newValue: true,
        newProps: { source: "app_header" },
      })
    );
    trackConnectAppsClicked("app_header");
  };

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP || !isProxyInfoVisible) return null;

  return (
    <div className="desktop-app-proxy-info-container">
      <ProxyServerStatusIcon />
      <span className="desktop-app-proxy-info">
        {isBackgroundProcessActive
          ? isProxyServerRunning
            ? `${proxyIp}:${proxyPort}`
            : "No Proxy"
          : "Waiting for proxy server to start"}
      </span>
      <RQButton
        size="small"
        className={`desktop-app-proxy-connect-btn ${numberOfConnectedApps > 0 ? "connected" : ""}`}
        onClick={handleConnectAppsButtonClick}
      >
        {numberOfConnectedApps > 0 ? (
          <>
            connected <div className="connected-apps-count-badge">{numberOfConnectedApps}</div>
          </>
        ) : (
          "connect"
        )}
      </RQButton>
    </div>
  );
};

export default DesktopAppProxyInfo;
