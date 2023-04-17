import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getDesktopSpecificDetails } from "store/selectors";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { Badge } from "antd";
import { RQButton } from "lib/design-system/components";
import "./desktopAppProxyInfo.scss";
import { actions } from "store";
import { trackConnectAppsClicked } from "modules/analytics/events/desktopApp/apps";

const DesktopAppProxyInfo = () => {
  // Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const { isBackgroundProcessActive, isProxyServerRunning, proxyPort, proxyIp, appsList } = desktopSpecificDetails;

  const [numberOfConnectedApps, setNumberOfConnectedApps] = useState(0);

  useEffect(() => {
    setNumberOfConnectedApps(Object.values(appsList).filter((app) => app.isActive).length);
  }, [appsList]);

  const renderProxyBadgeStatus = () => {
    if (!isBackgroundProcessActive || !isProxyServerRunning) {
      return <Badge status="warning" />;
    }
    return <Badge status="success" />;
  };

  const renderProxyStatusText = () => {
    if (!isBackgroundProcessActive)
      return <span className="proxy-status-text">Waiting for proxy server to start...</span>;

    if (!isProxyServerRunning) return <span className="proxy-status-text">Proxy server is not running</span>;

    return (
      <>
        <span className="proxy-status-text">Proxy server is listening at{` ${proxyIp}:${proxyPort}`}</span>
        <RQButton
          type="default"
          size="small"
          className="connected-apps-btn"
          onClick={() => {
            dispatch(
              actions.toggleActiveModal({
                modalName: "connectedAppsModal",
                newValue: true,
                newProps: {},
              })
            );
            trackConnectAppsClicked("app_header");
          }}
        >
          Connect Apps
          {numberOfConnectedApps > 0 ? <div className="rq-count-badge">{numberOfConnectedApps}</div> : null}
        </RQButton>
      </>
    );
  };

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) return null;

  return (
    <div className="desktop-app-proxy-info">
      <>{renderProxyBadgeStatus()}</>
      <>{renderProxyStatusText()}</>
    </div>
  );
};

export default DesktopAppProxyInfo;
