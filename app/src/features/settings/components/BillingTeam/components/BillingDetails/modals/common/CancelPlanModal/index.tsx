import React, { useCallback, useState } from "react";
import { Col, Input, Modal, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import { trackPricingPlanCancelled } from "modules/analytics/events/misc/business";
import "./index.scss";
import { useParams } from "react-router-dom";

interface Props {
  isOpen: boolean;
  subscriptionDetails: any;
  closeModal: () => void;
  isIndividualSubscription: boolean; //TODO:@nafees87n : prop to be removed after type in subscription details is migrated to reflect the correct subscriptions.
  // For now derive subscription type from subscription quantity
}

export const CancelPlanModal: React.FC<Props> = ({
  isOpen,
  closeModal,
  subscriptionDetails,
  isIndividualSubscription,
}) => {
  const { billingId } = useParams();

  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { subscription, planName } = subscriptionDetails ?? {};
  const endDate = subscription?.endDate;

  const handleRequestCancellation = useCallback(() => {
    if (isIndividualSubscription) {
      if (!reason) {
        toast.warn("Please let us know the reason for cancellation!");
        return;
      }

      if (reason.length <= 3) {
        toast.warn("Please enter a valid reason for cancellation!");
        return;
      }
    }

    setIsLoading(true);

    const cancelSubscription = httpsCallable<
      {
        reason: string;
        currentPlan: string;
        billingId: string;
      },
      {
        success: boolean;
        message: string;
      }
    >(getFunctions(), "subscription-cancelSubscription");

    cancelSubscription({
      reason,
      currentPlan: getPrettyPlanName(subscriptionDetails?.planName),
      billingId: billingId,
    })
      .then((res) => {
        if (res.data.success) {
          trackPricingPlanCancelled({
            reason,
            type: isIndividualSubscription ? "individual" : "team", // TODO@nafees87n: type from subscriptionDetails to be used some time.
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
  }, [billingId, closeModal, endDate, planName, reason, subscriptionDetails?.planName, isIndividualSubscription]);

  return (
    <Modal
      width={600}
      open={isOpen}
      onCancel={closeModal}
      closable={!isIndividualSubscription}
      title={isIndividualSubscription ? "Cancel your plan" : "Send request to cancel your plan"}
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
        {isIndividualSubscription ? (
          <>
            Your <span className="text-white">{getPrettyPlanName(subscriptionDetails?.planName)} plan</span> will remain
            active until {getLongFormatDateString(new Date(endDate))}. You won't be charged for the next billing cycle
            and will automatically be switched to the Free plan thereafter.
          </>
        ) : (
          <>
            Once cancelled, your{" "}
            <span className="text-white">{getPrettyPlanName(subscriptionDetails?.planName)} plan</span> stays active
            until {getLongFormatDateString(new Date(endDate))}. After that, all premium features won't be accessible to
            you.
          </>
        )}
      </Col>
      {isIndividualSubscription ? (
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
