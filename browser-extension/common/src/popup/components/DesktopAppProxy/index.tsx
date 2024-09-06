import { Button, Col, Row } from "antd";
import React, { useCallback, useEffect, useState } from "react";

interface DesktopAppProxyProps {
  handleToggleExtensionStatus: () => void;
}

interface ProxyDetails {
  proxyPort: number;
  proxyHost: string;
  proxyUrl: string;
}

const DESKTOP_APP_PROXY_INFO_URL = "http://127.0.0.0:7040/proxy";

const DesktopAppProxy: React.FC<DesktopAppProxyProps> = ({ handleToggleExtensionStatus }) => {
  const [checkingProxyStatus, setCheckingProxyStatus] = useState(true);
  const [isProxyApplied, setIsProxyApplied] = useState(false);
  const [proxyDetails, setProxyDetails] = useState<ProxyDetails>(null);

  const fetchProxyDetails = useCallback(async () => {
    setCheckingProxyStatus(true);
    fetch(DESKTOP_APP_PROXY_INFO_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("!!!debug", "proxydetails", proxyDetails);
        setProxyDetails(data);
      })
      .catch((err) => {
        console.error("Error fetching proxy status", err);
        setProxyDetails(null);
      })
      .finally(() => {
        setCheckingProxyStatus(false);
      });
  }, []);

  const applyProxy = () => {
    // Apply the proxy to browser and deactivate extension
    setIsProxyApplied(true);
  };

  const removeProxy = () => {
    // Remove the proxy from browser and activate extension
    setIsProxyApplied(false);
  };

  useEffect(() => {
    fetchProxyDetails();
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
