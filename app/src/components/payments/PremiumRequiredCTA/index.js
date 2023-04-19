import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "antd";
import { redirectToPricingPlans } from "../../../utils/RedirectionUtils";
import ProCard from "@ant-design/pro-card";
import Jumbotron from "components/bootstrap-legacy/jumbotron";

const PremiumRequiredCTA = ({ message }) => {
  const navigate = useNavigate();
  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <Row>
          <Col span={24} align="center">
            <Jumbotron style={{ background: "transparent" }} className="text-center">
              <h2 className="display-3">{message ? message : null}</h2>
              {/* <p className="lead">{message ? message : null}</p> */}

              <p className="lead">
                <Button type="secondary" onClick={() => redirectToPricingPlans(navigate)}>
                  Get Requestly Premium
                </Button>
              </p>
            </Jumbotron>
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default PremiumRequiredCTA;
