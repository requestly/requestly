import React from "react";
import { Button, Col, Row, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";

import { redirectToApps } from "utils/RedirectionUtils";
import NetworkInspector from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2/NetworkInspector";
import { RQButton } from "lib/design-system/components";

const GroupByNone = ({ requestsLog, handleRowClick, emptyCtaText, emptyCtaAction, emptyDesc }) => {
  const navigate = useNavigate();

  const renderNoTrafficCTA = () => {
    if (emptyCtaAction && emptyCtaText) {
      return (
        <>
          <Button type="primary" href={emptyCtaAction} target="_blank" style={{ margin: 8 }} size="small">
            {emptyCtaText}
          </Button>
          <p>{emptyDesc}</p>
        </>
      );
    }

    return (
      <Row justify={"center"}>
        <Col>
          <Space direction="vertical" align="center">
            <Typography.Text>Connect apps to start intercepting traffic</Typography.Text>
            <RQButton type="primary">Connect Apps</RQButton>
            <Typography.Text>Or</Typography.Text>
            <Typography.Text>Capture all the requests from this device</Typography.Text>
            <RQButton>Enable Requestly Everywhere</RQButton>
          </Space>
        </Col>
      </Row>
    );
  };

  if (requestsLog.length === 0) {
    return renderNoTrafficCTA();
  }

  return (
    <NetworkInspector
      logs={requestsLog}
      onRow={(record) => {
        const { actions } = record;
        return {
          onClick: () => handleRowClick(record),
          style: actions.length !== 0 ? { background: "#13c2c280" } : {},
        };
      }}
    />
  );
};

export default GroupByNone;
