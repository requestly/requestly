import { useSelector } from "react-redux";
import { getAppOnboardingDetails } from "store/selectors";
import { Col, Divider, Row, Space, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import groupIcon from "../../assets/group.svg";
import "./index.scss";

export const DefaultTeamView = () => {
  const createdWorkspaceData = useSelector(getAppOnboardingDetails).createdWorkspace;

  return (
    <Col className="display-row-center items-center h-full getting-started-default-team-view">
      <Space direction="vertical" align="center">
        <Row align="middle" justify="center">
          <Row justify="center" align="middle">
            <img src={groupIcon} alt="group" />
          </Row>
          <Typography.Title level={5} className="text-center text-white getting-started-default-team-title">
            Collaborate better with the team using workspaces
          </Typography.Title>
          <Typography.Text className="text-center getting-started-default-team-description">
            Your workspace <span>{createdWorkspaceData.name}</span> is set up automatically! You can use it for
            yourself, switch to your private workspace, or invite your team to join.
          </Typography.Text>
          <RQButton style={{ marginTop: "32px" }}>Switch to private workspace</RQButton>
          <RQButton type="primary" className="mt-16">
            Invite team members
          </RQButton>
        </Row>
        <Divider />
        <RQButton type="text" className="getting-started-manage-workspace-btn">
          <MdOutlineSettings /> Manage this workspace
        </RQButton>
      </Space>
    </Col>
  );
};
