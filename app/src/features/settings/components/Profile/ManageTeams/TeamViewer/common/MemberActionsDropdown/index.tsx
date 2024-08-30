import React, { useCallback, useMemo, useState } from "react";
import { Dropdown, DropDownProps, Menu, Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./memberActionsDropdown.css";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import { HiOutlineDotsVertical } from "@react-icons/all-files/hi/HiOutlineDotsVertical";
import RemoveUserModal from "../../MembersDetails/TeamMembersTable/RemoveUserModal";

interface MemberActionsDropdownProps extends DropDownProps {
  teamId: string;
  isCurrentUserAdmin: boolean;
  isHoverEffect?: boolean;
  showLoader?: boolean;
  isLoggedInUserAdmin?: boolean;
  member: any;
  fetchTeamMembers: () => void;
}

const MemberActionsDropdown: React.FC<MemberActionsDropdownProps> = ({
  teamId,
  showLoader,
  isCurrentUserAdmin,
  member,
  isHoverEffect = false,
  isLoggedInUserAdmin = false,
  fetchTeamMembers,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userIdToRemove, setUserIdToRemove] = useState(null);
  const [isRemoveUserModalOpen, setIsRemoveUserModalOpen] = useState(false);

  const handleRevokeInvite = () => {
    const functions = getFunctions();
    const revokeInvite = httpsCallable(functions, "invites-revokeInvite");
    setIsLoading(true);
    revokeInvite({ inviteId: member.inviteId })
      .then((res: any) => {
        if (res?.data?.success) {
          toast.success("Successfully Revoked invite");
          fetchTeamMembers();
        } else {
          toast.error("Only admins can revoke invites");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        toast.error("Only admins can revoke invites");
      });
  };

  const stableHandleRevokeInvite = useCallback(handleRevokeInvite, [member.inviteId, fetchTeamMembers]);

  const items = useMemo(
    () => (
      <Menu className="dropdown-menu">
        {member.isPending && (
          <Menu.Item key="revoke" onClick={() => stableHandleRevokeInvite()} disabled={!isCurrentUserAdmin}>
            <Typography.Text
              className="remove-user-menu-item-text"
              type={isCurrentUserAdmin ? "danger" : null}
              disabled={!isCurrentUserAdmin}
            >
              Revoke Invite
            </Typography.Text>
          </Menu.Item>
        )}
        {!member.isPending && (
          <Menu.Item
            key="remove"
            onClick={() => {
              setUserIdToRemove(member.id);
              setIsRemoveUserModalOpen(true);
            }}
          >
            <Typography.Text type={isCurrentUserAdmin ? "danger" : null} disabled={!isCurrentUserAdmin}>
              Remove user from workspace
            </Typography.Text>
          </Menu.Item>
        )}
      </Menu>
    ),
    [stableHandleRevokeInvite, isCurrentUserAdmin, member.isPending]
  );

  return (
    <>
      {isRemoveUserModalOpen && (
        <RemoveUserModal
          teamId={teamId}
          isOpen={isRemoveUserModalOpen}
          toggleModal={() => setIsRemoveUserModalOpen(!isRemoveUserModalOpen)}
          userId={userIdToRemove}
          callbackOnSuccess={fetchTeamMembers}
        />
      )}

      <Dropdown overlay={items} trigger={["click"]} {...props} disabled={isLoading || !!props.disabled}>
        <span
          className={`dropdown-trigger dropdown-trigger-three-dots ${
            isHoverEffect ? "member-role-dropdown-trigger" : ""
          }`}
        >
          <HiOutlineDotsVertical />
          {showLoader && isLoading ? <Spin className="role-change-spinner" indicator={<LoadingOutlined />} /> : null}
        </span>
      </Dropdown>
    </>
  );
};

export default MemberActionsDropdown;
