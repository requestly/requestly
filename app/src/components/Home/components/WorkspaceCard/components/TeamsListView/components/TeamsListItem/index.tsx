import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, Col, Row, Skeleton, Spin, Tooltip, Typography } from "antd";
import { getUniqueColorForUser } from "utils/teams";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQButton } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { redirectToManageWorkspace } from "utils/RedirectionUtils";
import { LoadingOutlined } from "@ant-design/icons";
import { acceptTeamInvite } from "backend/workspace";
import { BiCheckCircle } from "@react-icons/all-files/bi/BiCheckCircle";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import Logger from "lib/logger";
import { globalActions } from "store/slices/global/slice";
import { trackWorkspaceInviteAccepted, trackWorkspaceJoinClicked } from "modules/analytics/events/features/teams";
import { trackHomeWorkspaceActionClicked } from "components/Home/analytics";
import { SOURCE } from "modules/analytics/events/common/constants";
import "./teamsListItem.scss";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { Workspace } from "features/workspaces/types";

type Member = {
  id: any;
  displayName: any;
  photoUrl: any;
  email: any;
  role: "read" | "write" | "admin";
  isAdmin: boolean;
  isOwner: boolean;
};

interface Props {
  inviteId?: string;
  workspace: Workspace;
}

export const TeamsListItem: React.FC<Props> = ({ inviteId, workspace }) => {
  const MAX_MEMBERS_TO_SHOW = 3;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (workspace?.id) {
      const getTeamUsers = httpsCallable<{ teamId: string }, Member[] | null>(getFunctions(), "teams-getTeamUsers");

      getTeamUsers({ teamId: workspace?.id })
        .then((res: any) => {
          if (res.data.success) {
            setMembers(res.data.users);
          } else {
            setMembers([]);
          }
        })
        .catch((e) => {
          Logger.log(e);
          setMembers([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [workspace?.id]);

  const handleJoining = useCallback(() => {
    trackWorkspaceJoinClicked(workspace?.id, SOURCE.HOME_SCREEN);
    trackHomeWorkspaceActionClicked("join_workspace_clicked");
    setIsJoining(true);
    acceptTeamInvite(inviteId)
      .then((res) => {
        if (res?.success) {
          toast.success("Team joined successfully");
          setHasJoined(true);
          trackWorkspaceInviteAccepted(
            workspace?.id,
            workspace?.name,
            inviteId,
            SOURCE.HOME_SCREEN,
            res?.data?.invite?.usage,
            res?.data?.invite?.metadata?.teamAccessCount
          );
        } else {
          toast.error("Something went wrong, please try again");
        }
      })
      .catch((e) => {
        Logger.error(e);
        toast.error("Something went wrong, please try again");
      })
      .finally(() => {
        setIsJoining(false);
      });
  }, [inviteId, workspace?.id, workspace?.name]);

  return (
    <Row className="teams-list-item" justify="space-between">
      <Col span={11}>
        <Row align="middle" wrap={false}>
          <WorkspaceAvatar size={24} workspace={workspace} />
          <Typography.Text className="text-bold text-white teams-list-item-title" ellipsis>
            {workspace?.name}
          </Typography.Text>
        </Row>
      </Col>
      <Col span={12} className="teams-list-actions-wrapper">
        <Row align="middle">
          {isLoading ? (
            <div className="teams-list-avatar-loading-wrapper" style={{ marginRight: inviteId ? "14px" : "10px" }}>
              {Array.from({ length: MAX_MEMBERS_TO_SHOW + 1 }).map((_, index) => (
                <Skeleton key={index} active avatar className="teams-list-avatar-loading" />
              ))}
            </div>
          ) : (
            <Avatar.Group
              maxCount={MAX_MEMBERS_TO_SHOW}
              size="small"
              maxPopoverTrigger="click"
              maxStyle={{ cursor: "pointer", background: "var(--requestly-color-text-default)", color: "#000" }}
              style={{ marginRight: inviteId ? "14px" : "10px" }}
            >
              {members?.map((member: any) => (
                <>
                  {member?.photoUrl && !member?.photoUrl?.includes("gravatar") ? (
                    <Tooltip title={member?.email} color="#000">
                      <Avatar size={24} shape="circle" key={member?.id} src={member.photoUrl} />
                    </Tooltip>
                  ) : (
                    <Tooltip title={member?.email} color="#000">
                      <Avatar
                        size={24}
                        shape="circle"
                        key={member?.id}
                        style={{ background: getUniqueColorForUser(member.email ?? "User") }}
                      >
                        {member?.displayName?.[0]?.toUpperCase() ?? "U"}
                      </Avatar>
                    </Tooltip>
                  )}
                </>
              ))}
            </Avatar.Group>
          )}
        </Row>
        {!inviteId && (
          <Tooltip color="#000" title="Manage workspace">
            <RQButton
              type="default"
              iconOnly
              icon={<MdOutlineSettings />}
              className="teams-list-item-setting-btn"
              onClick={() => {
                trackHomeWorkspaceActionClicked("manage_workspace_clicked");
                redirectToManageWorkspace(navigate, workspace?.id);
              }}
            />
          </Tooltip>
        )}
        {inviteId ? (
          <>
            {hasJoined ? (
              <Col className="teams-list-joined-tag">
                <BiCheckCircle />
                <span>Joined</span>
              </Col>
            ) : (
              <RQButton onClick={handleJoining} className={`${isJoining ? "teams-list-join-btn-dark-bg" : ""}`}>
                {isJoining ? (
                  <Spin indicator={<LoadingOutlined className="teams-list-join-btn-loader" spin />} />
                ) : (
                  "Join"
                )}
              </RQButton>
            )}
          </>
        ) : (
          <RQButton
            type="default"
            onClick={() => {
              trackHomeWorkspaceActionClicked("invite_members_clicked");
              dispatch(
                globalActions.toggleActiveModal({
                  modalName: "inviteMembersModal",
                  newValue: true,
                  newProps: {
                    teamId: workspace?.id,
                    source: SOURCE.HOME_SCREEN,
                  },
                })
              );
            }}
          >
            Invite
          </RQButton>
        )}
      </Col>
    </Row>
  );
};
