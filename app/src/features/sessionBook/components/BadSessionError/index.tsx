import React, { useEffect } from "react";
import ProCard from "@ant-design/pro-card";
import { Col, Row } from "antd";
import { trackBadSessionRecordingViewed } from "features/sessionBook/analytics";

// DUPLICATED
// TODO: REMOVE OLD FILE
const BadSessionError = () => {
  useEffect(() => {
    trackBadSessionRecordingViewed();
  }, []);

  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <Row className="hp-text-center">
          <Col span={24}>
            <Row justify="center">
              <Col>
                <img
                  className="hp-position-relative hp-d-block hp-m-auto"
                  src={"/assets/media/common/403.svg"}
                  alt="403"
                  height={300}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="text-center" align="middle">
          <Col span={24}>
            <h1 className="display-3">There is some error in this SessionBook</h1>
            <p className="lead">
              Please contact support at <a href="mailto:contact@requestly.io">contact@requestly.io</a>
            </p>
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default BadSessionError;
