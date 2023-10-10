import { useCallback, useEffect, useMemo, useState } from "react";
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
  const userName = useMemo(() => (user.loggedIn ? user?.details?.profile?.displayName ?? "User" : null), [
    user?.details?.profile?.displayName,
    user.loggedIn,
  ]);

  const userPhoto = useMemo(
    () =>
      user.loggedIn && user?.details?.profile?.photoURL ? parseGravatarImage(user.details.profile.photoURL) : null,
    [user.details.profile.photoURL, user.loggedIn]
  );

  const userEmail = useMemo(() => user?.details?.profile?.email, [user.details.profile.email]);

  // Component State
  const [loading, setLoading] = useState(false);
  const [hideUserDropDown, setHideUserDropdown] = useState(false);

  useEffect(() => {
    Object.values(APP_CONSTANTS.PATHS.AUTH).forEach((AUTH_PATH) => {
      // SO THAT USER CANNOT TRIGGER OTHER AUTH ACTIONS DURING CURRENT AUTH FLOW
      if (window.location.pathname === AUTH_PATH.ABSOLUTE) {
        setHideUserDropdown(true);
      }
    });
  }, []);

  const renderUserDetails = useCallback(() => {
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
            setLoading(true);
            handleLogoutButtonOnClick(appMode, isWorkspaceMode, dispatch)
              .then(() =>
                dispatch(
                  actions.updateHardRefreshPendingStatus({
                    type: "rules",
                  })
                )
              )
              .finally(() => setLoading(false));
          }}
        >
          Sign out
        </Menu.Item>
      </Menu>
    );
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
  }, [appMode, dispatch, isWorkspaceMode, navigate, userEmail, userName, userPhoto]);

  const renderLoginBtn = useCallback(() => {
    return (
      <Col>
        <Button
          type="primary"
          className="layout-header-signup-btn"
          onClick={(e) => {
            e.preventDefault();
            // PROMPT USER TO SIGNUP
            dispatch(
              actions.toggleActiveModal({
                modalName: "authModal",
                newValue: true,
                newProps: {
                  redirectURL: window.location.href,
                  authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
                  eventSource: AUTH.SOURCE.NAVBAR,
                },
              })
            );
            return false;
          }}
        >
          Sign up
        </Button>
      </Col>
    );
  }, [dispatch]);

  if (loading) {
    return (
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
  }

  return hideUserDropDown ? null : (
    <>
      {user.loggedIn && user.details && user.details.profile && user.details.profile.photoURL
        ? renderUserDetails()
        : renderLoginBtn()}
    </>
  );
}
