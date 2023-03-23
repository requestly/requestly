import React, { useState } from "react";
import { Button, Row, Col, Space } from "antd";
import ProCard from "@ant-design/pro-card";
import CreateWorkspaceModal from "../CreateWorkspaceModal";
import APP_CONSTANTS from "../../../../../../config/constants";
import { trackCreateNewTeamClicked } from "modules/analytics/events/common/teams";

const CreateFirstTeam = () => {
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);

  const handleCreateWorkspaceModalClose = () => {
    setIsCreateTeamModalOpen(false);
  };

  return (
    <>
      <ProCard
        className="primary-card github-like-border"
        title="My Team Workspaces"
      >
        <Row>
          <Col span={24} align="center">
            <p>
              You can create or join multiple teams. Each team is billed
              separately and subscription is shared with all members.
            </p>
            <br />
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  setIsCreateTeamModalOpen(true);
                  trackCreateNewTeamClicked("my_teams");
                }}
              >
                Create your first team
              </Button>
              <Button
                onClick={(e) =>
                  window.open(
                    APP_CONSTANTS.LINKS.REQUESTLY_DOCS_TEAM_SUBSCRIPTION,
                    "_blank"
                  )
                }
              >
                Know More
              </Button>
            </Space>
          </Col>
        </Row>
      </ProCard>

      <CreateWorkspaceModal
        isOpen={isCreateTeamModalOpen}
        handleModalClose={handleCreateWorkspaceModalClose}
      />
    </>
  );
};

export default CreateFirstTeam;
