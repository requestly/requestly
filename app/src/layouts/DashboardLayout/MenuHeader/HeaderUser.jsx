import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dropdown, Col, Avatar, Divider, Spin, Button, Menu } from "antd";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { actions } from "store";
import { redirectToAccountDetails, redirectToMyTeams } from "utils/RedirectionUtils";
import { handleLogoutButtonOnClick } from "components/authentication/AuthForm/actions";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { parseGravatarImage } from "utils/Misc";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { trackHeaderClicked } from "modules/analytics/events/common/onboarding/header";

export default function HeaderUser() {
  const navigate = useNavigate();

  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const appMode = useSelector(getAppMode);
  const userName = user.loggedIn ? user?.details?.profile?.displayName ?? "User" : null;

  const userPhoto =
    user.loggedIn && user?.details?.profile?.photoURL ? parseGravatarImage(user.details.profile.photoURL) : null;

  const userEmail = user?.details?.profile?.email;

  // Component State
  const [isLoading, setIsLoading] = useState(false);

  const promptUserToSignup = (source) => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          eventSource: source,
        },
      })
    );
  };

  const menu = (
    <Menu className="profile-dropdown">
      <Menu.Item key={0} className="profile-avatar-container" onClick={() => redirectToAccountDetails(navigate)}>
        <Avatar size={42} src={userPhoto} shape="square" className="cursor-pointer" />
        <div className="profile-details">
          <div className="profile-username">{userName}</div>
          {userEmail ? <div className="text-gray text-sm">{userEmail}</div> : null}
        </div>
      </Menu.Item>
      <Divider className="profile-divider" />
      <Menu.Item key={1} className="profile-menu-items" onClick={() => redirectToAccountDetails(navigate)}>
        Profile
      </Menu.Item>
      <Menu.Item key={2} className="profile-menu-items" onClick={() => redirectToMyTeams(navigate)}>
        Manage Workspaces
      </Menu.Item>
      <Divider className="profile-divider" />
      <Menu.Item
        key={4}
        className="profile-menu-items profile-sign-out"
        onClick={() => {
          setIsLoading(true);
          handleLogoutButtonOnClick(appMode, isWorkspaceMode, dispatch)
            .then(() =>
              dispatch(
                actions.updateHardRefreshPendingStatus({
                  type: "rules",
                })
              )
            )
            .finally(() => setIsLoading(false));
        }}
      >
        Sign out
      </Menu.Item>
    </Menu>
  );

  const loading = (
    <span>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (isLoading) {
    return loading;
  }

  const renderUserDetails = () => {
    return (
      <>
        <Col>
          <Dropdown
            trigger={["click"]}
            overlay={menu}
            placement="bottomLeft"
            className="header-profile-dropdown-trigger"
            onOpenChange={(open) => {
              open && trackHeaderClicked("user_menu");
            }}
          >
            <Avatar size={28} src={userPhoto} shape="square" className="cursor-pointer" />
          </Dropdown>
        </Col>
      </>
    );
  };

  const renderLoginBtn = () => {
    return (
      <Col>
        <Button
          type="primary"
          className="layout-header-signup-btn"
          onClick={(e) => {
            e.preventDefault();
            promptUserToSignup(AUTH.SOURCE.NAVBAR);
            return false;
          }}
        >
          Sign up
        </Button>
      </Col>
    );
  };

  let showUserDropdown = true;

  Object.values(APP_CONSTANTS.PATHS.AUTH).forEach((AUTH_PATH) => {
    // SO THAT USER CANNOT TRIGGER OTHER AUTH ACTIONS DURING CURRENT AUTH FLOW
    if (window.location.pathname === AUTH_PATH.ABSOLUTE) {
      showUserDropdown = false;
    }
  });

  if (!showUserDropdown) {
    return null;
  }

  return (
    <>
      {user.loggedIn && user.details && user.details.profile && user.details.profile.photoURL
        ? renderUserDetails()
        : renderLoginBtn()}
    </>
  );
}
