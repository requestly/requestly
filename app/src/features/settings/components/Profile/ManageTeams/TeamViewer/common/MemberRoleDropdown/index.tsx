import React, { useMemo, useState } from "react";
import { Divider, Dropdown, DropDownProps, Menu, Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./MemberRoleDropdown.css";

interface MemberRoleDropdownProps extends DropDownProps {
  isAdmin: boolean;
  isHoverEffect?: boolean;
  showLoader?: boolean;
  isLoggedInUserAdmin?: boolean;
  memberId?: string;
  loggedInUserId?: string;
  handleMemberRoleChange: (
    makeUserAdmin: boolean,
    updatedRole: "admin" | "user",
    setIsLoading: (status: boolean) => void
  ) => void;
  handleRemoveMember?: () => void;
}

const MemberRoleDropdown: React.FC<MemberRoleDropdownProps> = ({
  isAdmin,
  showLoader,
  memberId,
  loggedInUserId,
  isHoverEffect = false,
  isLoggedInUserAdmin = false,
  handleMemberRoleChange,
  handleRemoveMember,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const items = useMemo(
    () => (
      <Menu className="dropdown-menu">
        <Menu.Item
          key="admin"
          disabled={!!memberId && !isLoggedInUserAdmin}
          className="dropdown-access-type-menu-item"
          onClick={() => handleMemberRoleChange(true, "admin", setIsLoading)}
        >
          <div>
            <div className="subtitle">Admin</div>
            <div className="caption text-gray">Can change workspace settings</div>
          </div>
          <img
            alt="downoutlined"
            className={`dropdown-selected-icon ${isAdmin ? "" : "visibility-hidden"}`}
            src="/assets/img/workspaces/tick.svg"
          />
        </Menu.Item>
        <Menu.Item
          key="member"
          disabled={!!memberId && !isLoggedInUserAdmin}
          className="dropdown-access-type-menu-item"
          onClick={() => handleMemberRoleChange(false, "user", setIsLoading)}
        >
          <div>
            <div className="subtitle">Member</div>
            <div className="caption text-gray">Cannot change workspace settings</div>
          </div>
          <img
            alt="downoutlined"
            className={`dropdown-selected-icon ${!isAdmin ? "" : "visibility-hidden"}`}
            src="/assets/img/workspaces/tick.svg"
          />
        </Menu.Item>

        {handleRemoveMember ? (
          <>
            {memberId === loggedInUserId ? (
              <>
                <Divider className="member-role-dropdown" />
                <Menu.Item key="remove" onClick={() => handleRemoveMember()}>
                  <Typography.Text type="danger" className="remove-user-menu-item-text">
                    Leave workspace
                  </Typography.Text>
                </Menu.Item>
              </>
            ) : isLoggedInUserAdmin ? (
              <>
                <Divider className="member-role-dropdown" />
                <Menu.Item key="remove" onClick={() => handleRemoveMember()}>
                  <Typography.Text type="danger" className="remove-user-menu-item-text">
                    Remove from workspace
                  </Typography.Text>
                </Menu.Item>
              </>
            ) : null}
          </>
        ) : null}
      </Menu>
    ),
    [isAdmin, memberId, loggedInUserId, isLoggedInUserAdmin, handleMemberRoleChange, handleRemoveMember]
  );

  return (
    <Dropdown
      overlay={items}
      trigger={["click"]}
      {...props}
      disabled={isLoading || (memberId !== loggedInUserId && !isLoggedInUserAdmin)}
    >
      <div className={`dropdown-trigger ${isHoverEffect ? "member-role-dropdown-trigger" : ""}`}>
        <Typography.Text className={!props.disabled && "cursor-pointer"}>
          {isAdmin ? "Admin" : "Member"} access{" "}
          {(isLoggedInUserAdmin || memberId === loggedInUserId) && (
            <img
              width="10px"
              height="6px"
              alt="downoutlined"
              src="/assets/img/workspaces/downoutlined.svg"
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
