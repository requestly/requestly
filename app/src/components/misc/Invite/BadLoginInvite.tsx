import { Avatar, Col, Row } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getUniqueColorForWorkspace } from "utils/teams";
import { globalActions } from "store/slices/global/slice";
import "./index.css";
import APP_CONSTANTS from "config/constants";
import { handleLogoutButtonOnClick } from "features/onboarding/components/auth/components/Form/actions";
import { getAppMode } from "store/selectors";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { trackSignUpButtonClicked } from "modules/analytics/events/common/auth/signup";
import { RQButton } from "lib/design-system-v2/components";
import { SOURCE } from "modules/analytics/events/common/constants";
import { useLocation } from "react-router-dom";

interface Props {
  inviteId: string;
  ownerName: string;
  workspaceName: string;
  invitedEmail: string;
}

const BadLoginInvite = ({ inviteId, ownerName, workspaceName, invitedEmail }: Props) => {
  const dispatch = useDispatch();
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const appMode = useSelector(getAppMode);
  const location = useLocation();

  const openAuthModal = (authMode: string) => {
    trackSignUpButtonClicked("bad_login_invite");
    handleLogoutButtonOnClick(appMode, isSharedWorkspaceMode, dispatch).then(() => {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newProps: {
            eventSource: SOURCE.TEAM_WORKSPACE_BAD_INVITE_SCREEN,
            redirectURL: location.pathname,
            callback: () => {
              // setVisible(false);
            },
            authMode: authMode,
          },
        })
      );

      dispatch(
        globalActions.updateHardRefreshPendingStatus({
          type: "rules",
        })
      );
    });
  };

  return (
    <Row className="invite-container" justify={"center"}>
      <Col xs={18} sm={16} md={14} lg={12} xl={8}>
        <div className="invite-content">
          <div className="workspace-image invite-accept-avatar-image">
            <Avatar
              size={56}
              shape="square"
              icon={workspaceName ? workspaceName?.[0]?.toUpperCase() : "P"}
              style={{
                backgroundColor: `${getUniqueColorForWorkspace("", workspaceName)}`,
              }}
            />
          </div>
          <div className="header invite-header">
            {ownerName} has invited you to workspace {workspaceName}
          </div>
          <p className="text-gray invite-subheader">
            {invitedEmail ? (
              <>
                To accept the invitation, please sign in as <b>{invitedEmail}</b>
              </>
            ) : (
              <>To accept the invitation, please sign up.</>
            )}
          </p>
        </div>
        <div className="invite-footer">
          <RQButton className="invite-button" onClick={() => openAuthModal(APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN)}>
            Sign in
          </RQButton>
          <RQButton
            className="invite-button"
            type="primary"
            onClick={() => openAuthModal(APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP)}
          >
            Sign up
          </RQButton>
        </div>
      </Col>
    </Row>
  );
};

export default BadLoginInvite;
