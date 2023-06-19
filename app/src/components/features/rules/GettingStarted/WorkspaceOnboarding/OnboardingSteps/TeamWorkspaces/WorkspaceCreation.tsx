import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { httpsCallable, getFunctions } from "firebase/functions";
import { Typography, Switch, Divider, Row } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import MemberRoleDropdown from "components/user/AccountIndexPage/ManageAccount/ManageTeams/TeamViewer/common/MemberRoleDropdown";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { CopyOutlined } from "@ant-design/icons";
import { toast } from "utils/Toast";
import { NewTeamData, OnboardingSteps } from "../../types";
import { actions } from "store";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

interface Props {
  defaultTeamData: NewTeamData | null;
}
export const CreateWorkspace: React.FC<Props> = ({ defaultTeamData }) => {
  const dispatch = useDispatch();
  const functions = getFunctions();

  const upsertTeamCommonInvite = useMemo(
    () =>
      httpsCallable<{ teamId: string; domainEnabled: boolean }, { succes: true }>(
        functions,
        "invites-upsertTeamCommonInvite"
      ),
    [functions]
  );

  const user = useSelector(getUserAuthDetails);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const appMode = useSelector(getAppMode);

  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [makeUserAdmin, setMakeUserAdmin] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>("Copy");
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>("");
  const [domainJoiningEnabled, setDomainJoiningEnabled] = useState<boolean>(true);
  // const [newTeamData, setNewTeamData] = useState(null);

  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email), [
    user?.details?.profile?.email,
  ]);

  const handleCreateNewTeam = () => {
    setIsProcessing(true);
    const createTeam = httpsCallable(getFunctions(), "teams-createTeam");
    createTeam({
      teamName: newWorkspaceName,
    }).then((response: any) => {
      handleAddMembers(newWorkspaceName, response?.data?.teamId);
    });
  };

  const handleAddMembers = (newTeamName?: string, newTeamId?: string) => {
    if (!inviteEmails || !inviteEmails.length) {
      toast.warn("Please add members email to invite them");
      return;
    }
    setIsProcessing(true);

    const createTeamInvites = httpsCallable(getFunctions(), "invites-createTeamInvites");

    createTeamInvites({
      teamId: defaultTeamData?.teamId ?? newTeamId,
      emails: inviteEmails,
      role: makeUserAdmin ? "admin" : "write",
    })
      .then((res: any) => {
        if (res?.data?.success) {
          toast.success("Sent invites successfully");
          dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS));
        }
        setIsProcessing(false);
        switchWorkspace(
          {
            teamId: defaultTeamData?.teamId ?? newTeamId,
            teamMembersCount: 1,
          },
          dispatch,
          {
            isWorkspaceMode,
          },
          appMode
        );
      })
      .catch((err) => {
        toast.error("Error while sending invitations");
      });
  };

  const handleOnCopy = () => {
    setCopiedText("Copied");
    navigator.clipboard.writeText(`htts://requestly.io/${defaultTeamData?.inviteId}`);
    setTimeout(() => {
      setCopiedText("Copy");
    }, 500);
  };

  const handleDomainToggle = useCallback(
    (enabled: boolean) => {
      if (defaultTeamData) {
        upsertTeamCommonInvite({ teamId: defaultTeamData?.teamId, domainEnabled: enabled }).then((res: any) => {
          if (res?.data?.success) {
            setDomainJoiningEnabled(enabled);
          }
        });
      }
    },
    [defaultTeamData, upsertTeamCommonInvite]
  );

  useEffect(() => {
    if (defaultTeamData) {
      upsertTeamCommonInvite({ teamId: defaultTeamData?.teamId, domainEnabled: true });
    }
  }, [defaultTeamData, upsertTeamCommonInvite]);

  return (
    <>
      <div className="header text-center ">Invite teammates</div>
      <div className="mt-20">
        <label htmlFor="workspace-name" className="text-bold text-white">
          Name of your workspace
        </label>
        <RQInput
          id="workspace-name"
          size="small"
          placeholder="Workspace name"
          className="mt-8 workspace-onboarding-field"
          defaultValue={defaultTeamData?.name ?? "My new team"}
          disabled={defaultTeamData ? true : false}
          value={defaultTeamData?.name ?? newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
        />
      </div>
      <div className="mt-20">
        <label htmlFor="email-address" className="text-bold text-white">
          Email address
        </label>
        <ReactMultiEmail
          className="mt-8"
          placeholder="Add multiple email address separated by commas"
          //@ts-ignore
          type="email"
          value={inviteEmails}
          onChange={setInviteEmails}
          validateEmail={validateEmail}
          getLabel={(email, index, removeEmail) => (
            <div data-tag key={index} className="multi-email-tag">
              {email}
              <span title="Remove" data-tag-handle onClick={() => removeEmail(index)}>
                <img alt="remove" src="/assets/img/workspaces/cross.svg" />
              </span>
            </div>
          )}
        />
        <Row justify="end" className="mt-8">
          <MemberRoleDropdown
            placement="bottomRight"
            isAdmin={makeUserAdmin}
            handleMemberRoleChange={(isAdmin) => setMakeUserAdmin(isAdmin)}
          />
        </Row>
      </div>
      {defaultTeamData && (
        <div className="mt-20">
          <div className="text-bold text-white">Invite link</div>
          <div className="workspace-invite-link">
            <RQInput
              size="small"
              className="mt-8 workspace-onboarding-field text-white"
              disabled
              value={`https://requestly.io/invite/${defaultTeamData?.inviteId}`}
            />
            <RQButton type="default" onClick={handleOnCopy}>
              <CopyOutlined />
              {copiedText}
            </RQButton>
          </div>
        </div>
      )}
      {defaultTeamData && (
        <>
          <Divider />
          <div className="mt-20 space-between">
            <Typography.Text className="text-gray">
              Anyone with {userEmailDomain} can join the workspace
            </Typography.Text>
            <Switch checked={domainJoiningEnabled} onChange={handleDomainToggle} />
          </div>
        </>
      )}

      <div className="workspace-onboarding-footer">
        <RQButton
          type="text"
          onClick={() => dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS))}
        >
          Skip for now
        </RQButton>
        <RQButton
          type="primary"
          className="text-bold"
          onClick={() => {
            defaultTeamData ? handleAddMembers() : handleCreateNewTeam();
          }}
          loading={isProcessing}
        >
          {defaultTeamData ? "Send invitations" : "Create workspace"}
        </RQButton>
      </div>
    </>
  );
};
