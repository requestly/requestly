import React, { useMemo } from "react";
import { Col, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RQButton } from "lib/design-system/components";
import { TeamsListItem } from "./components/TeamsListItem";
import { m, AnimatePresence } from "framer-motion";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { Invite } from "types";
import { globalActions } from "store/slices/global/slice";
import { trackHomeWorkspaceActionClicked } from "components/Home/analytics";
import { SOURCE } from "modules/analytics/events/common/constants";
import "./teamsListView.scss";
import { getAllWorkspaces } from "store/slices/workspaces/selectors";
import { Workspace, WorkspaceType } from "features/workspaces/types";

interface Props {
  pendingInvites?: Invite[];
  heading: string;
  subheading?: string;
}

export const TeamsListView: React.FC<Props> = ({ pendingInvites, heading, subheading }) => {
  const dispatch = useDispatch();
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const sortedAvailableTeams = useMemo(
    () => [...(availableWorkspaces ?? [])]?.sort((a: Workspace, b: Workspace) => b?.accessCount - a?.accessCount),
    [availableWorkspaces]
  );

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: "relative" }}
        className="h-full"
      >
        <Col className="homepage-teams-card-content h-full">
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
                      workspace={
                        {
                          id: invite.metadata.teamId,
                          name: invite.metadata.teamName,
                          workspaceType: WorkspaceType.SHARED,
                        } as Workspace
                      }
                    />
                  ))}
                </>
              ) : (
                <>
                  {sortedAvailableTeams.map((workspace: Workspace, index: number) => (
                    <TeamsListItem key={index} workspace={workspace} />
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
              globalActions.toggleActiveModal({
                modalName: "createWorkspaceModal",
                newValue: true,
                newProps: {
                  source: SOURCE.HOME_SCREEN,
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
