import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, Col, Row, Skeleton, Spin, Typography } from "antd";
import { getUniqueColorForWorkspace } from "utils/teams";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQButton } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { redirectToManageWorkspace } from "utils/RedirectionUtils";
import { LoadingOutlined } from "@ant-design/icons";
import { acceptTeamInvite } from "backend/workspace";
import { BiCheckCircle } from "@react-icons/all-files/bi/BiCheckCircle";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import Logger from "lib/logger";
import { actions } from "store";
import { trackWorkspaceInviteAccepted, trackWorkspaceJoinClicked } from "modules/analytics/events/features/teams";
import "./teamsListItem.scss";

interface Props {
  inviteId?: string;
  teamId: string;
  teamName: string;
}

export const TeamsListItem: React.FC<Props> = ({ inviteId, teamId, teamName }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [members, setMembers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const getTeamUsers = useMemo(() => httpsCallable(getFunctions(), "teams-getTeamUsers"), []);

  useEffect(() => {
    if (teamId) {
      // TODO: Add support for getting team members from a team with domain invite.
      getTeamUsers({ teamId: teamId })
        .then((res: any) => {
          console.log({ res });
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
  }, [teamId, getTeamUsers]);

  const handleJoining = useCallback(() => {
    trackWorkspaceJoinClicked(teamId, "homepage");
    setIsJoining(true);
    acceptTeamInvite(inviteId)
      .then((res) => {
        if (res?.data?.success) {
          toast.success("Team joined successfully");
          setHasJoined(true);
          trackWorkspaceInviteAccepted(
            teamId,
            teamName,
            inviteId,
            "homepage",
            res?.data?.data?.invite?.usage,
            res?.data?.data?.invite?.metadata?.teamAccessCount
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
  }, [inviteId, teamId, teamName]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <Row className="teams-list-item" justify="space-between">
      <Col span={11}>
        <Row align="middle" wrap={false}>
          <Avatar
            size={24}
            shape="square"
            className="workspace-avatar"
            icon={teamName ? teamName?.[0]?.toUpperCase() : "W"}
            style={{
              backgroundColor: `${getUniqueColorForWorkspace(teamId ?? "", teamName)}`,
              marginRight: "8px",
            }}
          />
          <Typography.Text className="text-bold text-white teams-list-item-title" ellipsis>
            {teamName}
          </Typography.Text>
        </Row>
      </Col>
      <Col span={12} className="teams-list-actions-wrapper">
        <Row align="middle">
          <Avatar.Group maxCount={3} size="small" maxStyle={{ display: "none" }}>
            {members?.map((member: any) => (
              <Avatar size={24} shape="circle" key={member?.id} src={member?.photoURL}>
                {member?.displayName?.[0]?.toUpperCase()}
              </Avatar>
            ))}
          </Avatar.Group>
          <Col className="teams-list-item-members-count">
            {members?.length > 3 && <div>+{members?.length - 3} members</div>}
          </Col>
        </Row>
        {!inviteId && (
          <RQButton
            type="default"
            iconOnly
            icon={<MdOutlineSettings />}
            className="teams-list-item-setting-btn"
            onClick={() => {
              redirectToManageWorkspace(navigate, teamId);
            }}
          />
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
              // TODO: Allow members to invite other members to a team
              dispatch(
                actions.toggleActiveModal({
                  modalName: "inviteMembersModal",
                  newValue: true,
                  newProps: {
                    teamId: teamId,
                    source: "homepage",
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
