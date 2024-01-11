import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { Col } from "antd";
import { RQButton } from "lib/design-system/components";
import { groupSvg } from "features/onboarding";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { actions } from "store";
import { trackHomeWorkspaceActionClicked } from "components/Home/analytics";
import { AUTH } from "modules/analytics/events/common/constants";
import "./index.scss";

export const CreateWorkspaceView: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();

  const handleCreateWorkspace = () => {
    trackHomeWorkspaceActionClicked("create_new_workspace");
    dispatch(
      actions.toggleActiveModal({
        modalName: "createWorkspaceModal",
        newValue: true,
        newProps: {
          source: AUTH.SOURCE.HOME_SCREEN,
        },
      })
    );
  };

  return (
    <Col className="create-workspace-view">
      <img src={groupSvg} alt="workspace" />
      <div className="create-workspace-view-title">Collaborate better with the team using Requestly workspaces</div>
      <div className="create-workspace-view-description">
        Share rules, mocks, and sessions. Collaborate to solve problems faster.
      </div>
      <AuthConfirmationPopover
        title="You need to sign up to create a workspace"
        callback={handleCreateWorkspace}
        source="homepage"
      >
        <RQButton
          type="primary"
          className="mt-16"
          onClick={() => {
            user.loggedIn && handleCreateWorkspace();
          }}
        >
          Create new workspace
        </RQButton>
      </AuthConfirmationPopover>
    </Col>
  );
};
