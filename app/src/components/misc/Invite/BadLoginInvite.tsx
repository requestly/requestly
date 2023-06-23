import { Avatar, Col, Row } from "antd";

import { RQButton } from "lib/design-system/components";
import { useDispatch, useSelector } from "react-redux";
import { getUniqueColorForWorkspace } from "utils/teams";
import { actions } from "store";
import "./index.css";
import APP_CONSTANTS from "config/constants";
import { handleLogoutButtonOnClick } from "components/authentication/AuthForm/actions";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { getAppMode } from "store/selectors";

interface Props {
  inviteId: string;
  ownerName: string;
  workspaceName: string;
  invitedEmail: string;
}

const BadLoginInvite = ({ inviteId, ownerName, workspaceName, invitedEmail }: Props) => {
  const dispatch = useDispatch();
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const appMode = useSelector(getAppMode);

  const openAuthModal = () => {
    handleLogoutButtonOnClick(appMode, isWorkspaceMode, dispatch).then(() => {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newProps: {
            redirectURL: window.location.href,
            callback: () => {
              // setVisible(false);
            },
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          },
        })
      );
      dispatch(
        actions.updateHardRefreshPendingStatus({
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
                To accept the invitation, please login as <b>{invitedEmail}</b>
              </>
            ) : (
              <>To accept the invitation, please signup.</>
            )}
          </p>
        </div>
        <div className="invite-footer">
          <RQButton className="invite-button" type="primary" size="middle" onClick={() => openAuthModal()}>
            Sign up
          </RQButton>
        </div>
      </Col>
    </Row>
  );
};

export default BadLoginInvite;
