import React from "react";
import { Col, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RQButton } from "lib/design-system/components";
import { TeamsListItem } from "./components/TeamsListItem";
import { m, AnimatePresence } from "framer-motion";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { Invite, Team } from "types";
import { actions } from "store";
import { getAvailableTeams } from "store/features/teams/selectors";
import { trackHomeWorkspaceActionClicked } from "components/Home/analytics";
import "./teamsListView.scss";

interface Props {
  pendingInvites?: Invite[];
  heading: string;
  subheading?: string;
}

export const TeamsListView: React.FC<Props> = ({ pendingInvites, heading, subheading }) => {
  const dispatch = useDispatch();
  const availableTeams = useSelector(getAvailableTeams);

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: "relative" }}
        className="h-full"
      >
        <Col className="homepage-teams-card-content">
          <Typography.Text className="homepage-teams-list-title">{heading}</Typography.Text>
          <Col>
            {subheading && (
              <Typography.Text className="mt-8 homepage-teams-list-subtitle">{subheading}</Typography.Text>
            )}
            <Col className="homepage-teams-list">
              {pendingInvites ? (
                <>
                  {pendingInvites.map((invite: Invite, index: number) => (
                    <TeamsListItem
                      key={index}
                      inviteId={invite.id}
                      teamId={invite.metadata.teamId as string}
                      teamName={invite.metadata.teamName as string}
                    />
                  ))}
                </>
              ) : (
                <>
                  {availableTeams.map((team: Team, index: number) => (
                    <TeamsListItem key={index} teamId={team.id} teamName={team.name} />
                  ))}
                </>
              )}
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
            trackHomeWorkspaceActionClicked("create_new_workspace");
            dispatch(
              actions.toggleActiveModal({
                modalName: "createWorkspaceModal",
                newValue: true,
                newProps: {
                  source: "home_screen",
                },
              })
            );
          }}
        >
          New workspace
        </RQButton>
      </m.div>
    </AnimatePresence>
  );
};
