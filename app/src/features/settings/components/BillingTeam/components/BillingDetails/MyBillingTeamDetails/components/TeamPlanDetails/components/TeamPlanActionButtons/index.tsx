import React from "react";
import { Col, Modal } from "antd";
import { RQButton } from "lib/design-system/components";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { MdOutlineCancel } from "@react-icons/all-files/md/MdOutlineCancel";
import upgradeIcon from "../../../../../../../assets/upgrade.svg";
import { PRICING } from "features/pricing";
import { actions } from "store";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { PlanStatus } from "features/settings/components/BillingTeam/types";
import { ChangePlanRequestConfirmationModal } from "features/pricing/components/ChangePlanRequestConfirmationModal";
import { useCallback, useState } from "react";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import { CancelPlanModal } from "../../../../../modals/common/CancelPlanModal";

interface Props {
  subscriptionDetails: any;
  isAnnualPlan?: boolean;
  billingTeamQuantity?: number;
}

export const TeamPlanActionButtons: React.FC<Props> = ({ subscriptionDetails, isAnnualPlan, billingTeamQuantity }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const redirectedFromCheckout = searchParams.get("redirectedFromCheckout");
  const [isSwitchPlanModalOpen, setIsSwitchPlanModalOpen] = useState(false);
  const [isSwitchPlanModalLoading, setIsSwitchPlanModalLoading] = useState(false);
  const [isCancelPlanModalOpen, setIsCancelPlanModalOpen] = useState(false);

  let planStatus = PlanStatus.ACTIVE;
  if (!["active", "past_due", "trialing"].includes(subscriptionDetails?.status) && !redirectedFromCheckout) {
    planStatus = PlanStatus.EXPIRED;
  }

  const handleUpgradePlan = useCallback(() => {
    const planName = subscriptionDetails?.planName;
    if (planStatus === PlanStatus.EXPIRED) {
      dispatch(
        actions.toggleActiveModal({
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
          actions.toggleActiveModal({
            modalName: "pricingModal",
            newValue: true,
            newProps: { selectedPlan: null, source: "billing_team" },
          })
        );
      }
    }
  }, [dispatch, isAnnualPlan, planStatus, subscriptionDetails?.planName]);

  return (
    <>
      <Col className="team-plan-details-card-actions">
        {planStatus !== PlanStatus.EXPIRED && (
          <RQButton
            type="text"
            className="team-plan-details-card-actions-cancel"
            icon={<MdOutlineCancel />}
            onClick={() => setIsCancelPlanModalOpen(true)}
          >
            Cancel plan
          </RQButton>
        )}

        {!(subscriptionDetails?.planName === PRICING.PLAN_NAMES.PROFESSIONAL && planStatus === PlanStatus.ACTIVE) && (
          <RQButton type="primary" onClick={handleUpgradePlan} icon={<img src={upgradeIcon} alt="upgrade" />}>
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
        subscriptionDetails={subscriptionDetails}
        isOpen={isCancelPlanModalOpen}
        closeModal={() => setIsCancelPlanModalOpen(false)}
        isIndividualSubscription={!billingTeamQuantity || billingTeamQuantity === 1}
      />
    </>
  );
};
