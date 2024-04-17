import React, { useCallback, useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { trackBillingTeamAccessRequestResponded } from "features/settings/analytics";
import { getFunctions, httpsCallable } from "firebase/functions";
import { BillingTeamJoinRequestAction } from "../../types";
import { LoadingOutlined } from "@ant-design/icons";
import { PiWarningDiamondBold } from "@react-icons/all-files/pi/PiWarningDiamondBold";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { MdWarningAmber } from "@react-icons/all-files/md/MdWarningAmber";
import { RQButton } from "lib/design-system/components";
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
  const [reviewResult, setReviewResult] = useState(null);
  const [isActionCompleted, setIsActionCompleted] = useState(false);

  useEffect(() => {
    if (!isActionCompleted) {
      trackBillingTeamAccessRequestResponded(requestAction, "loading");
      const reviewBillingTeamJoiningRequest = httpsCallable(getFunctions(), "billing-reviewBillingTeamJoiningRequest");
      reviewBillingTeamJoiningRequest({
        billingId,
        action: requestAction,
        userId,
      })
        .then((res: any) => {
          setReviewResult(res.data);
          trackBillingTeamAccessRequestResponded(requestAction, res.data.result.status);
          Logger.log("Billing team joining request reviewed");
        })
        .catch((err) => {
          trackBillingTeamAccessRequestResponded(requestAction, "error");
          Logger.log("Error while reviewing billing team joining request");
        })
        .finally(() => {
          setIsLoading(false);
          setIsActionCompleted(true);
        });
    }
  }, [billingId, requestAction, userId, isActionCompleted]);

  const getReviewResultIcon = useCallback((status: string) => {
    switch (status) {
      case "success":
        return <MdCheckCircleOutline className="success" />;
      case "error":
        return <PiWarningDiamondBold className="danger" />;
      case "warning":
        return <MdWarningAmber className="warning" />;
      default:
        return null;
    }
  }, []);

  return (
    <Modal
      width={320}
      centered
      open={isOpen}
      wrapClassName="custom-rq-modal review-request-modal"
      onCancel={onClose}
      closable={false}
      maskClosable={false}
      title={isLoading ? null : <>{getReviewResultIcon(reviewResult?.result?.status)} Review joining request</>}
      footer={
        isLoading ? null : (
          <RQButton block type="primary" onClick={onClose}>
            Okay!
          </RQButton>
        )
      }
    >
      <div className="review-request-content-container">
        <div className="review-request-content">
          {isLoading && (
            <div className="review-request-loader-container">
              <Spin indicator={<LoadingOutlined spin className="review-request-loader" />} />
              <span className="review-request-loader-text">
                {requestAction === BillingTeamJoinRequestAction.ACCEPT ? "Acepting" : "Declining"} joining request ...
              </span>
            </div>
          )}

          {reviewResult && <div className="review-request-result-text">{reviewResult.message}</div>}
        </div>
      </div>
    </Modal>
  );
};
