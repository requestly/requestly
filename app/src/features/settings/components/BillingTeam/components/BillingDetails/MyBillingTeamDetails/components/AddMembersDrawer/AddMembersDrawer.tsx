import { useParams } from "react-router-dom";
import React, { useState } from "react";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { Col, Drawer, Row } from "antd";
import { AddMembersTable } from "./components/AddMembersTable/AddMembersTable";
import { useFetchOrgMembers } from "features/settings/components/OrgMembers/hooks/useFetchOrganizationMembers";
import { RQButton } from "lib/design-system/components";
import { MdArrowBack } from "@react-icons/all-files/md/MdArrowBack";
import { InviteMembersForm } from "./components/InviteMembersForm/InviteMembersForm";
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
            members={organizationMembers}
            toggleInviteFormVisibility={() => setIsInviteFormVisible(!isInviteFormVisible)}
          />
        )}
      </Col>
    </Drawer>
  );
};
