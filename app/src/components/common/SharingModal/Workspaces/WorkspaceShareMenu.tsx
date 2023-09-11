import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { getAvailableTeams, getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { Avatar, Row, Dropdown } from "antd";
import { getUniqueColorForWorkspace } from "utils/teams";
import { RQButton } from "lib/design-system/components";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import type { MenuProps } from "antd";
import { Team } from "types";
import { trackShareModalWorkspaceDropdownClicked } from "modules/analytics/events/misc/sharing";

interface Props {
  /**
   * The default number of active workspaces to display before dropdown menu.
   */
  defaultActiveWorkspaces?: number;
  onTransferClick: (teamData: Team) => void;
  isLoading: boolean;
}

interface WorkspaceItemProps {
  team: Team;
  availableTeams?: Team[];
  onTransferClick?: (teamData: Team) => void;
  showArrow?: boolean;
  isLoading?: boolean;
}

export const WorkspaceShareMenu: React.FC<Props> = ({ onTransferClick, isLoading, defaultActiveWorkspaces = 0 }) => {
  const availableTeams = useSelector(getAvailableTeams);
  const currentlyActiveWorkspaceId = useSelector(getCurrentlyActiveWorkspace)?.id;

  const activeTeamData: Team = useMemo(
    () => availableTeams?.find((team: Team) => team?.id === currentlyActiveWorkspaceId),
    [currentlyActiveWorkspaceId, availableTeams]
  );
  const sortedTeams: Team[] = useMemo(
    () => (availableTeams ? [...availableTeams].sort((a: Team, b: Team) => b.accessCount - a.accessCount) : []),
    [availableTeams]
  );

  const menuItems: MenuProps["items"] = useMemo(() => {
    return sortedTeams
      .slice(defaultActiveWorkspaces || 0)
      .map((team: Team, index: number) => {
        if (!defaultActiveWorkspaces && team?.id === activeTeamData?.id) return null;
        return {
          key: index,
          label: <WorkspaceItem isLoading={isLoading} onTransferClick={onTransferClick} team={team} />,
        };
      })
      .filter(Boolean);
  }, [sortedTeams, activeTeamData?.id, onTransferClick, defaultActiveWorkspaces, isLoading]);

  const chooseOtherWorkspaceItem = (
    <div className="workspace-share-menu-item-card choose-other-workspace">
      <Row align="middle" className="items-center">
        <Avatar
          size={35}
          className="workspace-avatar"
          shape="square"
          icon="*"
          style={{
            backgroundColor: "#B835F6",
          }}
        />
        <span className="workspace-card-description">
          <div className="text-gray">Choose other workspace</div>
        </span>
      </Row>
      <MdOutlineKeyboardArrowDown className="text-gray header mr-8" />
    </div>
  );

  return (
    <>
      {defaultActiveWorkspaces ? (
        <>
          <div className="mt-1">
            {sortedTeams.slice(0, defaultActiveWorkspaces).map((team: Team, index: number) => (
              <WorkspaceItem isLoading={isLoading} team={team} onTransferClick={onTransferClick} key={index} />
            ))}
          </div>
          {sortedTeams.length > defaultActiveWorkspaces && (
            <Dropdown
              menu={{ items: menuItems }}
              placement="bottom"
              overlayClassName="workspace-share-menu-wrapper"
              trigger={["click"]}
              onOpenChange={(open) => {
                if (open) trackShareModalWorkspaceDropdownClicked();
              }}
            >
              <div>{chooseOtherWorkspaceItem}</div>
            </Dropdown>
          )}
        </>
      ) : (
        <Dropdown
          menu={{ items: menuItems }}
          placement="bottom"
          overlayClassName="workspace-share-menu-wrapper"
          trigger={availableTeams?.length > 1 ? ["click"] : [null]}
          onOpenChange={(open) => {
            if (open) trackShareModalWorkspaceDropdownClicked();
          }}
        >
          <div>
            <WorkspaceItem team={activeTeamData} showArrow availableTeams={availableTeams} />
          </div>
        </Dropdown>
      )}
    </>
  );
};

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({
  team,
  onTransferClick,
  availableTeams,
  showArrow = false,
  isLoading = false,
}) => {
  return (
    <div
      className={`workspace-share-menu-item-card ${
        showArrow && availableTeams?.length > 1 && "workspace-share-menu-dropdown"
      }`}
    >
      <Row align="middle" className="items-center">
        <Avatar
          size={35}
          className="workspace-avatar"
          shape="square"
          icon={team.name ? team.name?.[0]?.toUpperCase() : "W"}
          style={{
            backgroundColor: `${getUniqueColorForWorkspace(team.id ?? "", team.name)}`,
          }}
        />
        <span className="workspace-card-description">
          <div className="text-white">{team.name}</div>
          <div className="text-gray">{team.accessCount} members</div>
        </span>
      </Row>
      {showArrow ? (
        availableTeams?.length > 1 ? (
          <MdOutlineKeyboardArrowDown className="text-gray header mr-8" />
        ) : null
      ) : (
        <RQButton
          disabled={isLoading}
          type="link"
          className="workspace-menu-item-transfer-btn"
          onClick={() => onTransferClick(team)}
        >
          Transfer here
        </RQButton>
      )}
    </div>
  );
};
