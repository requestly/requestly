import React, { useCallback, useState } from "react";
import { Col, Modal, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import "./index.scss";

interface Props {
  isOpen: boolean;
  subscriptionDetails: any;
  closeModal: () => void;
}

export const CancelPlanModal: React.FC<Props> = ({ isOpen, closeModal, subscriptionDetails }) => {
  // const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCancellation = useCallback(() => {
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
  }, [closeModal, subscriptionDetails?.plan]);

  return (
    <Modal
      width={600}
      open={isOpen}
      onCancel={closeModal}
      title="Send request to cancel your plan"
      className="cancel-plan-modal"
      footer={
        <Row className="w-full" justify="space-between" align="middle">
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
        Once cancelled, your <span className="text-white">{getPrettyPlanName(subscriptionDetails?.plan)} plan</span>{" "}
        stays active until {getLongFormatDateString(new Date(subscriptionDetails.subscriptionCurrentPeriodEnd * 1000))}.
        After that, all premium features won't be accessible to you. We highly recommend you to export your rules/data
        before cancelling.
      </Col>
      {/* <Col className="mt-16">
        <label className="text-bold text-white">Please let us know the reason for plan cancellation (Optional)</label>
        <Input.TextArea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="cancel-plan-modal-textarea"
          style={{ height: 80, resize: "none" }}
        />
      </Col> */}
    </Modal>
  );
};
