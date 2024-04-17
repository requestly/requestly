import React, { useCallback, useEffect, useState } from "react";
import { trackBillingTeamAccessRequestResponded } from "features/settings/analytics";
import { BillingTeamJoinRequestAction } from "../../types";
import { PiWarningDiamondBold } from "@react-icons/all-files/pi/PiWarningDiamondBold";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { MdWarningAmber } from "@react-icons/all-files/md/MdWarningAmber";
import { RQButton } from "lib/design-system/components";
import { BillingTeamActionModal } from "../../components/BillingTeamActionModal/BillingTeamActionModal";
import { reviewBillingTeamJoiningRequest } from "backend/billing/reviewJoinRequest";
import Logger from "../../../../../../../../../../common/logger";

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
      reviewBillingTeamJoiningRequest(billingId, requestAction, userId)
        .then((res: any) => {
          setReviewResult(res.data);
          trackBillingTeamAccessRequestResponded(requestAction, res.data.result.status);
          Logger.log("Billing team joining request reviewed");
        })
        .catch(() => {
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
    <BillingTeamActionModal
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
      isLoading={isLoading}
      loadingText={`${
        requestAction === BillingTeamJoinRequestAction.ACCEPT ? "Acepting" : "Declining"
      } joining request ...`}
      result={reviewResult?.message}
    />
  );
};
