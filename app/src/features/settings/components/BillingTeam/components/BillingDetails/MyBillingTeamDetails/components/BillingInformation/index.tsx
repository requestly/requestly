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
        <div className="text-bold text-white mb-16 team-billing-info-header">
          Billing information
          <RQButton
            type="text"
            size="small"
            onClick={() => {
              setIsUpdatingBillingInfo(true);
              redirectToUpdateInfo().finally(() => setIsUpdatingBillingInfo(false));
            }}
            loading={isUpdatingBillingInfo}
            className="team-billing-info-header-btn"
          >
            <div className="text-gray team-billing-info-btn-text">
              Update
              <HiOutlineExternalLink />
            </div>
          </RQButton>
        </div>
        <div className="text-white">{billingInformation.name}</div>
        <div className="text-white mt-8">{billingInformation.billingAddress || `No Billing address has been set`}</div>
      </div>
      <div className="team-billing-info-section">
        <div className="text-bold text-white mb-16 team-billing-info-header">
          Payment Method
          <RQButton
            type="text"
            size="small"
            onClick={() => {
              setIsUpdatingPaymentMethod(true);
              redirectToUpdateInfo().finally(() => setIsUpdatingPaymentMethod(false));
            }}
            loading={isUpdatingPaymentMethod}
            className="team-billing-info-header-btn"
          >
            <div className="text-gray team-billing-info-btn-text">
              Update
              <HiOutlineExternalLink />
            </div>
          </RQButton>
        </div>
        <div className="text-capitalize caption text-white">
          {billingInformation.paymentMethod ? billingInformation.paymentMethod.type : "No payment method has been set"}
        </div>
        {billingInformation.paymentMethod?.last4 && (
          <div className="text-white mt-8">{`Number ending with ${billingInformation.paymentMethod.last4}`}</div>
        )}
        {billingInformation.paymentMethod?.expiryDate && (
          <div className="text-white mt-8">{`Expiring on ${billingInformation.paymentMethod.expiryDate}`}</div>
        )}
      </div>
    </Col>
  );
};
