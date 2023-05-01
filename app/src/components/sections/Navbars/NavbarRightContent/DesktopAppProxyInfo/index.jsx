import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getDesktopSpecificDetails, getIsConnectedAppsTourCompleted } from "store/selectors";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import { Badge } from "antd";
import { RQButton } from "lib/design-system/components";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import "./desktopAppProxyInfo.scss";
import { actions } from "store";
import { trackConnectAppsClicked } from "modules/analytics/events/desktopApp/apps";
import { getConnectedAppsCount } from "utils/Misc";
import FEATURES from "config/constants/sub/features";
import { shouldShowConnectedAppsTour } from "layouts/DashboardLayout/MenuHeader/utils";

const DesktopAppProxyInfo = () => {
  // Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const isConnectedAppsTourCompleted = useSelector(getIsConnectedAppsTourCompleted);

  const { isBackgroundProcessActive, isProxyServerRunning, proxyPort, proxyIp, appsList } = desktopSpecificDetails;

  const [numberOfConnectedApps, setNumberOfConnectedApps] = useState(0);
  const [startWalkthrough, setStartWalkthrough] = useState(false);

  useEffect(() => {
    setNumberOfConnectedApps(getConnectedAppsCount(Object.values(appsList)));
  }, [appsList]);

  const renderProxyBadgeStatus = () => {
    if (!isBackgroundProcessActive || !isProxyServerRunning) {
      return <Badge status="warning" />;
    }
    return <Badge status="success" />;
  };

  const handleConnectAppsButtonClick = () => {
    if (!isConnectedAppsTourCompleted)
      dispatch(actions.updateProductTourCompleted({ tour: TOUR_TYPES.CONNECTED_APPS }));
    dispatch(
      actions.toggleActiveModal({
        modalName: "connectedAppsModal",
        newValue: true,
        newProps: {},
      })
    );
    trackConnectAppsClicked("app_header");
  };

  const ProxyStatusText = () => {
    useEffect(() => {
      if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
        shouldShowConnectedAppsTour(appMode).then((result) => {
          if (result) {
            setStartWalkthrough(true);
          }
        });
      }
    }, []);

    if (!isBackgroundProcessActive)
      return <span className="proxy-status-text">Waiting for proxy server to start...</span>;

    if (!isProxyServerRunning) return <span className="proxy-status-text">Proxy server is not running</span>;

    return (
      <>
        <ProductWalkthrough
          tourFor={FEATURES.CONNECTED_APPS}
          startWalkthrough={startWalkthrough && !isConnectedAppsTourCompleted}
          onTourComplete={() => dispatch(actions.updateProductTourCompleted({ tour: TOUR_TYPES.CONNECTED_APPS }))}
        />
        <span className="proxy-status-text">Proxy server is listening at{` ${proxyIp}:${proxyPort}`}</span>
        <RQButton
          data-tour-id="connected-apps-header-cta"
          type="default"
          size="small"
          className="connected-apps-btn"
          onClick={handleConnectAppsButtonClick}
        >
          Connect apps
          {numberOfConnectedApps > 0 ? <div className="rq-count-badge">{numberOfConnectedApps}</div> : null}
        </RQButton>
      </>
    );
  };

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) return null;

  return (
    <>
      <div className="desktop-app-proxy-info">
        <>{renderProxyBadgeStatus()}</>
        <ProxyStatusText />
      </div>
    </>
  );
};

export default DesktopAppProxyInfo;
