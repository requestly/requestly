import { Button, Col, Row } from "antd";
import React from "react";

interface DesktopAppProxyProps {
  handleToggleProxyStatus: () => void;
  checkingProxyStatus: boolean;
  isProxyApplied: boolean;
  isProxyRunning: boolean;
}

const DesktopAppProxy: React.FC<DesktopAppProxyProps> = ({
  handleToggleProxyStatus,
  checkingProxyStatus,
  isProxyApplied,
  isProxyRunning,
}) => {
  return (
    <Row>
      <Col>Connect to desktop app</Col>
      <Col>
        {!isProxyApplied ? (
          <Button
            onClick={() => {
              if (!isProxyRunning) {
                //Open desktop app
                window.open("requestly://desktop");
              }
              // Wait for desktop app to start and then fetch for proxy info
              // Apply the proxy and deactivate the extension
            }}
          >
            Connect to desktop app
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (isProxyRunning) {
                // Remove the proxy
                // Activate the extension
              }
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
