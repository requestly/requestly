import React, { useCallback, useState } from "react";
import { Col, Input, Modal, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import { trackPricingPlanCancelled } from "modules/analytics/events/misc/business";
import "./index.scss";
import { useParams } from "react-router-dom";
import { cancelSubscription } from "backend/billing";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  currentPlanName: string;
  currentPlanEndDate: string | number;
  billingTeamQuantity: number;
}

export const CancelPlanModal: React.FC<Props> = ({
  isOpen,
  closeModal,
  billingTeamQuantity,
  currentPlanName,
  currentPlanEndDate,
}) => {
  const { billingId } = useParams();

  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isIndividualBilling = billingTeamQuantity === 1;

  const handleRequestCancellation = useCallback(() => {
    if (isIndividualBilling) {
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

    cancelSubscription({
      reason,
      currentPlan: getPrettyPlanName(currentPlanName),
      billingId: billingId,
    })
      .then((res) => {
        if (res.data.success) {
          trackPricingPlanCancelled({
            reason,
            type: isIndividualBilling ? "individual" : "team",
            end_date: currentPlanEndDate,
            current_plan: currentPlanName,
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
  }, [isIndividualBilling, reason, currentPlanName, billingId, currentPlanEndDate, closeModal]);

  return (
    <Modal
      width={600}
      open={isOpen}
      onCancel={closeModal}
      closable={!isIndividualBilling}
      title={isIndividualBilling ? "Cancel your plan" : "Send request to cancel your plan"}
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
        {isIndividualBilling ? (
          <>
            Your <span className="text-white">{getPrettyPlanName(currentPlanName)} plan</span> will remain active until{" "}
            {getLongFormatDateString(new Date(currentPlanEndDate))}. You won't be charged for the next billing cycle and
            will automatically be switched to the Free plan thereafter.
          </>
        ) : (
          <>
            Once cancelled, your <span className="text-white">{getPrettyPlanName(currentPlanName)} plan</span> stays
            active until {getLongFormatDateString(new Date(currentPlanEndDate))}. After that, all premium features won't
            be accessible to you.
          </>
        )}
      </Col>
      {isIndividualBilling ? (
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
