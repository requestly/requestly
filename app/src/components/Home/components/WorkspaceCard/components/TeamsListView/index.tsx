import React from "react";
import { Col, Typography } from "antd";
import { useDispatch } from "react-redux";
import { RQButton } from "lib/design-system/components";
import { TeamsListItem } from "./components/TeamsListItem";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { Invite } from "types";
import { actions } from "store";
import "./teamsListView.scss";

interface Props {
  pendingInvites: Invite[];
  heading: string;
  subheading?: string;
}

export const TeamsListView: React.FC<Props> = ({ pendingInvites, heading, subheading }) => {
  const dispatch = useDispatch();
  return (
    <Col style={{ position: "relative" }} className="h-full">
      <Col className="homepage-teams-card-content">
        <Typography.Text className="homepage-teams-list-title">{heading}</Typography.Text>
        <Col>
          {subheading && <Typography.Text className="mt-8 homepage-teams-list-subtitle">{subheading}</Typography.Text>}
          <Col className="homepage-teams-list">
            {pendingInvites.map((invite: Invite) => (
              <TeamsListItem
                inviteId={invite.id}
                teamId={invite.metadata.teamId as string}
                teamName={invite.metadata.teamName as string}
              />
            ))}
          </Col>
        </Col>
      </Col>
      <RQButton
        size="large"
        block
        icon={<IoMdAdd className="mr-8" />}
        type="default"
        className="homepage-teams-list-create-workspace-btn"
        onClick={() => {
          dispatch(
            actions.toggleActiveModal({
              modalName: "createWorkspaceModal",
              newValue: true,
              newProps: {
                source: "homepage",
              },
            })
          );
        }}
      >
        Create workspace
      </RQButton>
    </Col>
  );
};
