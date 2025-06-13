import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Button, Col, Row } from "antd";
import { RQModal } from "lib/design-system/components";
import { LearnMoreLink } from "components/common/LearnMoreLink";
import { PlusOutlined } from "@ant-design/icons";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import "./switchWorkspaceModal.css";
import { trackCreateNewTeamClicked } from "modules/analytics/events/common/teams";
import { getAllWorkspaces } from "store/slices/workspaces/selectors";
import { Workspace } from "features/workspaces/types";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";

interface SwitchWorkspaceModalProps {
  isOpen: boolean;
  toggleModal: () => void;
}

const SwitchWorkspaceModal: React.FC<SwitchWorkspaceModalProps> = ({ isOpen, toggleModal }) => {
  const dispatch = useDispatch();

  const availableWorkspaces = useSelector(getAllWorkspaces);
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  const sortedTeams: Workspace[] = availableWorkspaces
    ? [...availableWorkspaces].sort((a: Workspace, b: Workspace) => b.accessCount - a.accessCount)
    : [];

  const handleCreateNewWorkspaceClick = () => {
    trackCreateNewTeamClicked("switch_workspace_modal");
    toggleModal();
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "createWorkspaceModal",
        newValue: true,
        newProps: { source: "switch_workspace_modal" },
      })
    );
  };

  const handleSwitchWorkspaceClick = (team: Workspace) => {
    toggleModal();
    switchWorkspace(
      {
        teamId: team.id,
        teamName: team.name,
        teamMembersCount: team.accessCount,
      },
      dispatch,
      {
        isSyncEnabled: user?.details?.isSyncEnabled,
        isWorkspaceMode: true,
      },
      appMode,
      null,
      "switch_workspace_modal"
    );
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "inviteMembersModal",
        newValue: true,
        newProps: { source: "switch_workspace_modal" },
      })
    );
  };

  return (
    <RQModal centered open={isOpen} onCancel={toggleModal}>
      <div className="rq-modal-content switch-workspace-modal-content">
        {availableWorkspaces?.length > 0 && <div className="header">You have access to these workspaces</div>}

        {availableWorkspaces?.length > 0 ? (
          <ul className="teams-list">
            {sortedTeams.map((workspace: Workspace) => (
              <li key={workspace.inviteId}>
                <div className="w-full teams-list-row">
                  <Col>
                    <WorkspaceAvatar workspace={workspace} />
                    <div>{workspace.name}</div>
                  </Col>
                  <Col>{`${Object.keys(workspace.members).length} members`}</Col>

                  <Button type="primary" onClick={() => handleSwitchWorkspaceClick(workspace)}>
                    Switch
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="title teams-empty-message">
            <img alt="smile" width="48px" height="44px" src="/assets/media/common/smiles.svg" />
            <div>You don't have any workspaces!</div>
          </div>
        )}
      </div>

      {/* footer */}
      <Row align="middle" justify="space-between" className="rq-modal-footer">
        <Col>
          <LearnMoreLink
            linkText="Learn more about team workspaces"
            href={APP_CONSTANTS.LINKS.DEMO_VIDEOS.TEAM_WORKSPACES}
          />
        </Col>
        <Col>
          <Button className="display-row-center" onClick={handleCreateNewWorkspaceClick}>
            <PlusOutlined /> Create new workspace
          </Button>
        </Col>
      </Row>
    </RQModal>
  );
};

export default SwitchWorkspaceModal;
