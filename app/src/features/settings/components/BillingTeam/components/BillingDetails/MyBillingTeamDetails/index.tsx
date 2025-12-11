import React, { useMemo, useState } from "react";
import { Alert, Col } from "antd";
import { TeamPlanDetails } from "./components/TeamPlanDetails";
import { BillingTeamMembers } from "./components/BillingTeamMembers";
import { BillingInvoiceCard } from "./components/BillingInvoiceCard";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getBillingTeamById } from "store/features/billing/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { BillingTeamRoles, PlanType } from "../../../types";
import { BillingInformation } from "./components/BillingInformation";
import { AppMembersDrawer } from "./components/AddMembersDrawer/AddMembersDrawer";

export const MyBillingTeamDetails: React.FC = () => {
  const { billingId } = useParams();

  const user = useSelector(getUserAuthDetails);
  const billingTeamDetails = useSelector(getBillingTeamById(billingId));
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);

  const showBillingActions = useMemo(
    () =>
      !(
        [PlanType.STUDENT, PlanType.SIGNUP_TRIAL, PlanType.GITHUB_STUDENT_PACK].includes(
          billingTeamDetails?.subscriptionDetails?.rqSubscriptionType
        ) || billingTeamDetails?.subscriptionDetails?.plan === "lite"
      ) ||
      billingTeamDetails?.browserstackGroupId ||
      Object.keys(billingTeamDetails?.members || {}).length > 1,
    [
      billingTeamDetails?.subscriptionDetails?.rqSubscriptionType,
      billingTeamDetails?.subscriptionDetails?.plan,
      billingTeamDetails?.browserstackGroupId,
      billingTeamDetails?.members,
    ]
  );

  if (!billingTeamDetails) {
    return null;
  }

  return (
    <div className="display-row-center w-full">
      <div className="w-full" style={{ maxWidth: "1000px" }}>
        {billingTeamDetails?.migratedToBrowserstack && (
          <Alert
            type="warning"
            description={
              <>
                Subscription renewal for this billing team is under process right now. If you want to make any
                modifications, please reach out to us at <b>support@requestly.io</b>
              </>
            }
            style={{ marginBottom: "12px" }}
          />
        )}
        <Col className="my-billing-team-title">{billingTeamDetails.name}</Col>
        <Col className="mt-8">
          <TeamPlanDetails billingTeamDetails={billingTeamDetails} />
        </Col>
        {showBillingActions && (
          <>
            <Col style={{ marginTop: "24px" }}>
              <BillingTeamMembers openDrawer={() => setIsMembersDrawerOpen(true)} />
            </Col>
            {billingTeamDetails.members?.[user?.details?.profile?.uid as string]?.role !== BillingTeamRoles.Member && (
              <Col style={{ marginTop: "24px" }}>
                <BillingInvoiceCard />
              </Col>
            )}
            {billingTeamDetails.members?.[user?.details?.profile?.uid as string]?.role === BillingTeamRoles.Manager &&
              !billingTeamDetails.browserstackGroupId && (
                <Col style={{ marginTop: "24px" }}>
                  <BillingInformation />
                </Col>
              )}

            <AppMembersDrawer isOpen={isMembersDrawerOpen} onClose={() => setIsMembersDrawerOpen(false)} />
          </>
        )}
      </div>
    </div>
  );
};
