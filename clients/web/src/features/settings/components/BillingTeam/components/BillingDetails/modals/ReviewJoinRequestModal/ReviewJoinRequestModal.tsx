import React, { useCallback, useEffect, useState } from "react";
import { trackBillingTeamAccessRequestResponded } from "features/settings/analytics";
import { BillingTeamJoinRequestAction } from "../../types";
import { PiWarningDiamondBold } from "@react-icons/all-files/pi/PiWarningDiamondBold";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { MdWarningAmber } from "@react-icons/all-files/md/MdWarningAmber";
import { RQButton } from "lib/design-system/components";
import { BillingTeamActionModal } from "../common/BillingTeamActionModal/BillingTeamActionModal";
import { reviewBillingTeamJoiningRequest } from "backend/billing/reviewJoinRequest";
import { LOGGER as Logger } from "@requestly/utils";

interface ReviewJoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingId: string;
  userId: string;
  requestAction: BillingTeamJoinRequestAction;
}

enum ReviewResultMessage {
  INVALID_ARGS = "invalid-args",
  NO_BILLING_TEAM_FOUND = "no-billing-team-found",
  NO_USER_FOUND = "no-user-found",
  NOT_A_MEMBER = "not-a-member",
  NO_ADMIN_ACCESS = "no-admin-access",
  EXISTING_MEMBER = "existing-member",
  REQUEST_APPROVED = "request-approved",
  ERROR_ADDING_USER = "error-adding-user",
  REQUEST_DECLINED = "request-declined",
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
    if (!isOpen) {
      return;
    }

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
  }, [isOpen, billingId, requestAction, userId, isActionCompleted]);

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

  const getResultTitle = useCallback(() => {
    switch (reviewResult?.result?.message) {
      case ReviewResultMessage.REQUEST_APPROVED:
        return "Joining request approved";
      case ReviewResultMessage.REQUEST_DECLINED:
        return "Joining request declined";
      case ReviewResultMessage.EXISTING_MEMBER:
        return "Member already added";
      default:
        return "The request cannot be processed";
    }
  }, [reviewResult?.result?.message]);

  const getResultMessage = useCallback(() => {
    switch (reviewResult?.result?.message) {
      case ReviewResultMessage.REQUEST_APPROVED:
        return <>{reviewResult?.result?.userName ?? "User"} has been assigned a license.</>;
      case ReviewResultMessage.REQUEST_DECLINED:
        return <>{reviewResult?.result?.userName ?? "User"} has not been assigned a license.</>;
      case ReviewResultMessage.EXISTING_MEMBER:
        return <>{reviewResult?.result?.userName ?? "User"} is already having a license.</>;
      case ReviewResultMessage.NO_ADMIN_ACCESS:
        return "Only admins or billing managers can accept/decline requests.";
      case ReviewResultMessage.NO_USER_FOUND:
        return (
          <>
            User not found. Please reach out to us at <a href="mailto:contact@requestly.io">contact@requestly.io</a> for
            assistance.
          </>
        );
      default:
        return (
          <>
            The billing team was not found. Please reach out to us at{" "}
            <a href="mailto:contact@requestly.io">contact@requestly.io</a> for assistance.
          </>
        );
    }
  }, [reviewResult?.result?.message, reviewResult?.result?.userName]);

  return (
    <BillingTeamActionModal
      width={350}
      centered
      open={isOpen}
      wrapClassName="custom-rq-modal review-request-modal"
      onCancel={onClose}
      closable={false}
      maskClosable={false}
      title={
        isLoading ? null : (
          <>
            {getReviewResultIcon(reviewResult?.result?.status)} {getResultTitle()}
          </>
        )
      }
      footer={
        isLoading ? null : (
          <RQButton block type="primary" onClick={onClose}>
            Okay!
          </RQButton>
        )
      }
      isLoading={isLoading}
      loadingText={`${
        requestAction === BillingTeamJoinRequestAction.ACCEPT ? "Approving" : "Declining"
      } joining request ...`}
      result={reviewResult ? getResultMessage() : null}
    />
  );
};
