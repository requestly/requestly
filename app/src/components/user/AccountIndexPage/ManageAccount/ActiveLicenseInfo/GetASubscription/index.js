import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Button, Space } from "antd";
// UTILS
import { redirectToPricingPlans } from "../../../../../../utils/RedirectionUtils";
// CONSTANTS
import APP_CONSTANTS from "../../../../../../config/constants";

const GetASubscription = ({ hideShadow }) => {
  const navigate = useNavigate();
  return (
    <Row className="my-4">
      <Col>
        <Card className={hideShadow ? "has-no-border has-no-box-shadow" : "shadow"}>
          <CardBody>
            <div style={{ textAlign: "center" }} className="mb-2">
              <p>Get the most out of Requestly. Upgrade to one of our premium plans.</p>
              <Space>
                <Button type="primary" onClick={() => redirectToPricingPlans(navigate)}>
                  View Plans
                </Button>
                <Button
                  type="secondary"
                  onClick={(e) => window.open(APP_CONSTANTS.LINKS.REQUESTLY_DOCS_PREMIUM_SUBSCRIPTION, "_blank")}
                >
                  Know More
                </Button>
              </Space>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default GetASubscription;
