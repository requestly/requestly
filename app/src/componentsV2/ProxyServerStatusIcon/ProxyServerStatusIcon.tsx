import { Tooltip } from "antd";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { getDesktopSpecificDetails } from "store/selectors";
import "./proxyServerStatusIcon.scss";

interface ProxyServerStatusIconProps {
  showTooltip: boolean;
}

export const ProxyServerStatusIcon: React.FC<ProxyServerStatusIconProps> = ({ showTooltip }) => {
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const { isBackgroundProcessActive, isProxyServerRunning, proxyPort, proxyIp } = desktopSpecificDetails;

  const tooltipTitle = useMemo(() => {
    if (!isBackgroundProcessActive) {
      return <>Waiting for proxy server to start</>;
    }
    if (isProxyServerRunning) {
      return (
        <div className="text-center proxy-server-status-tooltip-text">
          Proxy server is running at{" "}
          <div className="proxy-server-status-tooltip-text__port">
            {proxyIp}:{proxyPort}
          </div>
        </div>
      );
    }
    return <>Proxy server is not running</>;
  }, [isBackgroundProcessActive, isProxyServerRunning, proxyIp, proxyPort]);

  return (
    <Tooltip showArrow={false} color="#000" title={showTooltip ? tooltipTitle : ""} placement="bottom">
      {isBackgroundProcessActive ? (
        isProxyServerRunning ? (
          <img src="/assets/media/common/proxyActive.svg" alt="active proxy server" />
        ) : (
          <img src="/assets/media/common/proxyInactive.svg" alt="Inactive proxt server" />
        )
      ) : null}
    </Tooltip>
  );
};
