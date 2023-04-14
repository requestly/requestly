import React from "react";
import { Row, Col, Input, Typography, Space, Button, Tooltip } from "antd";
import { ClearOutlined, SafetyCertificateOutlined, SettingOutlined } from "@ant-design/icons";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

const { Text } = Typography;

const ActionHeader = ({
  handleOnSearchChange,
  clearLogs,
  setIsSSLProxyingModalVisible,
  showDeviceSelector,
  deviceId,
}) => {
  return (
    <Row
      align="middle"
      style={{
        marginBottom: 6,
        marginTop: 6,
        padding: 3,
        paddingLeft: "24px",
        paddingRight: "24px",
      }}
    >
      <Space direction="horizontal">
        <Col>
          <Input.Search placeholder="Input Search Keyword" onChange={handleOnSearchChange} style={{ width: 300 }} />
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
      </Space>
    </Row>
  );
};

export default ActionHeader;
