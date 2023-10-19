import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Dropdown, Col, Avatar, Spin, Button } from "antd";
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
  const location = useLocation();
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
  const [loading, setLoading] = useState(false);
  const [hideUserDropDown, setHideUserDropdown] = useState(false);

  useEffect(() => {
    setHideUserDropdown(
      Object.values(APP_CONSTANTS.PATHS.AUTH).some((AUTH_PATH) => location.pathname === AUTH_PATH.ABSOLUTE)
    );
  }, [location]);

  const menuPropItems = [
    {
      icon: <Avatar size={42} src={userPhoto} shape="square" className="cursor-pointer" />,
      onClick: () => redirectToAccountDetails(navigate),
      label: (
        <div className="profile-details">
          <div className="profile-username">{userName}</div>
          {userEmail ? <div className="text-gray text-sm">{userEmail}</div> : null}
        </div>
      ),
    },
    { type: "divider" },
    {
      label: "Profile",
      onClick: () => redirectToAccountDetails(navigate),
    },
    {
      label: "Manage Workspaces",
      onClick: () => redirectToMyTeams(navigate),
    },
    { type: "divider" },
    {
      label: "Sign out",
      onClick: () => {
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
      },
    },
  ];

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
      {user.loggedIn && user.details && user.details.profile && user.details.profile.photoURL ? (
        <>
          <Col>
            <Dropdown
              trigger={["click"]}
              menu={{ items: menuPropItems }}
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
      ) : (
        <>
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
        </>
      )}
    </>
  );
}
