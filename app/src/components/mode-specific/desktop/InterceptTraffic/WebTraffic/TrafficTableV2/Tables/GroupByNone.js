import React from "react";
import { Button, Col, Row } from "antd";
import { useNavigate } from "react-router-dom";

import { redirectToApps } from "utils/RedirectionUtils";
import NetworkInspector from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2/NetworkInspector";

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
        <Col style={{ textAlign: "center" }}>
          <Button type="primary" shape="round" onClick={() => redirectToApps(navigate)} style={{ margin: 8 }}>
            Connect App
          </Button>
          <p>Connect an App to start intercepting traffic</p>
        </Col>
      </Row>
    );
  };

  if (requestsLog?.length === 0) {
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
