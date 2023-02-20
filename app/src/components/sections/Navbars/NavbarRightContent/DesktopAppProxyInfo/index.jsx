import React from "react";
import { useSelector } from "react-redux";
import { getAppMode, getDesktopSpecificDetails } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { Badge } from "antd";

const DesktopAppProxyInfo = () => {
  // Global State
  const appMode = useSelector(getAppMode);
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);

  const {
    isBackgroundProcessActive,
    isProxyServerRunning,
    proxyPort,
    proxyIp,
  } = desktopSpecificDetails;

  const renderProxyBadgeStatus = () => {
    if (!isBackgroundProcessActive || !isProxyServerRunning) {
      return "warning";
    }
    return "success";
  };

  const renderProxyStatusText = () => {
    if (!isBackgroundProcessActive)
      return "Waiting for proxy server to start...";

    if (!isProxyServerRunning) return "Proxy server is not running";

    return (
      <React.Fragment>
        Proxy server is listening at{` ${proxyIp}:${proxyPort}`}
      </React.Fragment>
    );
  };

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) return null;

  return (
    <>
      <Badge
        text={renderProxyStatusText()}
        status={renderProxyBadgeStatus()}
        className="desktop-app-proxy-info"
      />
    </>
  );
};

export default DesktopAppProxyInfo;
