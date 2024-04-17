import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import { trackBillingTeamAccessRequestResponded } from "features/settings/analytics";
import { getFunctions, httpsCallable } from "firebase/functions";
import { BillingTeamJoinRequestAction } from "../../types";
import Logger from "../../../../../../../../../../common/logger";
import "./ReviewJoinRequestModal.scss";

interface ReviewJoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingId: string;
  userId: string;
  requestAction: BillingTeamJoinRequestAction;
}

export const ReviewJoinRequestModal: React.FC<ReviewJoinRequestModalProps> = ({
  isOpen,
  onClose,
  billingId,
  userId,
  requestAction,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    trackBillingTeamAccessRequestResponded(requestAction, "loading");
    const reviewBillingTeamJoiningRequest = httpsCallable(getFunctions(), "billing-reviewBillingTeamJoiningRequest");
    reviewBillingTeamJoiningRequest({
      billingId,
      action: requestAction,
      userId,
    })
      .then((res: any) => {
        setResult(res.data);
        trackBillingTeamAccessRequestResponded(requestAction, res.data.result.status);
        Logger.log("Billing team joining request reviewed");
      })
      .catch((err: any) => {
        trackBillingTeamAccessRequestResponded(requestAction, "error");
        Logger.log("Error while reviewing billing team joining request");
      })
      .finally(() => {
        // setIsLoading(false);
      });
  }, [billingId, requestAction, userId]);

  console.log("result", result);

  return (
    <Modal
      centered
      open={isOpen}
      wrapClassName="custom-rq-modal"
      onCancel={onClose}
      closable={!isLoading}
      footer={isLoading ? null : <></>}
    >
      HELLO
    </Modal>
  );
};
