import React, { useEffect, useState } from "react";
import { Divider } from "antd";
import InvoiceTable from "./InvoiceTable";
import SubscriptionActionButtons from "./SubscriptionActionButtons";
import SpinnerColumn from "../../../../../../misc/SpinnerColumn";
import { getFunctions, httpsCallable } from "firebase/functions";
import BillingFooter from "./BillingFooter";
import { toast } from "utils/Toast.js";
import APP_CONSTANTS from "config/constants";
import "./BillingDetails.css";

// Common Component for Team & Individual Payments
const BillingDetails = ({ teamId, isTeamAdmin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState({});

  useEffect(() => {
    setIsLoading(true);

    const functions = getFunctions();
    const getTeamSubscriptionInfo = httpsCallable(
      functions,
      "getTeamSubscriptionInfo"
    );

    getTeamSubscriptionInfo({
      teamId: teamId,
    })
      .then((res) => {
        setSubscriptionInfo(res.data);
      })
      .catch(() => {
        toast.error(
          "You might not have permission to manage the team members."
        );
      })
      .finally(() => setIsLoading(false));
  }, [teamId]);

  // const handleRedirectToUpdatePaymentMethod = () => {
  //   if (!subscriptionInfo.subscriptionStatus) return;

  //   redirectToUpdatePaymentMethod({
  //     mode: "team",
  //     teamId: teamId,
  //   });
  // };

  const isSubscriptionActive = subscriptionInfo.subscriptionStatus === "active";

  return isLoading ? (
    <SpinnerColumn skeletonCount={2} message="Fetching subscription details" />
  ) : isTeamAdmin ? (
    <div className="billing-details-container">
      <div className="title billing-title">Billing</div>
      {isSubscriptionActive ? (
        <p className="text-dark-gray billing-subscription-info">
          This workspace has an active subscription.
        </p>
      ) : (
        <p className="text-dark-gray billing-subscription-info">
          This workspace does not have an active subscription yet. <br />
          Subscribe to one of the plans to get started.
        </p>
      )}

      <SubscriptionActionButtons isSubscriptionActive={isSubscriptionActive} />

      <Divider className="manage-workspace-divider" />
      <div className="title billing-invoice-container">
        {isSubscriptionActive ? (
          <>
            <div className="title billing-invoices-title">Invoices</div>
            <p className="text-sm text-dark-gray">
              Note: you will be charged for each member added. Visit{" "}
              <a
                target="_blank"
                rel="noreferrer"
                className="workspace-billing-guide-link"
                href={APP_CONSTANTS.PATHS.PRICING.ABSOLUTE}
              >
                our guide
              </a>{" "}
              for more information on how we bill.
            </p>
            <InvoiceTable mode="team" teamId={teamId} />
          </>
        ) : (
          <>
            <div className="title billing-invoices-title">Invoices</div>
            <p className="text-sm text-dark-gray">
              This workspace has no invoices yet.
            </p>
          </>
        )}
      </div>
      <Divider className="manage-workspace-divider" />
      <BillingFooter />
    </div>
  ) : (
    <p className="billing-non-admin-message">
      Only admin can view the billing details.
    </p>
  );
};

export default BillingDetails;
