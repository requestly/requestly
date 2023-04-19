import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Space } from "antd";
import ProCard from "@ant-design/pro-card";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { redirectToPricingPlans } from "../../../utils/RedirectionUtils";

const UpgradeCTA = ({ heading, content }) => {
  const navigate = useNavigate();

  return (
    <>
      <ProCard className="primary-card github-like-border">
        <Row style={{ textAlign: "center" }} align="center">
          <Col span={24}>
            <Jumbotron style={{ background: "transparent" }} className="text-center">
              <h1 className="display-3">{heading}</h1>
              <p className="lead">{content}</p>

              <Space>
                <Button
                  onClick={() => {
                    redirectToPricingPlans(navigate);
                  }}
                  className="btn-white ml-auto"
                  type="primary"
                >
                  Upgrade Now
                </Button>
              </Space>
            </Jumbotron>
          </Col>
        </Row>
      </ProCard>
    </>
  );
};

export default UpgradeCTA;
