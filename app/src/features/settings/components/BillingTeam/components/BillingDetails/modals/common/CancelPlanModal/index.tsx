import React, { useState } from "react";
import { Col, Input, Modal, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import { PlanType } from "features/settings/components/BillingTeam/types";
import { trackPricingPlanCancelled } from "modules/analytics/events/misc/business";
import "./index.scss";

interface Props {
  isOpen: boolean;
  subscriptionDetails: any;
  closeModal: () => void;
}

export const CancelPlanModal: React.FC<Props> = ({ isOpen, closeModal, subscriptionDetails }) => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isIndividualPlanType = PlanType.INDIVIDUAL === subscriptionDetails?.type;
  const { subscription, type, planName } = subscriptionDetails ?? {};
  const endDate = subscription?.endDate;

  const handleRequestCancellation = () => {
    if (!reason) {
      toast.warn("Please let us know the reason for cancellation!");
      return;
    }

    if (reason.length <= 3) {
      toast.warn("Please enter a valid reason for cancellation!");
      return;
    }

    setIsLoading(true);

    const cancelSubscription = httpsCallable<
      {
        reason: string;
        currentPlan: string;
      },
      {
        success: boolean;
        message: string;
      }
    >(getFunctions(), "subscription-cancelSubscription");

    cancelSubscription({ reason, currentPlan: getPrettyPlanName(subscriptionDetails?.plan) })
      .then((res) => {
        if (res.data.success) {
          trackPricingPlanCancelled({
            reason,
            type: type,
            end_date: endDate,
            current_plan: planName,
          });

          toast.success(res.data.message);
        } else {
          toast.warn(res.data.message);
        }
      })
      .catch((e) => {
        toast.warn(`Plan cancellation failed, please contact support!`);
        Logger.log(e);
      })
      .finally(() => {
        setIsLoading(false);
        closeModal();
        setReason("");
      });
  };

  return (
    <Modal
      width={600}
      open={isOpen}
      onCancel={closeModal}
      closable={!isIndividualPlanType}
      title={isIndividualPlanType ? "Cancel your plan" : "Send request to cancel your plan"}
      className="cancel-plan-modal"
      footer={
        <Row className="w-full" justify="end" gutter={8} align="middle">
          <RQButton type="default" onClick={closeModal}>
            Close
          </RQButton>
          <RQButton type="primary" loading={isLoading} danger onClick={handleRequestCancellation}>
            Send cancellation request
          </RQButton>
        </Row>
      }
    >
      <Col className="cancel-plan-modal-description">
        {isIndividualPlanType ? (
          <>
            Your <span className="text-white">{getPrettyPlanName(subscriptionDetails?.planName)} plan</span> will remain
            active until {getLongFormatDateString(new Date(endDate))}. You won't be charged for the next billing cycle
            and will automatically be switched to the Free plan thereafter.
          </>
        ) : (
          <>
            Once cancelled, your{" "}
            <span className="text-white">{getPrettyPlanName(subscriptionDetails?.planName)} plan</span> stays active
            until {getLongFormatDateString(new Date(subscriptionDetails?.subscriptionCurrentPeriodEnd * 1000))}. After
            that, all premium features won't be accessible to you.
          </>
        )}
      </Col>
      {isIndividualPlanType ? (
        <Col className="mt-16">
          <label className="text-bold text-white">Please let us know the reason for plan cancellation</label>
          <Input.TextArea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="cancel-plan-modal-textarea"
            maxLength={400}
          />
        </Col>
      ) : null}
    </Modal>
  );
};
