import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { httpsCallable, getFunctions } from "firebase/functions";
import { Typography, Switch, Divider, Row } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import MemberRoleDropdown from "components/user/AccountIndexPage/ManageAccount/ManageTeams/TeamViewer/common/MemberRoleDropdown";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { CopyOutlined } from "@ant-design/icons";
import { toast } from "utils/Toast";
import { WorkspaceStepFooter } from "./Footer";
import { OnboardingSteps } from "../../types";
import { actions } from "store";
import "./index.css";

interface Props {
  createdTeamData: { teamId: string; inviteId: string } | null;
}
export const CreateWorkspace: React.FC<Props> = ({ createdTeamData }) => {
  const [userEmail, setUserEmail] = useState<string[]>([]);
  const [makeUserAdmin, setMakeUserAdmin] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>("Copy");
  // const [newTeamData, setNewTeamData] = useState(null);
  const dispatch = useDispatch();

  const handleAddMembers = () => {
    if (!userEmail || !userEmail.length) {
      toast.warn("Please add members email to invite them");
      return;
    }
    setIsProcessing(true);

    const createTeamInvites = httpsCallable(getFunctions(), "invites-createTeamInvites");

    createTeamInvites({
      teamId: createdTeamData?.teamId,
      emails: userEmail,
      role: makeUserAdmin ? "admin" : "write",
    })
      .then((res: any) => {
        console.log({ res });
        if (res?.data?.success) {
          toast.success("Sent invites successfully");
          setIsProcessing(false);
          dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS));
        } else {
          setIsProcessing(false);
        }
      })
      .catch((err) => {
        toast.error("Error while creating invitations. Make sure you are an admin");
      });
  };

  const handleOnCopy = () => {
    setCopiedText("Copied");
    navigator.clipboard.writeText(`htts://requestly.io/${createdTeamData?.inviteId}`); //copy to clipboard
    setTimeout(() => {
      setCopiedText("Copy");
    }, 500);
  };

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
          defaultValue="MY NEW WORKSPACE"
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
          value={userEmail}
          onChange={setUserEmail}
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
      {createdTeamData && (
        <div className="mt-20">
          <div className="text-bold text-white">Invite link</div>
          <div className="workspace-invite-link">
            <RQInput
              size="small"
              className="mt-8 workspace-onboarding-field text-white"
              disabled
              value={`https://requestly.io/invite/${createdTeamData?.inviteId}`}
            />
            <RQButton type="default" onClick={handleOnCopy}>
              <CopyOutlined />
              {copiedText}
            </RQButton>
          </div>
        </div>
      )}
      <Divider />
      <div className="mt-20 space-between">
        <Typography.Text className="text-gray">Anyone with requestly.io can join the workspace</Typography.Text>
        <Switch defaultChecked />
      </div>
      <WorkspaceStepFooter
        onSkip={() => dispatch(actions.updateWorkspaceOnboardingStep(OnboardingSteps.RECOMMENDATIONS))}
        onContinue={handleAddMembers}
        isProcessing={isProcessing}
      />
    </>
  );
};
