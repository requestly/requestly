import React, { useCallback, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LockOutlined } from "@ant-design/icons";
import { MdExpandMore } from "@react-icons/all-files/md/MdExpandMore";
import { Avatar, Dropdown, Row, Typography, Col } from "antd";
import { RQButton } from "lib/design-system/components";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { getIsMiscTourCompleted } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getUniqueColorForWorkspace } from "utils/teams";
import APP_CONSTANTS from "config/constants";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import { MISC_TOURS } from "components/misc/ProductWalkthrough/constants";
import { globalActions } from "store/slices/global/slice";
import { trackPricingWorkspaceSwitched } from "features/pricing/analytics";
import "./index.scss";
import { SUB_TOUR_TYPES, TOUR_TYPES } from "components/misc/ProductWalkthrough/types";
import { getActiveWorkspaceId, getAllWorkspaces } from "store/slices/workspaces/selectors";

interface MenuProps {
  workspaceToUpgrade: { name: string; id: string; accessCount: number };
  setWorkspaceToUpgrade: (workspaceDetails: any) => void;
  isOpenedFromModal?: boolean;
  className?: string;
  source: string;
}

const getWorkspaceIcon = (workspaceName: string) => {
  if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE) return <LockOutlined />;
  return workspaceName ? workspaceName[0].toUpperCase() : "?";
};

export const UpgradeWorkspaceMenu: React.FC<MenuProps> = ({
  workspaceToUpgrade,
  setWorkspaceToUpgrade,
  className,
  isOpenedFromModal = false,
  source,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const isMiscTourCompleted = useSelector(getIsMiscTourCompleted);

  const filteredAvailableTeams = useMemo(() => {
    return (
      availableWorkspaces?.filter(
        (team: any) => !team?.archived && team.members?.[user?.details?.profile?.uid]?.role === "admin"
      ) ?? []
    );
  }, [availableWorkspaces, user?.details?.profile?.uid]);

  const populateWorkspaceDetails = useCallback(
    (workspaceId: string) => {
      return filteredAvailableTeams.find((team: any) => team.id === workspaceId);
    },
    [filteredAvailableTeams]
  );

  useEffect(() => {
    if (
      activeWorkspaceId &&
      filteredAvailableTeams.some((availableTeam: any) => availableTeam.id === activeWorkspaceId)
    ) {
      setWorkspaceToUpgrade(populateWorkspaceDetails(activeWorkspaceId));
    } else {
      setWorkspaceToUpgrade(APP_CONSTANTS.TEAM_WORKSPACES.PRIVATE_WORKSPACE);
    }
  }, [activeWorkspaceId, populateWorkspaceDetails, setWorkspaceToUpgrade, filteredAvailableTeams]);

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
      trackPricingWorkspaceSwitched(teamId === "private_workspace" ? "individual" : "team", source);
    },
  };

  return user.loggedIn ? (
    <>
      <ProductWalkthrough
        tourFor={MISC_TOURS.PRICING.UPGRADE_WORKSPACE_MENU}
        startWalkthrough={!isOpenedFromModal && !isMiscTourCompleted?.upgradeWorkspaceMenu}
        onTourComplete={() =>
          dispatch(
            globalActions.updateProductTourCompleted({
              tour: TOUR_TYPES.MISCELLANEOUS,
              subTour: SUB_TOUR_TYPES.UPGRADE_WORKSPACE_MENU,
            })
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
                    globalActions.updateProductTourCompleted({
                      tour: TOUR_TYPES.MISCELLANEOUS,
                      subTour: SUB_TOUR_TYPES.UPGRADE_WORKSPACE_MENU,
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
