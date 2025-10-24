import React from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Button, Space } from "antd";
// UTILS
// CONSTANTS
import APP_CONSTANTS from "../../../../../../config/constants";
import { globalActions } from "store/slices/global/slice";
import { trackViewPricingPlansClicked } from "modules/analytics/events/common/pricing";

const GetASubscription = ({ hideShadow }) => {
  const dispatch = useDispatch();
  return (
    <Row className="my-4">
      <Col>
        <Card className={hideShadow ? "has-no-border has-no-box-shadow" : "shadow"}>
          <CardBody>
            <div style={{ textAlign: "center" }} className="mb-2">
              <p>Get the most out of Requestly. Upgrade to one of our premium plans.</p>
              <Space>
                <Button
                  type="primary"
                  onClick={() => {
                    dispatch(
                      globalActions.toggleActiveModal({
                        modalName: "pricingModal",
                        newValue: true,
                        newProps: { selectedPlan: null, source: "my_profile" },
                      })
                    );
                    trackViewPricingPlansClicked("my_profile");
                  }}
                >
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
