import React, { useCallback, useEffect, useState } from "react";
import { Col } from "antd";
import { useParams } from "react-router-dom";
import { RQButton } from "lib/design-system/components";
import { fetchBillingInformation } from "backend/billing";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import { HiOutlineExternalLink } from "@react-icons/all-files/hi/HiOutlineExternalLink";
import "./index.scss";

export const BillingInformation: React.FC = () => {
  const { billingId } = useParams();

  const [billingInformation, setBillingInformation] = useState(null);
  const [isUpdatingBillingInfo, setIsUpdatingBillingInfo] = useState(false);
  const [isUpdatingPaymentMethod, setIsUpdatingPaymentMethod] = useState(false);

  useEffect(() => {
    fetchBillingInformation(billingId)
      .then((res) => {
        setBillingInformation(res);
      })
      .catch((e) => {
        setBillingInformation(null);
      });
  }, [billingId]);

  const redirectToUpdateInfo = useCallback(async () => {
    const manageSubscription = httpsCallable(getFunctions(), "subscription-manageSubscription");
    return manageSubscription({
      portalFlowType: "update_payment_method",
    })
      .then((res: any) => {
        if (res?.data?.success) {
          window.open(res?.data?.data?.portalUrl, "_blank");
        }
      })
      .catch((err) => {
        toast.error("Error in managing subscription. Please contact support contact@requestly.io");
      });
  }, []);

  if (!billingInformation) return null;

  return (
    <Col className="billing-teams-primary-card team-billing-info-card">
      <div className="team-billing-info-section">
        <div className="text-bold text-white mb-16">
          Billing information
          <RQButton
            type="text"
            size="small"
            onClick={() => {
              setIsUpdatingBillingInfo(true);
              redirectToUpdateInfo().finally(() => setIsUpdatingBillingInfo(false));
            }}
            loading={isUpdatingBillingInfo}
          >
            <div className="text-gray team-billing-info-btn-text">
              Update
              <HiOutlineExternalLink />
            </div>
          </RQButton>
        </div>
        <p>{billingInformation.name}</p>
        <p>{billingInformation.billingAddress || `No Billing address has been set`}</p>
      </div>
      <div className="team-billing-info-section">
        <div className="text-bold text-white mb-16">
          Payment Method
          <RQButton
            type="text"
            size="small"
            onClick={() => {
              setIsUpdatingPaymentMethod(true);
              redirectToUpdateInfo().finally(() => setIsUpdatingPaymentMethod(false));
            }}
            loading={isUpdatingPaymentMethod}
          >
            <div className="text-gray team-billing-info-btn-text">
              Update
              <HiOutlineExternalLink />
            </div>
          </RQButton>
        </div>
        <p className="text-capitalize">{billingInformation.paymentMethod.type}</p>
        {billingInformation.paymentMethod.last4 && (
          <p>{`Number ending with ${billingInformation.paymentMethod.last4}`}</p>
        )}
        {billingInformation.paymentMethod.expiryDate && (
          <p>{`Expiring on ${billingInformation.paymentMethod.expiryDate}`}</p>
        )}
      </div>
    </Col>
  );
};
