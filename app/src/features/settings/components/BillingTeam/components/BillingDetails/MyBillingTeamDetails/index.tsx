import React, { useEffect, useState } from "react";
import { Col } from "antd";
import { TeamPlanDetails } from "./components/TeamPlanDetails";
import { BillingTeamMembers } from "./components/BillingTeamMembers";
import { BillingInvoiceCard } from "./components/BillingInvoiceCard";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAvailableBillingTeams, getBillingTeamById } from "store/features/billing/selectors";
import { getUserAuthDetails } from "store/selectors";
import { BillingTeamRoles } from "../../../types";
import { isCompanyEmail } from "utils/FormattingHelper";
import { trackBillingTeamViewed } from "features/settings/analytics";
import { BillingInformation } from "./components/BillingInformation";
import { AppMembersDrawer } from "./components/AddMembersDrawer/AddMembersDrawer";

export const MyBillingTeamDetails: React.FC = () => {
  const { billingId } = useParams();

  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const billingTeamDetails = useSelector(getBillingTeamById(billingId));
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);

  useEffect(() => {
    if (billingId && billingTeamDetails) {
      const emailStatus = !user.loggedIn
        ? "no_loggedIn"
        : isCompanyEmail(user.details.profile.email)
        ? "company_email"
        : "personal_email";
      trackBillingTeamViewed(
        emailStatus,
        billingTeams?.length,
        billingTeamDetails?.members[user?.details?.profile?.uid]?.role
      );
    }
  }, [
    billingId,
    billingTeamDetails,
    billingTeams?.length,
    user.loggedIn,
    user.details.profile.email,
    user.details.profile.uid,
  ]);

  if (!billingTeamDetails) return null;

  return (
    <div className="display-row-center w-full">
      <div className="w-full" style={{ maxWidth: "1000px" }}>
        <Col className="my-billing-team-title">{billingTeamDetails.name}</Col>
        <Col className="mt-8">
          <TeamPlanDetails billingTeamDetails={billingTeamDetails} />
        </Col>
        <Col style={{ marginTop: "24px" }}>
          <BillingTeamMembers openDrawer={() => setIsMembersDrawerOpen(true)} />
        </Col>
        {billingTeamDetails.members?.[user?.details?.profile?.uid]?.role !== BillingTeamRoles.Member && (
          <Col style={{ marginTop: "24px" }}>
            <BillingInvoiceCard />
          </Col>
        )}
        {billingTeamDetails.members?.[user?.details?.profile?.uid]?.role === BillingTeamRoles.Manager && (
          <Col style={{ marginTop: "24px" }}>
            <BillingInformation />
          </Col>
        )}

        <AppMembersDrawer isOpen={isMembersDrawerOpen} onClose={() => setIsMembersDrawerOpen(false)} />
      </div>
    </div>
  );
};
