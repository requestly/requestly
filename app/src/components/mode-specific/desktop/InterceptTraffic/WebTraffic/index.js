import React from "react";
import { Row, Col, Alert } from "antd";
// Sub components
import TrafficTableV2 from "./TrafficTableV2";

const WebTraffic = () => {
  return (
    <React.Fragment>
      <Row>
        <Col span={24}>
          <TrafficTableV2 />
        </Col>
      </Row>
      <Row
        style={{ paddingLeft: "24px", paddingRight: "24px", marginTop: "1rem" }}
      >
        <Col span={24}>
          <Alert
            message="Network logger works only when you are on this page."
            type="info"
            showIcon
            closable
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default WebTraffic;
