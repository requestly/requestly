import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card } from "reactstrap";
import { Button, Col as AntCol, Row as AntRow, Descriptions, Badge, Space } from "antd";
// UTILS
import { redirectToPricingPlans } from "../../../../../..//utils/RedirectionUtils";
import { getPrettyPlanName } from "../../../../../../utils/FormattingHelper";
import { getUserAuthDetails } from "../../../../../../store/selectors";
import { beautifySubscriptionType } from "../../../../../../utils/PricingUtils";

const SubscriptionInfo = ({ hideShadow, hideManagePersonalSubscriptionButton, subscriptionDetails }) => {
  //Global State
  const user = useSelector(getUserAuthDetails);
  const navigate = useNavigate();
  const { validFrom, validTill, status, type, planName } = subscriptionDetails;
  const isUserPremium = user.details?.isPremium || status === "active";

  const handleRenewOnClick = (e) => {
    e.preventDefault();
    redirectToPricingPlans(navigate);
  };

  if (!subscriptionDetails) {
    return <React.Fragment></React.Fragment>;
  }
  return (
    <Row className="my-4">
      <Col>
        <Card className={hideShadow ? "has-no-border has-no-box-shadow" : "shadow"}>
          <AntRow>
            <AntCol span={24}>
              <Descriptions title={false} bordered size="small" column={2}>
                <Descriptions.Item label="Status" className="primary-card github-like-border">
                  <Space>
                    <Badge status={isUserPremium ? "success" : "error"} text={isUserPremium ? "Active" : "Inactive"} />
                    {status === "canceled" || status === "incomplete_expired" ? (
                      <React.Fragment>
                        <Button size="small" type="link" onClick={handleRenewOnClick}>
                          Renew
                        </Button>
                      </React.Fragment>
                    ) : null}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Type" className="primary-card github-like-border">
                  {beautifySubscriptionType(type)}
                </Descriptions.Item>
                {isUserPremium && (
                  <Descriptions.Item label="Valid From" className="primary-card github-like-border">
                    {new Date(validFrom).toDateString()}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Current Plan" className="primary-card github-like-border">
                  {getPrettyPlanName(planName)}
                </Descriptions.Item>
                {isUserPremium && (
                  <Descriptions.Item label="Valid Till" className="primary-card github-like-border">
                    {new Date(validTill).toDateString()}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </AntCol>
          </AntRow>
        </Card>
      </Col>
    </Row>
  );
};

export default SubscriptionInfo;
