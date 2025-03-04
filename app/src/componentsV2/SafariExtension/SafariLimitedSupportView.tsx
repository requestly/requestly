import React from "react";
import { Col, Row, Space, Typography } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import "./safariLimitedSupportView.scss";

export const SafariLimitedSupportView: React.FC = () => {
  return (
    <div className="safari-limited-support-container">
      <div className="safari-limited-support-icon">
        <img src="/assets/img/frame.svg" alt="" />
      </div>
      <Col>
        <Space direction="vertical" size={"large"}>
          <div>
            <Typography.Title level={5}>Limited Support on Safari Browser</Typography.Title>
            <Row className="safari-limited-support-subheading">
              Currently, only the API Client feature works on Safari. Other features
              <br /> like HTTP Rules and Sessions aren’t available yet.
              <br />
              It is completely free to use the API Client on Safari.
              <br />
              <br />
              🚀 Good news: Full Safari support is coming soon! Stay tuned.
            </Row>
          </div>
          <div>
            <Typography.Title level={5}>What's next</Typography.Title>
            <Row className="safari-limited-support-subheading">
              You can access the full functionality of Requestly by using the
              <br /> desktop app or switching to a supported browser like Chrome.
            </Row>
          </div>
          <Space>
            <RQButton onClick={() => window.open("https://requestly.com/downloads/", "__blank")}>Download app</RQButton>
            <RQButton type="primary" onClick={() => window.open("https://rqst.ly/chrome-store", "__blank")}>
              Chrome Extension
            </RQButton>
          </Space>
        </Space>
      </Col>
    </div>
  );
};
