import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Button, Col, Form, Input, Row } from "antd";
import { RQModal } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { redirectToTeam } from "utils/RedirectionUtils";
import { trackNewTeamCreateFailure, trackNewTeamCreateSuccess } from "modules/analytics/events/features/teams";
import { trackNewWorkspaceCreated, trackAddWorkspaceNameModalViewed } from "modules/analytics/events/common/teams";
import LearnMoreAboutWorkspace from "../TeamViewer/common/LearnMoreAboutWorkspace";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { actions } from "store";
import "./CreateWorkspaceModal.css";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

const CreateWorkspaceModal = ({ isOpen, toggleModal, defaultWorkspaceName = "", callback, source }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const [isLoading, setIsLoading] = useState(false);
  const [createWorkspaceFormData, setCreateWorkspaceFormData] = useState({
    workspaceName: defaultWorkspaceName,
    description: "",
  });

  const handleFormValuesChange = (_, data) => {
    setCreateWorkspaceFormData(data);
  };

  const handleFinishClick = (details) => {
    setIsLoading(true);
    const newTeamName = details.workspaceName;
    const createTeam = httpsCallable(getFunctions(), "teams-createTeam");

    createTeam({
      teamName: newTeamName,
    })
      .then((response) => {
        trackNewWorkspaceCreated();
        toast.info("Workspace Created");
        dispatch(actions.updateJoinWorkspacePromptVisible(false));

        const teamId = response.data.teamId;
        switchWorkspace(
          {
            teamId: teamId,
            teamName: newTeamName,
            teamMembersCount: 1,
          },
          dispatch,
          {
            isSyncEnabled: user?.details?.isSyncEnabled,
            isWorkspaceMode,
          },
          appMode
        );
        redirectToTeam(navigate, teamId, {
          state: {
            isNewTeam: true,
          },
        });
        callback?.();
        toggleModal();
        trackNewTeamCreateSuccess(teamId, newTeamName, "create_workspace_modal");
      })
      .catch((err) => {
        toast.error("Unable to Create Team");
        trackNewTeamCreateFailure(newTeamName);
      })
      .finally(() => setIsLoading(false));
  };

  const handleFinishFailed = () => toast.error("Please enter valid details");

  useEffect(() => {
    if (isOpen) trackAddWorkspaceNameModalViewed(source);
  }, [isOpen, source]);

  return (
    <RQModal centered open={isOpen} onCancel={toggleModal}>
      <Form
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={handleFinishClick}
        onFinishFailed={handleFinishFailed}
        onValuesChange={handleFormValuesChange}
        className="create-workspace-form"
      >
        <div className="rq-modal-content">
          <div className="create-workspace-modal-header">
            <div className="header">Create a new workspace</div>
            <div className="text-gray subtitle">
              <div>Workspaces are where your team collaborate on rules,</div>
              <div>variables, and mocks.</div>
            </div>
          </div>

          <div>
            <Form.Item
              label="Workspace name"
              name="workspaceName"
              initialValue={defaultWorkspaceName}
              rules={[
                {
                  required: true,
                  message: "Please give a name to your workspace.",
                },
              ]}
            >
              <Input
                autoComplete="off"
                className="create-workspace-input"
                placeholder="Name of your company or organization"
              />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              className="create-workspace-modal-description"
              style={{ display: "none" }}
            >
              <Input.TextArea rows={4} placeholder="Details about your workspace" />
            </Form.Item>
          </div>
        </div>

        {/* footer */}
        <Row align="middle" justify="space-between" className="rq-modal-footer">
          <Col>
            <LearnMoreAboutWorkspace linkText="Learn more about team workspaces" />
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              disabled={!createWorkspaceFormData.workspaceName}
            >
              Create workspace
            </Button>
          </Col>
        </Row>
      </Form>
    </RQModal>
  );
};

export default CreateWorkspaceModal;
