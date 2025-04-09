import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Dropdown, Col, Avatar, Spin, Button } from "antd";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { globalActions } from "store/slices/global/slice";
import {
  redirectToAccountDetails,
  redirectToBillingTeamSettings,
  redirectToProfileSettings,
  redirectToSettings,
  redirectToWorkspaceSettings,
} from "utils/RedirectionUtils";
import { handleLogoutButtonOnClick } from "features/onboarding/components/auth/components/Form/actions";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { parseGravatarImage } from "utils/Misc";
import { trackHeaderClicked } from "modules/analytics/events/common/onboarding/header";
import { RQButton } from "lib/design-system/components";
import { trackUpgradeClicked } from "modules/analytics/events/misc/monetizationExperiment";
import { incentivizationActions } from "store/features/incentivization/slice";
import { getAppFlavour } from "utils/AppUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isSafariBrowser } from "actions/ExtensionActions";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";

export default function HeaderUser() {
  const navigate = useNavigate();
  const location = useLocation();
  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const appMode = useSelector(getAppMode);

  const userName = user.loggedIn ? user?.details?.profile?.displayName ?? "User" : null;
  const userPhoto =
    user.loggedIn && user?.details?.profile?.photoURL ? parseGravatarImage(user.details.profile.photoURL) : null;
  const userEmail = user?.details?.profile?.email;
  const planDetails = user?.details?.planDetails;

  // Component State
  const [loading, setLoading] = useState(false);
  const [hideUserDropDown, setHideUserDropdown] = useState(false);
  const appFlavour = useMemo(() => getAppFlavour(), []);

  useEffect(() => {
    setHideUserDropdown(
      Object.values(APP_CONSTANTS.PATHS.AUTH).some((AUTH_PATH) => location.pathname === AUTH_PATH.ABSOLUTE)
    );
  }, [location]);

  const menuPropItems = useMemo(
    () => [
      {
        icon: <Avatar size={42} src={userPhoto} shape="square" className="cursor-pointer header-user-avatar" />,
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
        disabled: appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR,
        label: "Profile",
        onClick: () => redirectToProfileSettings(navigate, window.location.pathname, "header"),
      },
      {
        label: "Manage Workspaces",
        onClick: () => redirectToWorkspaceSettings(navigate, window.location.pathname, "header"),
      },
      {
        disabled: appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR,
        label: "Plans and Billing",
        onClick: () => redirectToBillingTeamSettings(navigate, window.location.pathname, "header"),
      },
      {
        label: "Settings",
        onClick: () => redirectToSettings(navigate, window.location.pathname, "header"),
      },
      { type: "divider" },
      {
        label: "Sign out",
        onClick: () => {
          setLoading(true);
          handleLogoutButtonOnClick(appMode, isSharedWorkspaceMode, dispatch)
            .then(() => {
              dispatch(
                globalActions.updateHardRefreshPendingStatus({
                  type: "rules",
                })
              );

              getTabServiceActions().resetTabs("sign_out");
              dispatch(incentivizationActions.resetState());
            })
            .finally(() => setLoading(false));
        },
      },
    ],
    [appMode, dispatch, isSharedWorkspaceMode, navigate, userEmail, userPhoto, userName, appFlavour]
  );

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
    <section>
      {user.loggedIn && user?.details?.profile ? (
        <Col>
          <Dropdown
            trigger={["click"]}
            overlayClassName="header-profile-dropdown"
            menu={{ items: menuPropItems }}
            placement="bottomLeft"
            className="header-profile-dropdown-trigger no-drag"
            onOpenChange={(open) => {
              open && trackHeaderClicked("user_menu");
            }}
          >
            <Avatar size={28} src={userPhoto} shape="square" className="cursor-pointer" />
          </Dropdown>
          {!isSafariBrowser() &&
          (!planDetails?.planId || !["active", "past_due"].includes(planDetails?.status)) &&
          appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.REQUESTLY ? (
            <RQButton
              type="primary"
              className="header-upgrade-btn"
              onClick={() => {
                trackUpgradeClicked("header");
                dispatch(
                  globalActions.toggleActiveModal({
                    modalName: "pricingModal",
                    newValue: true,
                    newProps: { selectedPlan: null, source: "header_upgrade_button" },
                  })
                );
              }}
            >
              Upgrade
            </RQButton>
          ) : null}
        </Col>
      ) : (
        <>
          <Col>
            <Button
              style={{ fontWeight: 500 }}
              type="primary"
              className="layout-header-signup-btn no-drag"
              onClick={(e) => {
                e.preventDefault();
                dispatch(
                  globalActions.toggleActiveModal({
                    modalName: "authModal",
                    newValue: true,
                    newProps: {
                      redirectURL: window.location.href,
                      authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
                      eventSource: SOURCE.NAVBAR,
                    },
                  })
                );
              }}
            >
              Sign Up
            </Button>
          </Col>
        </>
      )}
    </section>
  );
}
