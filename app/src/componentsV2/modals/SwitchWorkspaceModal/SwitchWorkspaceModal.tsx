import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { getAvailableTeams } from "store/features/teams/selectors";
import { Avatar, Button, Col, Row } from "antd";
import { RQModal } from "lib/design-system/components";
import { LearnMoreLink } from "components/common/LearnMoreLink";
import { PlusOutlined } from "@ant-design/icons";
import { getUniqueColorForWorkspace } from "utils/teams";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { Team } from "types";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import "./switchWorkspaceModal.css";
import { trackCreateNewTeamClicked } from "modules/analytics/events/common/teams";

interface SwitchWorkspaceModalProps {
  isOpen: boolean;
  toggleModal: () => void;
}

const SwitchWorkspaceModal: React.FC<SwitchWorkspaceModalProps> = ({ isOpen, toggleModal }) => {
  const dispatch = useDispatch();

  const availableTeams = useSelector(getAvailableTeams);
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  const sortedTeams: Team[] = availableTeams
    ? [...availableTeams].sort((a: Team, b: Team) => b.accessCount - a.accessCount)
    : [];

  const handleCreateNewWorkspaceClick = () => {
    trackCreateNewTeamClicked("switch_workspace_modal");
    toggleModal();
    dispatch(
      actions.toggleActiveModal({
        modalName: "createWorkspaceModal",
        newValue: true,
        newProps: { source: "switch_workspace_modal" },
      })
    );
  };

  const handleSwitchWorkspaceClick = (team: Team) => {
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
      actions.toggleActiveModal({
        modalName: "inviteMembersModal",
        newValue: true,
        newProps: { source: "switch_workspace_modal" },
      })
    );
  };

  return (
    <RQModal centered open={isOpen} onCancel={toggleModal}>
      <div className="rq-modal-content switch-workspace-modal-content">
        {availableTeams?.length > 0 && <div className="header">You have access to these workspaces</div>}

        {availableTeams?.length > 0 ? (
          <ul className="teams-list">
            {sortedTeams.map((team: Team) => (
              <li key={team.inviteId}>
                <div className="w-full teams-list-row">
                  <Col>
                    <Avatar
                      size={28}
                      shape="square"
                      className="workspace-avatar"
                      icon={team.name?.[0]?.toUpperCase() ?? "W"}
                      style={{
                        backgroundColor: `${getUniqueColorForWorkspace(team.id, team.name)}`,
                      }}
                    />
                    <div>{team.name}</div>
                  </Col>
                  <Col>{`${team.accessCount} members`}</Col>

                  <Button type="primary" onClick={() => handleSwitchWorkspaceClick(team)}>
                    Switch
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="title teams-empty-message">
            <img alt="smile" width="48px" height="44px" src="/assets/img/workspaces/smiles.svg" />
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
