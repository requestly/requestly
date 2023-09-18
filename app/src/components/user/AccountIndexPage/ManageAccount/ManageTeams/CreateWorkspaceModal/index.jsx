import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Button, Checkbox, Col, Form, Input, Row } from "antd";
import { RQModal } from "lib/design-system/components";
import { LearnMoreLink } from "components/common/LearnMoreLink";
import { toast } from "utils/Toast";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { redirectToTeam } from "utils/RedirectionUtils";
import { isVerifiedBusinessDomainUser } from "utils/Misc";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { trackNewTeamCreateFailure, trackNewTeamCreateSuccess } from "modules/analytics/events/features/teams";
import { trackNewWorkspaceCreated, trackAddWorkspaceNameModalViewed } from "modules/analytics/events/common/teams";
import APP_CONSTANTS from "config/constants";
import "./CreateWorkspaceModal.css";

const CreateWorkspaceModal = ({ isOpen, toggleModal, callback, source }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const [isLoading, setIsLoading] = useState(false);
  const [isNotifyAllSelected, setIsNotifyAllSelected] = useState(false);
  const [createWorkspaceFormData, setCreateWorkspaceFormData] = useState({
    workspaceName: "",
    description: "",
  });
  const [isVerifiedBusinessUser, setIsVerifiedBusinessUser] = useState(false);

  const createOrgTeamInvite = useMemo(() => httpsCallable(getFunctions(), "invites-createOrganizationTeamInvite"), []);
  const upsertTeamCommonInvite = useMemo(() => httpsCallable(getFunctions(), "invites-upsertTeamCommonInvite"), []);

  const handleFormValuesChange = (_, data) => {
    setCreateWorkspaceFormData(data);
  };

  const handlePostTeamCreation = useCallback(
    (teamId, newTeamName, hasMembersInSameDomain) => {
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
        appMode,
        null,
        "create_workspace_modal"
      );
      redirectToTeam(navigate, teamId, {
        state: {
          isNewTeam: !isNotifyAllSelected || !hasMembersInSameDomain,
        },
      });
    },
    [dispatch, appMode, isNotifyAllSelected, isWorkspaceMode, navigate, user?.details?.isSyncEnabled]
  );

  const handleFinishClick = useCallback(
    async (details) => {
      setIsLoading(true);
      const newTeamName = details.workspaceName;
      const createTeam = httpsCallable(getFunctions(), "teams-createTeam");

      try {
        const response = await createTeam({
          teamName: newTeamName,
        });

        trackNewWorkspaceCreated();
        toast.info("Workspace Created");

        const teamId = response.data.teamId;
        let hasMembersInSameDomain = true; //flag for keeping check if there are more than one user in same domain
        if (isNotifyAllSelected) {
          try {
            const domain = getDomainFromEmail(user?.details?.profile?.email);
            const inviteRes = await createOrgTeamInvite({ domain, teamId });
            await upsertTeamCommonInvite({ teamId, domainEnabled: isNotifyAllSelected });
            console.log({ inviteRes });
            if (inviteRes.data.success) {
              toast.success(`All users from ${domain} have been invited to join this workspace.`);
            } else {
              switch (inviteRes.data.errCode) {
                case "no-users-in-same-domain":
                  hasMembersInSameDomain = false;
                  break;
                default:
                  toast.error(`Could not invite all users from ${domain}.`);
              }
            }
          } catch (error) {
            toast.error(`Could not invite all users from ${getDomainFromEmail(user?.details?.profile?.email)}.`);
          }
        }

        handlePostTeamCreation(teamId, newTeamName, hasMembersInSameDomain);

        callback?.();
        toggleModal();
        trackNewTeamCreateSuccess(teamId, newTeamName, "create_workspace_modal");
        trackNewWorkspaceCreated(isNotifyAllSelected);
      } catch (err) {
        toast.error("Unable to Create Team");
        trackNewTeamCreateFailure(newTeamName);
      } finally {
        setIsLoading(false);
      }
    },
    [
      isNotifyAllSelected,
      createOrgTeamInvite,
      callback,
      toggleModal,
      upsertTeamCommonInvite,
      user?.details?.profile?.email,
      handlePostTeamCreation,
    ]
  );

  const handleFinishFailed = () => toast.error("Please enter valid details");

  useEffect(() => {
    isVerifiedBusinessDomainUser(user?.details?.profile?.email, user?.details?.profile?.uid).then((isVerified) => {
      if (isVerified) {
        setIsVerifiedBusinessUser(isVerified);
        setIsNotifyAllSelected(true);
        const defaultTeamName = `${getDomainFromEmail(user?.details?.profile?.email).split(".")[0]} <team name>`;
        form.setFieldValue("workspaceName", defaultTeamName);
        setCreateWorkspaceFormData((prev) => {
          return { ...prev, workspaceName: defaultTeamName };
        });
      }
    });
  }, [user?.details?.profile?.email, user?.details?.profile?.uid, form]);

  useEffect(() => {
    if (isOpen) trackAddWorkspaceNameModalViewed(source);
  }, [isOpen, source]);

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
            {isVerifiedBusinessUser ? (
              <>
                <Checkbox checked={isNotifyAllSelected} onChange={(e) => setIsNotifyAllSelected(e.target.checked)} />
                <span className="ml-2 text-gray text-sm">
                  Notify all{" "}
                  <span className="text-white text-bold">{getDomainFromEmail(user?.details?.profile?.email)}</span>{" "}
                  users to join this workspace
                </span>
              </>
            ) : (
              <LearnMoreLink
                linkText="Learn more about team workspaces"
                href={APP_CONSTANTS.LINKS.DEMO_VIDEOS.TEAM_WORKSPACES}
              />
            )}
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
