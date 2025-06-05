import { Col, Row } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import "./index.css";
import APP_CONSTANTS from "config/constants";
import { handleLogoutButtonOnClick } from "features/onboarding/components/auth/components/Form/actions";
import { getAppMode } from "store/selectors";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { trackSignUpButtonClicked } from "modules/analytics/events/common/auth/signup";
import { RQButton } from "lib/design-system-v2/components";
import { SOURCE } from "modules/analytics/events/common/constants";
import { Workspace } from "features/workspaces/types";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";

interface Props {
  inviteId: string;
  ownerName: string;
  workspace: Workspace;
  invitedEmail: string;
}

const BadLoginInvite = ({ inviteId, ownerName, workspace, invitedEmail }: Props) => {
  const dispatch = useDispatch();
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const appMode = useSelector(getAppMode);

  const openAuthModal = (authMode: string) => {
    trackSignUpButtonClicked("bad_login_invite");
    handleLogoutButtonOnClick(appMode, isSharedWorkspaceMode, dispatch).then(() => {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newProps: {
            authMode,
            redirectURL: window.location.href,
            eventSource: SOURCE.TEAM_WORKSPACE_BAD_INVITE_SCREEN,
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
            <WorkspaceAvatar workspace={workspace} size={56} />
          </div>
          <div className="header invite-header">
            {ownerName} has invited you to workspace {workspace?.name}
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
