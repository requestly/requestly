import { Button, Col, Row } from "antd";
import React, { useCallback, useEffect, useState } from "react";

interface DesktopAppProxyProps {
  handleToggleExtensionStatus: () => void;
}

interface ProxyDetails {
  proxyPort: number;
  proxyIp: string;
  proxyUrl: string;
}

const DESKTOP_APP_PROXY_INFO_URL = "http://127.0.0.1:7040/proxy";

const DesktopAppProxy: React.FC<DesktopAppProxyProps> = ({ handleToggleExtensionStatus }) => {
  const [checkingProxyStatus, setCheckingProxyStatus] = useState(true);
  const [isProxyApplied, setIsProxyApplied] = useState(false);
  const [proxyDetails, setProxyDetails] = useState<ProxyDetails>(null);

  const fetchProxyDetails = useCallback(async () => {
    setCheckingProxyStatus(true);
    fetch(DESKTOP_APP_PROXY_INFO_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("!!!debug", "proxydetails", data);
        setProxyDetails(data);
      })
      .catch((err) => {
        console.error("!!!Error fetching proxy status", err);
        setProxyDetails(null);
      })
      .finally(() => {
        setCheckingProxyStatus(false);
      });
  }, []);

  const applyProxy = useCallback(() => {
    if (!proxyDetails) {
      return;
    }

    chrome.proxy.settings
      .set({
        value: {
          mode: "fixed_servers",
          rules: {
            singleProxy: {
              scheme: "http",
              host: proxyDetails.proxyIp,
              port: proxyDetails.proxyPort,
            },
            bypassList: [], // @TODO
          },
        },
        scope: "regular",
      })
      // @ts-ignore
      ?.then(() => {
        setIsProxyApplied(true);
        // handleToggleExtensionStatus();
      })
      ?.catch((err: unknown) => {
        console.error("!!!Error applying proxy", err);
      });
  }, [proxyDetails]);
  // Need a way to check proxy application status

  const removeProxy = useCallback(() => {
    chrome.proxy.settings
      .clear({ scope: "regular" })
      // @ts-ignore
      // null check for building popup in MV2
      ?.then(() => {
        setIsProxyApplied(false);
        // handleToggleExtensionStatus();
      })
      ?.catch((err: unknown) => {
        console.error("!!!Error removing proxy", err);
      });
  }, []);

  const checkIfProxyApplied = useCallback(() => {
    chrome.proxy.settings.get({}, (config) => {
      console.log("!!!debug", "proxyConfig", config);
      if (config.levelOfControl === "controlled_by_this_extension" && config.value.mode === "fixed_servers") {
        setIsProxyApplied(true);
      }
    });
  }, []);

  useEffect(() => {
    fetchProxyDetails();
    checkIfProxyApplied();
  }, []);

  return (
    <Row>
      <Col>Connect to desktop app</Col>
      <Col>
        {!isProxyApplied ? (
          <Button
            onClick={() => {
              if (!proxyDetails) {
                //Open desktop app
                window.open("requestly://desktop");
              }
              fetchProxyDetails().then(() => {
                applyProxy();
              });

              // Wait for desktop app to start and then fetch for proxy info
              // Apply the proxy and deactivate the extension
            }}
          >
            Connect to desktop app
          </Button>
        ) : (
          <Button
            onClick={() => {
              removeProxy();
            }}
          >
            Disconnect
          </Button>
        )}
      </Col>
    </Row>
  );
};

export default DesktopAppProxy;
