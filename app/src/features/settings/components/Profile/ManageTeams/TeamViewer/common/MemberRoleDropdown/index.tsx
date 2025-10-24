import React, { useMemo, useState } from "react";
import { Dropdown, DropDownProps, Menu, Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { TeamRole } from "types";
import { getDisplayTextForRole } from "features/settings/utils";
import { useSelector } from "react-redux";
import "./MemberRoleDropdown.css";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

interface MemberRoleDropdownProps extends DropDownProps {
  source?: "membersTable" | "inviteModal";
  memberRole?: TeamRole;
  loggedInUserTeamRole?: TeamRole;
  isAdmin: boolean;
  isHoverEffect?: boolean;
  showLoader?: boolean;
  isLoggedInUserAdmin?: boolean;
  memberId?: string;
  loggedInUserId?: string;
  handleMemberRoleChange: (
    makeUserAdmin: boolean,
    updatedRole: TeamRole,
    setIsLoading: (status: boolean) => void
  ) => void;
}

// TODO: refactor
const MemberRoleDropdown: React.FC<MemberRoleDropdownProps> = ({
  isAdmin,
  showLoader,
  memberId,
  loggedInUserId,
  isHoverEffect = false,
  loggedInUserTeamRole,
  memberRole,
  isLoggedInUserAdmin = false,
  handleMemberRoleChange,
  source,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<TeamRole>(memberRole ?? TeamRole.write);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const hasWriteAccess = [TeamRole.admin, TeamRole.write].includes(loggedInUserTeamRole);

  const items = useMemo(
    () => (
      <Menu className="dropdown-menu">
        {loggedInUserTeamRole === TeamRole.admin ? (
          <Menu.Item
            key="admin"
            disabled={!!memberId && loggedInUserTeamRole !== TeamRole.admin}
            className="dropdown-access-type-menu-item"
            onClick={() => {
              setCurrentRole(TeamRole.admin);
              handleMemberRoleChange(true, TeamRole.admin, setIsLoading);
            }}
          >
            <div>
              <div className="subtitle">Admin</div>
              <div className="caption text-gray">Can change workspace settings</div>
            </div>
            <img
              alt="downoutlined"
              className={`dropdown-selected-icon ${currentRole === TeamRole.admin ? "" : "visibility-hidden"}`}
              src="/assets/media/common/tick.svg"
            />
          </Menu.Item>
        ) : null}

        {hasWriteAccess ? (
          <Menu.Item
            key="editor"
            disabled={!!memberId && loggedInUserTeamRole !== TeamRole.admin && loggedInUserTeamRole !== TeamRole.write}
            className="dropdown-access-type-menu-item"
            onClick={() => {
              setCurrentRole(TeamRole.write);
              handleMemberRoleChange(false, TeamRole.write, setIsLoading);
            }}
          >
            <div>
              <div className="subtitle">Editor</div>
              <div className="caption text-gray">Cannot change workspace settings</div>
            </div>
            <img
              alt="downoutlined"
              className={`dropdown-selected-icon ${currentRole === TeamRole.write ? "" : "visibility-hidden"}`}
              src="/assets/media/common/tick.svg"
            />
          </Menu.Item>
        ) : null}

        <Menu.Item
          key="viewer"
          className="dropdown-access-type-menu-item"
          onClick={() => {
            setCurrentRole(TeamRole.read);
            handleMemberRoleChange(false, TeamRole.read, setIsLoading);
          }}
        >
          <div>
            <div className="subtitle">Viewer</div>
            <div className="caption text-gray">Can only view</div>
          </div>
          <img
            alt="downoutlined"
            className={`dropdown-selected-icon ${currentRole === TeamRole.read ? "" : "visibility-hidden"}`}
            src="/assets/media/common/tick.svg"
          />
        </Menu.Item>
      </Menu>
    ),
    [memberId, currentRole, hasWriteAccess, loggedInUserTeamRole, handleMemberRoleChange]
  );

  const disableForMembersTable =
    source === "membersTable" && ((memberId !== loggedInUserId && !isLoggedInUserAdmin) || memberId === loggedInUserId);
  const disableForInviteModal =
    source === "inviteModal" &&
    (!activeWorkspaceId || (memberId !== loggedInUserId && !hasWriteAccess) || memberId === loggedInUserId);

  return (
    <Dropdown
      overlay={items}
      trigger={["click"]}
      {...props}
      disabled={isLoading || disableForMembersTable || disableForInviteModal}
    >
      <div className={`dropdown-trigger ${isHoverEffect ? "member-role-dropdown-trigger" : ""}`}>
        <Typography.Text className={!props.disabled && "cursor-pointer"}>
          {getDisplayTextForRole(currentRole)}

          {memberId !== loggedInUserId &&
            ((source === "membersTable" && isLoggedInUserAdmin) || (source === "inviteModal" && hasWriteAccess)) && (
              <img
                width="10px"
                height="6px"
                alt="downoutlined"
                src="/assets/media/settings/downoutlined.svg"
                className="dropdown-down-arrow-icon"
              />
            )}
        </Typography.Text>

        {showLoader && isLoading ? <Spin className="role-change-spinner" indicator={<LoadingOutlined />} /> : null}
      </div>
    </Dropdown>
  );
};

export default MemberRoleDropdown;
