import { useSelector, useDispatch } from "react-redux";
import { getAppOnboardingDetails } from "store/selectors";
import { useNavigate } from "react-router-dom";
import { Col, Divider, Row, Space, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { actions } from "store";
import { redirectToTeam } from "utils/RedirectionUtils";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import groupIcon from "../../../../../../assets/group.svg";
import { trackAppOnboardingManageWorkspaceClicked } from "features/onboarding/analytics";
import "./index.scss";

export const DefaultTeamView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
            We have setup your workspace <span>{createdWorkspaceData.name}</span>. You can use it for yourself or invite
            your team for real-time collaboration.
          </Typography.Text>
          <RQButton
            type="primary"
            style={{
              marginTop: "32px",
            }}
            onClick={() => {
              dispatch(
                actions.toggleActiveModal({
                  modalName: "inviteMembersModal",
                  newValue: true,
                  newProps: {
                    teamId: createdWorkspaceData.teamId,
                    source: "app_onboarding",
                  },
                })
              );
            }}
          >
            Invite team members
          </RQButton>
        </Row>
        <Divider style={{ marginTop: "100px" }} />
        <RQButton
          type="text"
          className="getting-started-manage-workspace-btn"
          onClick={() => {
            dispatch(actions.updateAppOnboardingCompleted());
            dispatch(
              actions.toggleActiveModal({
                modalName: "appOnboardingModal",
                newValue: false,
              })
            );
            trackAppOnboardingManageWorkspaceClicked();
            redirectToTeam(navigate, createdWorkspaceData.teamId);
          }}
        >
          <MdOutlineSettings /> Manage this workspace
        </RQButton>
      </Space>
    </Col>
  );
};
