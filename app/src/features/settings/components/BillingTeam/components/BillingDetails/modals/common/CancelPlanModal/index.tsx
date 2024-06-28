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

  const handleRequestCancellation = () => {
    if (isIndividualPlanType) {
      if (!reason) {
        toast.success("Please let us know the reason for cancellation!");
        return;
      }

      if (reason.length <= 3) {
        toast.success("Please enter a valid reason for cancellation!");
        return;
      }

      setIsLoading(true);

      const cancelIndividualSubscription = httpsCallable(getFunctions(), "subscription-cancelIndividualSubscription");

      cancelIndividualSubscription({ reason })
        .then((res) => {
          // @ts-ignore
          if (res?.data?.success) {
            const { subscription, type, planName } = subscriptionDetails;
            const endDate = subscription.endDate;

            trackPricingPlanCancelled({
              reason,
              type: type,
              end_date: endDate,
              current_plan: planName,
            });

            const formattedEndDate = getLongFormatDateString(new Date(endDate));
            toast.success(`Plan will automatically get cancelled on ${formattedEndDate}.`);
          } else {
            toast.warn(`Plan cancellation failed, please contact support!`);
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
    } else {
      setIsLoading(true);
      const requestPlanCancellation = httpsCallable(getFunctions(), "premiumNotifications-requestPlanCancellation");
      requestPlanCancellation({
        currentPlan: getPrettyPlanName(subscriptionDetails?.plan),
      })
        .then(() => {
          toast.success("Cancellation request sent successfully, we will get back to you soon.");
        })
        .catch((e) => {
          Logger.log(e);
        })
        .finally(() => {
          setIsLoading(false);
          closeModal();
        });
    }
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
            Your <span className="text-white">{getPrettyPlanName(subscriptionDetails?.plan)} plan</span> will remain
            active until
            {getLongFormatDateString(new Date(subscriptionDetails?.subscriptionCurrentPeriodEnd * 1000))}. You won't be
            charged for the next billing cycle and will automatically be switched to the Free plan thereafter.
          </>
        ) : (
          <>
            Once cancelled, your <span className="text-white">{getPrettyPlanName(subscriptionDetails?.plan)} plan</span>{" "}
            stays active until{" "}
            {getLongFormatDateString(new Date(subscriptionDetails?.subscriptionCurrentPeriodEnd * 1000))}. After that,
            all premium features won't be accessible to you.
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
            style={{ height: 80, resize: "none" }}
            maxLength={400}
          />
        </Col>
      ) : null}
    </Modal>
  );
};
