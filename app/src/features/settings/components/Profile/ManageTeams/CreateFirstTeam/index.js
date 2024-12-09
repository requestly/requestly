import React from "react";
import { Button, Row, Col, Space } from "antd";
import ProCard from "@ant-design/pro-card";
import APP_CONSTANTS from "../../../../../../config/constants";
import { trackCreateNewTeamClicked } from "modules/analytics/events/common/teams";
import { globalActions } from "store/slices/global/slice";
import { useDispatch } from "react-redux";

const CreateFirstTeam = () => {
  const dispatch = useDispatch();

  return (
    <>
      <ProCard className="primary-card github-like-border" title="My Team Workspaces">
        <Row>
          <Col span={24} align="center">
            <p>
              You can create or join multiple teams. Each team is billed separately and subscription is shared with all
              members.
            </p>
            <br />
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  dispatch(
                    globalActions.toggleActiveModal({
                      modalName: "createWorkspaceModal",
                      newValue: true,
                      newProps: { source: "my_teams" },
                    })
                  );
                  trackCreateNewTeamClicked("my_teams");
                }}
              >
                Create your first team
              </Button>
              <Button onClick={(e) => window.open(APP_CONSTANTS.LINKS.REQUESTLY_DOCS_TEAM_SUBSCRIPTION, "_blank")}>
                Know More
              </Button>
            </Space>
          </Col>
        </Row>
      </ProCard>
    </>
  );
};

export default CreateFirstTeam;
