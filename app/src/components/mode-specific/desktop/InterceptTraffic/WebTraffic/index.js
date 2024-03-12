import React from "react";
import { Row, Col } from "antd";
import TrafficTableV2 from "./TrafficTableV2";

const WebTraffic = () => {
  return (
    <Row>
      <Col span={24}>
        <TrafficTableV2 persistLogsFilters />
      </Col>
    </Row>
  );
};

export default WebTraffic;
