import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card } from "reactstrap";
import { Button, Col as AntCol, Row as AntRow, Descriptions, Badge, Space, Popconfirm } from "antd";
// UTILS
import { redirectToPricingPlans } from "../../../../../..//utils/RedirectionUtils";
import { getPrettyPlanName } from "../../../../../../utils/FormattingHelper";
import { getUserAuthDetails } from "../../../../../../store/selectors";
import { beautifySubscriptionType } from "../../../../../../utils/PricingUtils";
import { ChangePlanRequestConfirmationModal } from "features/pricing/components/ChangePlanRequestConfirmationModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import { RQButton } from "lib/design-system/components";
import { trackPricingPlanCancellationRequested } from "modules/analytics/events/misc/business";

const SubscriptionInfo = ({ hideShadow, hideManagePersonalSubscriptionButton, subscriptionDetails }) => {
  //Global State
  const user = useSelector(getUserAuthDetails);
  const navigate = useNavigate();
  const { validFrom, validTill, status, type, planName } = subscriptionDetails;
  const isUserPremium = user.details?.isPremium || status === "active";
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isConfirmationModalLoading, setIsConfirmationModalLoading] = useState(false);

  const handleRenewOnClick = (e) => {
    e.preventDefault();
    redirectToPricingPlans(navigate);
  };

  const cancelPlanClicked = useCallback(() => {
    setIsConfirmationModalOpen(true);
    setIsConfirmationModalLoading(true);
    trackPricingPlanCancellationRequested({
      current_plan: planName,
      end_date: validTill,
      type: type,
    });
    const requestPlanCancellation = httpsCallable(getFunctions(), "premiumNotifications-requestPlanCancellation");
    requestPlanCancellation({
      currentPlan: planName,
    })
      .catch((err) => {
        toast.error("Error in cancelling plan. Please contact support");
        setIsConfirmationModalOpen(false);
      })
      .finally(() => {
        setIsConfirmationModalLoading(false);
      });
  }, [planName, type, validTill]);

  const renderCancelButton = useMemo(() => {
    if (!isUserPremium || status === "trialing") {
      return null;
    }
    return (
      <Popconfirm
        icon={null}
        cancelText="No"
        okText="Yes"
        title="Are you sure you want to cancel your plan?"
        onConfirm={cancelPlanClicked}
      >
        <RQButton size="small" type="link" className="text-underline cursor-pointer">
          Cancel plan
        </RQButton>
      </Popconfirm>
    );
  }, [cancelPlanClicked, isUserPremium, status]);

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
                    <Badge
                      status={isUserPremium ? "success" : "error"}
                      text={<span className="text-capitalize">{status}</span>}
                    />
                    {!isUserPremium ? (
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
                  <AntRow justify="space-between">
                    {getPrettyPlanName(planName)}
                    {renderCancelButton}
                  </AntRow>
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
      <ChangePlanRequestConfirmationModal
        isOpen={isConfirmationModalOpen}
        handleToggle={() => setIsConfirmationModalOpen(false)}
        isLoading={isConfirmationModalLoading}
      />
    </Row>
  );
};

export default SubscriptionInfo;
