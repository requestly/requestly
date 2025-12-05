import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getDesktopSpecificDetails } from "store/selectors";
import { getAllLogs } from "store/features/desktop-traffic-table/selectors";
import { ProxyServerStatusIcon } from "componentsV2/ProxyServerStatusIcon/ProxyServerStatusIcon";
import { RQButton } from "lib/design-system/components";
import { globalActions } from "store/slices/global/slice";
import { getConnectedAppsCount } from "utils/Misc";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { trackConnectAppsClicked } from "modules/analytics/events/desktopApp/apps";
import "./desktopAppProxyInfo.scss";

const DesktopAppProxyInfo = () => {
  // Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const networkLogs = useSelector(getAllLogs);
  const { isBackgroundProcessActive, isProxyServerRunning, proxyPort, proxyIp, appsList } = desktopSpecificDetails;
  const [numberOfConnectedApps, setNumberOfConnectedApps] = useState(0);

  const hasInterceptionStarted = useRef(false);

  // Debug logs for no-proxy issue
  useEffect(() => {
    console.log("[DesktopAppProxyInfo] Redux State Updated:", {
      isBackgroundProcessActive,
      isProxyServerRunning,
      proxyPort,
      proxyIp,
      fullDesktopSpecificDetails: desktopSpecificDetails,
    });
  }, [isBackgroundProcessActive, isProxyServerRunning, proxyPort, proxyIp, desktopSpecificDetails]);

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

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) return null;

  console.log("[DesktopAppProxyInfo] Render values:", {
    isBackgroundProcessActive,
    isProxyServerRunning,
    proxyIp,
    proxyPort,
    displayText: isBackgroundProcessActive
      ? isProxyServerRunning
        ? `${proxyIp}:${proxyPort}`
        : "No Proxy"
      : "Waiting for proxy server to start",
  });
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
          <div className="desktop-app-proxy-connect-btn-content">
            Connected <div className="connected-apps-count-badge">{numberOfConnectedApps}</div>
          </div>
        ) : (
          "Connect"
        )}
      </RQButton>
    </div>
  );
};

export default DesktopAppProxyInfo;
