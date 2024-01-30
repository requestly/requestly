import React, { useCallback, useMemo, useState } from "react";
import { Dropdown, DropDownProps, Menu, Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./PendingMemberRoleDropdown.css";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";

interface PendingMemberRoleDropwdownProps extends DropDownProps {
  isAdmin: boolean;
  isCurrentUserAdmin: boolean;
  isHoverEffect?: boolean;
  showLoader?: boolean;
  isLoggedInUserAdmin?: boolean;
  inviteId: string;
  fetchTeamMembers: () => void;
}

const PendingMemberRoleDropwdown: React.FC<PendingMemberRoleDropwdownProps> = ({
  isAdmin,
  showLoader,
  isCurrentUserAdmin,
  isHoverEffect = false,
  isLoggedInUserAdmin = false,
  inviteId,
  fetchTeamMembers,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRevokeInvite = () => {
    const functions = getFunctions();
    const revokeInvite = httpsCallable(functions, "invites-revokeInvite");
    setIsLoading(true);
    revokeInvite({ inviteId: inviteId })
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

  const stableHandleRevokeInvite = useCallback(handleRevokeInvite, [inviteId, fetchTeamMembers]);

  const items = useMemo(
    () => (
      <Menu className="dropdown-menu">
        <Menu.Item key="remove" onClick={() => stableHandleRevokeInvite()} disabled={!isCurrentUserAdmin}>
          <Typography.Text
            className="remove-user-menu-item-text"
            type={isCurrentUserAdmin ? "danger" : null}
            disabled={!isCurrentUserAdmin}
          >
            Revoke Invite
          </Typography.Text>
        </Menu.Item>
      </Menu>
    ),
    [stableHandleRevokeInvite, isCurrentUserAdmin]
  );

  return (
    <Dropdown overlay={items} trigger={["click"]} {...props} disabled={isLoading || !!props.disabled}>
      <div className={`dropdown-trigger ${isHoverEffect ? "member-role-dropdown-trigger" : ""}`}>
        <Typography.Text className="cursor-pointer">
          {isAdmin ? "Admin" : "Member"} access{" "}
          <img
            width="10px"
            height="6px"
            alt="downoutlined"
            src="/assets/img/workspaces/downoutlined.svg"
            className="dropdown-down-arrow-icon"
          />
        </Typography.Text>

        {showLoader && isLoading ? <Spin className="role-change-spinner" indicator={<LoadingOutlined />} /> : null}
      </div>
    </Dropdown>
  );
};

export default PendingMemberRoleDropwdown;
