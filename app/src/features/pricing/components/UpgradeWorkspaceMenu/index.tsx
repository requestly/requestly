import React, { useCallback, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LockOutlined } from "@ant-design/icons";
import { MdExpandMore } from "@react-icons/all-files/md/MdExpandMore";
import { Avatar, Dropdown, Row, Typography, Col } from "antd";
import { RQButton } from "lib/design-system/components";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { getUserAuthDetails, getIsMiscTourCompleted } from "store/selectors";
import { getAvailableTeams, getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUniqueColorForWorkspace } from "utils/teams";
import APP_CONSTANTS from "config/constants";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import { MISC_TOURS, TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import { actions } from "store";
import { trackPricingWorkspaceSwitched } from "features/pricing/analytics";
import "./index.scss";

const getWorkspaceIcon = (workspaceName: string) => {
  if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE) return <LockOutlined />;
  return workspaceName ? workspaceName[0].toUpperCase() : "?";
};

export const UpgradeWorkspaceMenu: React.FC<{
  workspaceToUpgrade: { name: string; id: string; accessCount: number };
  setWorkspaceToUpgrade: (workspaceDetails: any) => void;
  isOpenedFromModal?: boolean;
  className?: string;
}> = ({ workspaceToUpgrade, setWorkspaceToUpgrade, className, isOpenedFromModal = false }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const availableTeams = useSelector(getAvailableTeams);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const isMiscTourCompleted = useSelector(getIsMiscTourCompleted);

  const filteredAvailableTeams = useMemo(() => {
    return (
      availableTeams?.filter(
        (team: any) => !team?.archived && team.members?.[user?.details?.profile?.uid]?.role === "admin"
      ) ?? []
    );
  }, [availableTeams, user?.details?.profile?.uid]);

  const populateWorkspaceDetails = useCallback(
    (workspaceId: string) => {
      return filteredAvailableTeams.find((team: any) => team.id === workspaceId);
    },
    [filteredAvailableTeams]
  );

  useEffect(() => {
    if (currentlyActiveWorkspace?.id) {
      setWorkspaceToUpgrade(populateWorkspaceDetails(currentlyActiveWorkspace?.id));
    }
  }, [currentlyActiveWorkspace?.id, populateWorkspaceDetails, setWorkspaceToUpgrade]);

  const workspaceMenuItems = {
    items: [
      {
        key: "private_workspace",
        label: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
        icon: (
          <Avatar
            size={18}
            shape="square"
            icon={getWorkspaceIcon(APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE)}
            className="workspace-avatar"
            style={{ backgroundColor: "#1E69FF" }}
          />
        ),
      },
      ...filteredAvailableTeams.map((team: any) => ({
        label: team.name,
        key: team.id,
        icon: (
          <Avatar
            size={18}
            shape="square"
            icon={getWorkspaceIcon(team.name)}
            className="workspace-avatar"
            style={{
              backgroundColor: getUniqueColorForWorkspace(team?.id, team.name),
            }}
          />
        ),
      })),
    ],
    onClick: ({ key: teamId }: { key: string }) => {
      if (teamId === "private_workspace") {
        return setWorkspaceToUpgrade({
          name: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
          id: "private_workspace",
          accessCount: 1,
        });
      }
      setWorkspaceToUpgrade(populateWorkspaceDetails(teamId));
      trackPricingWorkspaceSwitched(
        teamId === "private_workspace" ? "individual" : "team",
        isOpenedFromModal ? "pricing_modal" : "pricing_page"
      );
    },
  };

  return user.loggedIn ? (
    <>
      <ProductWalkthrough
        tourFor={MISC_TOURS.PRICING.UPGRADE_WORKSPACE_MENU}
        startWalkthrough={!isOpenedFromModal && !isMiscTourCompleted?.upgradeWorkspaceMenu}
        onTourComplete={() =>
          dispatch(
            actions.updateProductTourCompleted({ tour: TOUR_TYPES.MISCELLANEOUS, subTour: "upgradeWorkspaceMenu" })
          )
        }
        completeTourOnUnmount={false}
      />
      <Row className={`upgrade-workspace-selector-container ${className ?? ""}`}>
        <Col className="upgrade-workspace-selector-dropdown-container">
          Select workspace to upgrade
          <Dropdown
            menu={workspaceMenuItems}
            trigger={["click"]}
            overlayClassName="upgrade-workspace-selector-dropdown"
          >
            <RQButton
              className="upgrade-workspace-selector-dropdown-btn"
              data-tour-id="upgrade-workspace-menu"
              onClick={() => {
                if (!isMiscTourCompleted?.upgradeWorkspaceMenu) {
                  dispatch(
                    actions.updateProductTourCompleted({
                      tour: TOUR_TYPES.MISCELLANEOUS,
                      subTour: "upgradeWorkspaceMenu",
                    })
                  );
                }
              }}
            >
              <Row className="cursor-pointer items-center">
                <Avatar
                  size={28}
                  shape="square"
                  icon={getWorkspaceIcon(
                    workspaceToUpgrade?.name ?? APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
                  )}
                  className="workspace-avatar"
                  style={{
                    backgroundColor:
                      !workspaceToUpgrade ||
                      workspaceToUpgrade?.name === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
                        ? TEAM_WORKSPACES.PRIVATE_WORKSPACE.color
                        : getUniqueColorForWorkspace(workspaceToUpgrade?.id, workspaceToUpgrade?.name),
                  }}
                />
                <Col className="upgrade-workspace-dropdown-btn-info">
                  <Typography.Text className="workspace-name">{workspaceToUpgrade?.name}</Typography.Text>
                  <Typography.Text className="workspace-members">
                    {workspaceToUpgrade?.accessCount} active{" "}
                    {workspaceToUpgrade?.accessCount > 1 ? "members" : "member"}
                  </Typography.Text>
                </Col>
                <MdExpandMore className="upgrade-workspace-selector-dropdown-icon" />
              </Row>
            </RQButton>
          </Dropdown>
        </Col>
      </Row>
    </>
  ) : null;
};
