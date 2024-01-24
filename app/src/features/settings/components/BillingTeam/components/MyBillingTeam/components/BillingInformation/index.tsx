import React, { useEffect, useState } from "react";
import { Col } from "antd";
import { useParams } from "react-router-dom";
import "./index.scss";
import { RQButton } from "lib/design-system/components";
import { fetchBillingInformation } from "backend/billing";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";

export const BillingInformation: React.FC = () => {
  const { billingId } = useParams();

  const [billingInformation, setBillingInformation] = useState(null);

  useEffect(() => {
    fetchBillingInformation(billingId)
      .then((res) => {
        setBillingInformation(res);
      })
      .catch((e) => {
        setBillingInformation(null);
      });
  }, [billingId]);

  if (!billingInformation) return null;

  return (
    <Col className="billing-teams-primary-card team-billing-info-card">
      <div className="team-billing-info-section">
        <div className="text-bold text-white mb-16">
          Billing Information
          <RQButton type="text" size="small">
            Update
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
              const manageSubscription = httpsCallable(getFunctions(), "subscription-manageSubscription");
              manageSubscription({
                portalFlowType: "update_payment_method",
              })
                .then((res: any) => {
                  if (res?.data?.success) {
                    window.location.href = res?.data?.data?.portalUrl;
                  }
                })
                .catch((err) => {
                  toast.error("Error in managing subscription. Please contact support contact@requestly.io");
                });
            }}
          >
            Update
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
