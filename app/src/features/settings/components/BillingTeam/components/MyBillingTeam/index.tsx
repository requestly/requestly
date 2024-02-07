import React, { useEffect, useState } from "react";
import { Col, Drawer, Row } from "antd";
import { TeamPlanDetails } from "./components/TeamPlanDetails";
import { BillingTeamMembers } from "./components/BillingTeamMembers";
import { BillingInvoiceTable } from "./components/BillingInvoiceTable";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAvailableBillingTeams, getBillingTeamById } from "store/features/billing/selectors";
import { getUserAuthDetails } from "store/selectors";
import { BillingTeamRoles } from "../../types";
import { isCompanyEmail } from "utils/FormattingHelper";
import { trackBillingTeamViewed } from "features/settings/analytics";
import { BillingInformation } from "./components/BillingInformation";
import { OrgMembersTable } from "features/settings/components/OrgMembersTable";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import "./index.scss";

export const MyBillingTeam: React.FC = () => {
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
    <>
      <Col className="my-billing-team-title">{billingTeamDetails.name}</Col>
      <Col className="mt-8">
        <TeamPlanDetails billingTeamDetails={billingTeamDetails} />
      </Col>
      <Col style={{ marginTop: "24px" }}>
        <BillingTeamMembers openDrawer={() => setIsMembersDrawerOpen(true)} />
      </Col>
      {billingTeamDetails.members?.[user?.details?.profile?.uid]?.role !== BillingTeamRoles.Member && (
        <Col style={{ marginTop: "24px" }}>
          <BillingInvoiceTable />
        </Col>
      )}
      {billingTeamDetails.members?.[user?.details?.profile?.uid]?.role === BillingTeamRoles.Manager && (
        <Col style={{ marginTop: "24px" }}>
          <BillingInformation />
        </Col>
      )}

      <Drawer
        placement="right"
        onClose={() => setIsMembersDrawerOpen(false)}
        open={isMembersDrawerOpen}
        width={640}
        closeIcon={null}
        mask={false}
        className="billing-team-members-drawer"
      >
        <Row className="billing-team-members-drawer-header w-full" justify="space-between" align="middle">
          <Col className="billing-team-members-drawer-header_title">Add members in billing team</Col>
          <Col>
            <IoMdClose onClick={() => setIsMembersDrawerOpen(false)} />
          </Col>
        </Row>
        <Col className="billing-team-members-drawer-body">
          <OrgMembersTable source="add_members_section" />
        </Col>
        <Row className="mt-8 billing-team-members-drawer-help" justify="space-between" align="middle">
          <Col>
            Couldn't find member?{" "}
            <a className="external-link" href="mailto:contact@requestly.io">
              Contact us
            </a>
            , and we'll assist you in adding your team members.
          </Col>
        </Row>
      </Drawer>
    </>
  );
};
