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
}

export const TeamPlanActionButtons: React.FC<Props> = ({ subscriptionDetails }) => {
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
        actions.toggleActiveModal({
          modalName: "pricingModal",
          newValue: true,
          newProps: { selectedPlan: null, source: "billing_team" },
        })
      );
    } else {
      if (planName === PRICING.PLAN_NAMES.BASIC_V2 || planName === PRICING.PLAN_NAMES.BASIC) {
        Modal.confirm({
          title: "Switch Plan",
          content: `You are about to switch from ${getPrettyPlanName(planName)} plan to ${getPrettyPlanName(
            PRICING.PLAN_NAMES.PROFESSIONAL
          )} plan.`,
          okText: "Yes",
          okType: "primary",
          cancelText: "No",
          onOk: () => {
            setIsSwitchPlanModalOpen(true);
            setIsSwitchPlanModalLoading(true);
            const requestPlanSwitch = httpsCallable(getFunctions(), "premiumNotifications-requestPlanSwitch");
            requestPlanSwitch({
              currentPlan: planName,
              planToSwitch: PRICING.PLAN_NAMES.PROFESSIONAL,
              currentPlanType: "team",
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
  }, [dispatch, planStatus, subscriptionDetails?.plan]);

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

        {!(
          getPlanNameFromId(subscriptionDetails?.plan) === PRICING.PLAN_NAMES.PROFESSIONAL &&
          planStatus === PlanStatus.ACTIVE
        ) && (
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
      />
    </>
  );
};
