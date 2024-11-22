import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import React, { useMemo, useState } from "react";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { Col, Drawer, Row } from "antd";
import { AddMembersTable } from "./components/AddMembersTable/AddMembersTable";
import { useFetchOrgMembers } from "features/settings/components/OrgMembers/hooks/useFetchOrganizationMembers";
import { RQButton } from "lib/design-system/components";
import { MdArrowBack } from "@react-icons/all-files/md/MdArrowBack";
import { InviteMembersForm } from "./components/InviteMembersForm/InviteMembersForm";
import { getBillingTeamById, getBillingTeamMembers } from "store/features/billing/selectors";
import { BillingTeamMemberStatus } from "features/settings/components/BillingTeam/types";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { AddMembersDrawerRecord } from "./types";
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
  const billingTeamMembers = useSelector(getBillingTeamMembers(billingId));

  const handleDrawerClose = () => {
    setSearchValue("");
    setIsInviteFormVisible(false);
    onClose();
  };

  const tableRecords = useMemo(() => {
    /*
      Add members drawer table consists records from 3 sources:
      1. External domain members
      2. Organization members
      3. Pending members
    */

    const externalDomainMembers =
      Object.values(billingTeamMembers)
        .filter((member) => {
          return !billingTeamDetails?.ownerDomains?.includes(getDomainFromEmail(member.email));
        })
        .map((member) => {
          return {
            email: member.email,
            domain: member.domain,
          };
        }) || [];

    const orgMembers = organizationMembers || [];

    const newRecords: AddMembersDrawerRecord[] = [...externalDomainMembers, ...orgMembers];

    if (billingTeamDetails?.pendingMembers) {
      Object.keys(billingTeamDetails?.pendingMembers)?.forEach((email) => {
        newRecords.push({
          email: email,
          status: BillingTeamMemberStatus.PENDING,
          domain: getDomainFromEmail(email),
        });
      });
    }

    return newRecords;
  }, [billingTeamDetails?.pendingMembers, organizationMembers, billingTeamMembers, billingTeamDetails?.ownerDomains]);

  return (
    <Drawer
      placement="right"
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
              Invite & assign license
            </div>
          ) : (
            <>Assign licenses</>
          )}
        </Col>
        <Col>
          <IoMdClose onClick={handleDrawerClose} />
        </Col>
      </Row>
      <Col className="billing-team-members-drawer-body">
        {isInviteFormVisible ? (
          <InviteMembersForm
            toggleInviteFormVisibility={() => setIsInviteFormVisible(!isInviteFormVisible)}
            closeAddMembersDrawer={onClose}
            billingId={billingId}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
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
