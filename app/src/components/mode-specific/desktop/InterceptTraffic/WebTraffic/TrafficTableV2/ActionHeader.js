import React, { useState } from "react";
import { Row, Col, Input, Typography, Space, Button, Tooltip } from "antd";
import {
  CaretRightOutlined,
  ClearOutlined,
  PauseOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

const { Text } = Typography;

const ActionHeader = ({
  handleOnSearchChange,
  clearLogs,
  setIsSSLProxyingModalVisible,
  showDeviceSelector,
  deviceId,
  setIsInterceptingTraffic,
}) => {
  return (
    <Row
      align="middle"
      style={{
        padding: 3,
        paddingLeft: "24px",
        paddingRight: "12px",
      }}
    >
      <Space direction="horizontal">
        <Col>
          <Input.Search
            className="action-header-input"
            placeholder="Input Search Keyword"
            onChange={handleOnSearchChange}
            style={{ width: 300 }}
          />
        </Col>
        <Col>
          <Tooltip placement="top" title="Clear Logs">
            <Button type="primary" shape="circle" icon={<ClearOutlined />} onClick={clearLogs} />
          </Tooltip>
        </Col>
        {isFeatureCompatible(FEATURES.DESKTOP_APP_SSL_PROXYING) ? (
          <Col>
            <Tooltip title="SSL Proxying">
              <Button
                type="primary"
                shape="circle"
                icon={<SafetyCertificateOutlined />}
                onClick={() => setIsSSLProxyingModalVisible(true)}
              />
            </Tooltip>
          </Col>
        ) : null}
        {showDeviceSelector ? (
          <>
            <Col>
              <Button onClick={showDeviceSelector} shape="circle" danger type="primary">
                <SettingOutlined />
              </Button>
            </Col>
            <Col>
              <Text code>Device Id: {deviceId || "Null"}</Text>
            </Col>
          </>
        ) : null}
        <Col>
          <PauseAndPlayButton
            defaultIsPaused={false}
            onChange={(isPaused) => {
              console.log("isPaused", isPaused);
              setIsInterceptingTraffic(!isPaused);
            }}
          />
        </Col>
      </Space>
    </Row>
  );
};

export default ActionHeader;

function PauseAndPlayButton({ defaultIsPaused, onChange }) {
  const [isPaused, setIsPaused] = useState(defaultIsPaused);
  return (
    <Tooltip title={isPaused ? "Resume logging requests" : "Pause logging requests"}>
      {isPaused ? (
        <Button
          type="primary"
          shape="circle"
          icon={<CaretRightOutlined />}
          onClick={() => {
            setIsPaused(false);
            onChange(false); // isPaused
          }}
        />
      ) : (
        <Button
          type="primary"
          shape="circle"
          danger
          icon={<PauseOutlined />}
          onClick={() => {
            setIsPaused(true);
            onChange(true); // isPaused
          }}
        />
      )}
    </Tooltip>
  );
}
