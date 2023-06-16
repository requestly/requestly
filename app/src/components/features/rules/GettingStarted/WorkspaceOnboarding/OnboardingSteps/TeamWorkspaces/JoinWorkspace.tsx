import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Avatar } from "antd";
import { RQButton } from "lib/design-system/components";
import { PlusOutlined } from "@ant-design/icons";
import { actions } from "store";
import { TeamWorkspace } from "types";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { getAppMode } from "store/selectors";
import { redirectToTeam } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";

const Workspace: React.FC<{ team: TeamWorkspace }> = ({ team }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const appMode = useSelector(getAppMode);

  const [isJoining, setIsJoining] = useState<boolean>(false);

  const handleJoinWorkspace = () => {
    setIsJoining(true);
    const functions = getFunctions();
    const acceptInvite = httpsCallable(functions, "invites-acceptInvite");

    acceptInvite({ inviteId: team.inviteId })
      .then((res: any) => {
        if (res?.data?.success) {
          toast.success("Successfully accepted invite");

          if (res?.data?.data?.invite.type === "teams") {
            switchWorkspace(
              {
                teamId: res?.data?.data?.invite?.metadata?.teamId,
                teamName: res?.data?.data?.invite?.metadata?.teamName,
                teamMembersCount: 1,
              },
              dispatch,
              {
                isWorkspaceMode,
              },
              appMode
            );
            redirectToTeam(navigate, res?.data?.data?.invite?.metadata?.teamId, {
              state: {
                isNewTeam: false,
              },
            });
          }
        }
        setIsJoining(false);
      })
      .catch((err) => {
        toast.error("Error while accepting invitation. Please contact workspace admin");
        setIsJoining(false);
      });
  };

  return (
    <div className="space-between onboarding-workspace-card">
      <div className="display-flex">
        <Avatar size={28} shape="square" className="workspace-avatar" icon={<>{team.name.charAt(0)}</>} />
        <span className="text-bold onboarding-workspace-card-name">{team.name}</span>
      </div>
      <div className="text-gray">{team.accessCount}</div>
      <RQButton loading={isJoining} className="text-bold" type="primary" onClick={handleJoinWorkspace}>
        {isJoining ? "Joining" : "Join"}
      </RQButton>
    </div>
  );
};

export const JoinWorkspace: React.FC<{ availableTeams: TeamWorkspace[] }> = ({ availableTeams }) => {
  const dispatch = useDispatch();

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  return (
    <>
      <div className="header text-center ">We found your team on Requestly</div>
      <div className="display-row-center mt-20">
        <div className="text-gray text-center" style={{ width: "380px" }}>
          Join your teams workspace and get access to shared rules, mock APIs & session replays.
        </div>
      </div>
      <div className="mt-20">
        {availableTeams.map((team) => (
          <Workspace team={team} />
        ))}
      </div>

      <div className="workspace-onboarding-footer">
        <RQButton type="text" onClick={() => dispatch(actions.updateIsWorkspaceOnboardingCompleted())}>
          Skip for now
        </RQButton>
        <RQButton
          type="default"
          className="text-bold"
          onClick={() => {
            setIsProcessing(true);
          }}
          loading={isProcessing}
          icon={<PlusOutlined />}
        >
          Create new workspace
        </RQButton>
      </div>
    </>
  );
};
