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
import "./SubscriptionInfo.css";

const SubscriptionInfo = ({
  isLifeTimeActive = false,
  hideShadow,
  appSumoCodeCount = 0,
  hideManagePersonalSubscriptionButton,
  subscriptionDetails,
}) => {
  //Global State
  const user = useSelector(getUserAuthDetails);
  const navigate = useNavigate();
  const { planId, validFrom, validTill, status, type, planName } = subscriptionDetails;
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
    return <></>;
  }

  if (type === "appsumo" && status === "trialing") {
    return <></>;
  }

  const getAppSumoCodesRedeemedLabel = (codeCount) => {
    return codeCount === 1 ? `${codeCount} code redeemed` : `${codeCount} codes redeemed`;
  };

  return (
    <Row className="my-4">
      <Col>
        <Card className={`subscription-info ${hideShadow ? "has-no-border has-no-box-shadow" : "shadow"}`}>
          <AntRow>
            <AntCol span={24}>
              <Descriptions title={false} bordered size="small" column={2}>
                <Descriptions.Item label="Status">
                  <Space>
                    <Badge
                      status={isUserPremium ? "success" : "error"}
                      text={<span className="text-capitalize">{status}</span>}
                      className="mt-8"
                    />
                    {!isUserPremium ? (
                      <Button size="small" type="link" onClick={handleRenewOnClick}>
                        Renew
                      </Button>
                    ) : null}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {type === "appsumo"
                    ? `${beautifySubscriptionType(type)} (${getAppSumoCodesRedeemedLabel(appSumoCodeCount)})`
                    : beautifySubscriptionType(type)}
                </Descriptions.Item>
                {isUserPremium && (
                  <Descriptions.Item label="Valid From">{new Date(validFrom).toDateString()}</Descriptions.Item>
                )}
                <Descriptions.Item label="Current Plan">
                  <AntRow justify="space-between">
                    {isLifeTimeActive && planId !== "session_book_plus"
                      ? `HTTP Rules ${getPrettyPlanName(planName)}`
                      : getPrettyPlanName(planName)}
                    {renderCancelButton}
                  </AntRow>
                </Descriptions.Item>
                {isUserPremium && (
                  <Descriptions.Item label="Valid Till">
                    {isLifeTimeActive ? "Lifetime" : new Date(validTill).toDateString()}
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
