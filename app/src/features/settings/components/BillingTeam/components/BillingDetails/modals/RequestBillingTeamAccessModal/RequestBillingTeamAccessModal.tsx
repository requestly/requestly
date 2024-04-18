import React, { useEffect, useState } from "react";
import { BillingTeamActionModal } from "../common/BillingTeamActionModal/BillingTeamActionModal";
import { requestBillingTeamAccess } from "backend/billing/requestTeamAccess";
import { RQButton } from "lib/design-system/components";
import { PiWarningDiamondBold } from "@react-icons/all-files/pi/PiWarningDiamondBold";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import Logger from "../../../../../../../../../../common/logger";

interface RequestBillingTeamAccessModalProps {
  billingId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RequestBillingTeamAccessModal: React.FC<RequestBillingTeamAccessModalProps> = ({
  billingId,
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isActionCompleted, setIsActionCompleted] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const getPostRequestResult = () => {
    if (isActionCompleted) {
      if (isRequestSent) {
        return "Your request has been successfully sent to team manager and admin. They will review and respond to your request soon.";
      } else {
        return "Something went wrong, we couldn't send the request. Please try again later.";
      }
    }
  };

  useEffect(() => {
    requestBillingTeamAccess(billingId)
      .then(() => {
        setIsRequestSent(true);
      })
      .catch(() => {
        Logger.log("Error while requesting billing team access");
      })
      .finally(() => {
        setIsActionCompleted(true);
        setIsLoading(false);
      });
  }, [billingId]);

  return (
    <BillingTeamActionModal
      centered
      width={400}
      isLoading={isLoading}
      open={isOpen}
      onCancel={onClose}
      closable={false}
      maskClosable={false}
      title={
        isLoading ? null : (
          <>
            {isRequestSent ? <MdCheckCircleOutline className="success" /> : <PiWarningDiamondBold className="danger" />}{" "}
            Request billing team access
          </>
        )
      }
      loadingText="Requesting access to billing team..."
      result={getPostRequestResult()}
      footer={
        isLoading ? null : (
          <RQButton block type="primary" onClick={onClose}>
            Okay
          </RQButton>
        )
      }
    />
  );
};
