import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { getAvailableTeams } from "store/features/teams/selectors";
import { Avatar, Divider, Row, Dropdown } from "antd";
import { getUniqueColorForWorkspace } from "utils/teams";
import { Team } from "types";
import type { MenuProps } from "antd";
import { RQButton } from "lib/design-system/components";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";

interface Props {
  defaultActiveWorkspaces?: number;
  onTransferClick: (teamData: Team) => void;
  isLoading: boolean;
}

interface WorkspaceItemProps {
  team: Team;
  onTransferClick: (teamData: Team) => void;
  isLoading: boolean;
}
/**
 * @param {number} defaultActiveWorkspaces - The default number of active workspaces to display before dropdown menu.
 */

export const WorkspaceShareMenu: React.FC<Props> = ({ onTransferClick, isLoading, defaultActiveWorkspaces = 0 }) => {
  const availableTeams = useSelector(getAvailableTeams);

  const sortedTeams = useMemo(
    () => (availableTeams ? [...availableTeams].sort((a: Team, b: Team) => b.accessCount - a.accessCount) : []),
    [availableTeams]
  );

  const menuItems: MenuProps["items"] = useMemo(() => {
    return sortedTeams.slice(defaultActiveWorkspaces ? defaultActiveWorkspaces : 0).map((team, index) => {
      return {
        key: index,
        label: <WorkspaceItem isLoading={isLoading} onTransferClick={onTransferClick} team={team} />,
      };
    });
  }, [sortedTeams, onTransferClick, defaultActiveWorkspaces, isLoading]);

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
            >
              <div>{chooseOtherWorkspaceItem}</div>
            </Dropdown>
          )}
        </>
      ) : (
        <></> //TODO: case 3 & 4
      )}
      <Divider />
    </>
  );
};

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({ team, isLoading, onTransferClick }) => {
  return (
    <div className="workspace-share-menu-item-card">
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
      <RQButton
        disabled={isLoading}
        type="link"
        className="workspace-menu-item-transfer-btn"
        onClick={() => onTransferClick(team)}
      >
        Transfer here
      </RQButton>
    </div>
  );
};
