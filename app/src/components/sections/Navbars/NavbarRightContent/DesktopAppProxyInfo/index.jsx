import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getDesktopSpecificDetails } from "store/selectors";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { Badge } from "antd";
import { RQButton } from "lib/design-system/components";
import "./desktopAppProxyInfo.scss";
import { actions } from "store";

const DesktopAppProxyInfo = () => {
  // Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const { isBackgroundProcessActive, isProxyServerRunning, proxyPort, proxyIp, appsList } = desktopSpecificDetails;

  const [numberConnectedApps, setNumberConnectedApps] = useState(0);

  useEffect(() => {
    setNumberConnectedApps(Object.values(appsList).filter((app) => app.isActive).length);
  }, [appsList]);

  const renderProxyBadgeStatus = () => {
    if (!isBackgroundProcessActive || !isProxyServerRunning) {
      return "warning";
    }
    return "success";
  };

  const renderProxyStatusText = () => {
    if (!isBackgroundProcessActive) return "Waiting for proxy server to start...";

    if (!isProxyServerRunning) return "Proxy server is not running";

    return (
      <>
        <span>Proxy server is listening at{` ${proxyIp}:${proxyPort}`}</span>
        <RQButton
          type="default"
          size="small"
          onClick={() => {
            dispatch(
              actions.toggleActiveModal({
                modalName: "connectedAppsModal",
                newValue: true,
                newProps: {},
              })
            );
          }}
        >
          {numberConnectedApps === 0 ? "Connect Apps" : "Connected Apps"}
          {numberConnectedApps > 0 ? (
            <Badge count={numberConnectedApps} size="small" className="rq-count-badge" />
          ) : null}
        </RQButton>
      </>
    );
  };

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) return null;

  return <Badge text={renderProxyStatusText()} status={renderProxyBadgeStatus()} className="desktop-app-proxy-info" />;
};

export default DesktopAppProxyInfo;
