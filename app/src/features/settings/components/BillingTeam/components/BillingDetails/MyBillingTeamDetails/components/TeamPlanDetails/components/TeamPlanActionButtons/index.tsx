import React from "react";
import { Col, Modal } from "antd";
import { RQButton } from "lib/design-system/components";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { MdOutlineCancel } from "@react-icons/all-files/md/MdOutlineCancel";
import { PRICING } from "features/pricing";
import { globalActions } from "store/slices/global/slice";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { PlanStatus, PlanType } from "features/settings/components/BillingTeam/types";
import { ChangePlanRequestConfirmationModal } from "features/pricing/components/ChangePlanRequestConfirmationModal";
import { useCallback, useState } from "react";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import { CancelPlanModal } from "../../../../../modals/common/CancelPlanModal";

interface Props {
  subscriptionDetails: any;
  isAnnualPlan?: boolean;
}

export const TeamPlanActionButtons: React.FC<Props> = ({ subscriptionDetails, isAnnualPlan }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const redirectedFromCheckout = searchParams.get("redirectedFromCheckout");
  const [isSwitchPlanModalOpen, setIsSwitchPlanModalOpen] = useState(false);
  const [isSwitchPlanModalLoading, setIsSwitchPlanModalLoading] = useState(false);
  const [isCancelPlanModalOpen, setIsCancelPlanModalOpen] = useState(false);

  let planStatus = PlanStatus.ACTIVE;
  if (
    !["active", "past_due", "trialing"].includes(subscriptionDetails?.subscriptionStatus) &&
    !redirectedFromCheckout
  ) {
    planStatus = PlanStatus.EXPIRED;
  }

  const handleUpgradePlan = useCallback(() => {
    const planName = getPlanNameFromId(subscriptionDetails?.plan);
    if (planStatus === PlanStatus.EXPIRED) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "pricingModal",
          newValue: true,
          newProps: { selectedPlan: null, source: "billing_team" },
        })
      );
    } else {
      if (planName === PRICING.PLAN_NAMES.BASIC_V2 || planName === PRICING.PLAN_NAMES.BASIC) {
        Modal.confirm({
          title: "Upgrade Your Plan",
          content: `You are about to upgrade from ${getPrettyPlanName(planName)} to ${getPrettyPlanName(
            PRICING.PLAN_NAMES.PROFESSIONAL
          )} plan.`,
          okText: "Upgrade Now",
          okType: "primary",
          cancelText: "Stay Basic",
          onOk: () => {
            setIsSwitchPlanModalOpen(true);
            setIsSwitchPlanModalLoading(true);

            const manageSubscription = httpsCallable(getFunctions(), "subscription-manageSubscription");
            manageSubscription({
              planName: PRICING.PLAN_NAMES.PROFESSIONAL,
              duration: isAnnualPlan ? PRICING.DURATION.ANNUALLY : PRICING.DURATION.MONTHLY,
              portalFlowType: "update_subscription",
            })
              .then((res: any) => {
                if (res?.data?.success) {
                  window.open(res?.data?.data?.portalUrl, "_blank");
                }
              })
              .catch(() => {
                toast.error("Error in switching plan. Please contact support");
                setIsSwitchPlanModalOpen(false);
              })
              .finally(() => {
                setIsSwitchPlanModalLoading(false);
              });
          },
          onCancel: () => {
            setIsSwitchPlanModalLoading(false);
          },
        });
      } else {
        dispatch(
          globalActions.toggleActiveModal({
            modalName: "pricingModal",
            newValue: true,
            newProps: { selectedPlan: null, source: "billing_team" },
          })
        );
      }
    }
  }, [dispatch, isAnnualPlan, planStatus, subscriptionDetails?.plan]);

  return (
    <>
      <Col className="team-plan-details-card-actions">
        {planStatus !== PlanStatus.EXPIRED && (
          <RQButton
            type="text"
            className="team-plan-details-card-actions-cancel"
            icon={<MdOutlineCancel />}
            onClick={() => setIsCancelPlanModalOpen(true)}
            disabled={
              subscriptionDetails?.cancel_at_period_end || subscriptionDetails?.rqSubscriptionType === PlanType.STUDENT
            }
          >
            Cancel plan
          </RQButton>
        )}

        {!(
          [PRICING.PLAN_NAMES.PROFESSIONAL, PRICING.PLAN_NAMES.ENTERPRISE].includes(
            getPlanNameFromId(subscriptionDetails?.plan)
          ) && planStatus === PlanStatus.ACTIVE
        ) && (
          <RQButton
            type="primary"
            onClick={handleUpgradePlan}
            icon={<img src={"/assets/media/settings/upgrade.svg"} alt="upgrade" />}
          >
            {planStatus === PlanStatus.EXPIRED ? "Renew plan" : "Upgrade plan"}
          </RQButton>
        )}
      </Col>
      <ChangePlanRequestConfirmationModal
        isOpen={isSwitchPlanModalOpen}
        handleToggle={() => setIsSwitchPlanModalOpen(false)}
        isLoading={isSwitchPlanModalLoading}
      />
      <CancelPlanModal
        isOpen={isCancelPlanModalOpen}
        closeModal={() => setIsCancelPlanModalOpen(false)}
        billingTeamQuantity={subscriptionDetails?.quantity}
        currentPlanName={getPlanNameFromId(subscriptionDetails?.plan)}
        currentPlanEndDate={subscriptionDetails?.subscriptionCurrentPeriodEnd * 1000}
      />
    </>
  );
};
