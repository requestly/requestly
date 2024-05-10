import { useParams } from "react-router-dom";
import React, { useMemo, useState } from "react";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { Col, Drawer, Row } from "antd";
import { AddMembersTable } from "./components/AddMembersTable/AddMembersTable";
import { useFetchOrgMembers } from "features/settings/components/OrgMembers/hooks/useFetchOrganizationMembers";
import { RQButton } from "lib/design-system/components";
import { MdArrowBack } from "@react-icons/all-files/md/MdArrowBack";
import { InviteMembersForm } from "./components/InviteMembersForm/InviteMembersForm";
import { useSelector } from "react-redux";
import { getBillingTeamById } from "store/features/billing/selectors";
import { BillingTeamMemberStatus } from "features/settings/components/BillingTeam/types";
import { getDomainFromEmail } from "utils/FormattingHelper";
import "./addMembersDrawer.scss";

interface AppMembersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppMembersDrawer: React.FC<AppMembersDrawerProps> = ({ isOpen, onClose }) => {
  const [searchValue, setSearchValue] = useState("");
  const { isLoading, organizationMembers } = useFetchOrgMembers();
  const [isInviteFormVisible, setIsInviteFormVisible] = useState(false);
  const { billingId } = useParams();
  const billingTeamDetails = useSelector(getBillingTeamById(billingId));

  const tableRecords = useMemo(() => {
    const records = organizationMembers || [];
    console.log("billingTeamDetails", records);

    billingTeamDetails?.pendingMembers.forEach((pendingMemberEmail) => {
      records.push({
        email: pendingMemberEmail,
        status: BillingTeamMemberStatus.PENDING,
        domain: getDomainFromEmail(pendingMemberEmail),
      });
    });

    return records;
  }, [billingTeamDetails.pendingMembers, organizationMembers]);

  return (
    <Drawer
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={640}
      closeIcon={null}
      mask={false}
      className="billing-team-members-drawer"
    >
      <Row className="billing-team-members-drawer-header w-full" justify="space-between" align="middle">
        <Col className="billing-team-members-drawer-header_title">
          {isInviteFormVisible ? (
            <div className="display-flex items-center" style={{ gap: "6px" }}>
              <RQButton
                size="small"
                type="text"
                iconOnly
                icon={<MdArrowBack className="billing-team-members-drawer-back-btn" />}
                onClick={() => setIsInviteFormVisible(false)}
              />
              Invite & add to billing team
            </div>
          ) : (
            "Add members in billing team"
          )}
        </Col>
        <Col>
          <IoMdClose onClick={onClose} />
        </Col>
      </Row>
      <Col className="billing-team-members-drawer-body">
        {isInviteFormVisible ? (
          <InviteMembersForm
            toggleInviteFormVisibility={() => setIsInviteFormVisible(!isInviteFormVisible)}
            closeAddMembersDrawer={onClose}
            billingId={billingId}
          />
        ) : (
          <AddMembersTable
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            isLoading={isLoading}
            members={tableRecords}
            toggleInviteFormVisibility={() => setIsInviteFormVisible(!isInviteFormVisible)}
          />
        )}
      </Col>
    </Drawer>
  );
};
