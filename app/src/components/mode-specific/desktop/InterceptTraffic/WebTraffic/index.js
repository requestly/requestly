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
      <Row>
        <Col span={24}>
          <Alert
            closable
            showIcon
            type="info"
            message="Network logger works only when you are on this page."
            style={{ paddingLeft: "24px", paddingRight: "24px", margin: "1rem 0" }}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default WebTraffic;
