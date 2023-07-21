import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Button, Col, Form, Input, Row } from "antd";
import { RQModal } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { redirectToTeam } from "utils/RedirectionUtils";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { isEmailVerified } from "utils/AuthUtils";
import { isCompanyEmail } from "utils/FormattingHelper";
import { trackNewTeamCreateFailure, trackNewTeamCreateSuccess } from "modules/analytics/events/features/teams";
import { trackNewWorkspaceCreated, trackAddWorkspaceNameModalViewed } from "modules/analytics/events/common/teams";
import LearnMoreAboutWorkspace from "../TeamViewer/common/LearnMoreAboutWorkspace";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { actions } from "store";
import "./CreateWorkspaceModal.css";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

const CreateWorkspaceModal = ({ isOpen, toggleModal, callback, source }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const [isLoading, setIsLoading] = useState(false);
  const [createWorkspaceFormData, setCreateWorkspaceFormData] = useState({
    workspaceName: "",
    description: "",
  });

  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email)?.split(".")[0], [
    user?.details?.profile?.email,
  ]);

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

  useEffect(() => {
    isEmailVerified(user?.details?.profile?.uid).then((result) => {
      if (result && isCompanyEmail(user?.details?.profile?.email)) {
        form.setFieldValue("workspaceName", `${userEmailDomain} <team name>`);
        setCreateWorkspaceFormData((prev) => {
          return { ...prev, workspaceName: `${userEmailDomain} <team name>` };
        });
      }
    });
  }, [user?.details?.profile?.uid, user?.details?.profile?.email, form, userEmailDomain]);

  return (
    <RQModal centered open={isOpen} onCancel={toggleModal}>
      <Form
        form={form}
        layout="vertical"
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
