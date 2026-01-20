import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Avatar, Row, Dropdown } from "antd";
import { RQButton } from "lib/design-system/components";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import type { MenuProps } from "antd";
import { trackShareModalWorkspaceDropdownClicked } from "modules/analytics/events/misc/sharing";
import { getActiveWorkspace, getAllWorkspaces } from "store/slices/workspaces/selectors";
import { Workspace } from "features/workspaces/types";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";

interface Props {
  /**
   * The default number of active workspaces to display before dropdown menu.
   */
  defaultActiveWorkspaces?: number;
  onTransferClick: (teamData: Workspace) => void;
  isLoading: boolean;
}

interface WorkspaceItemProps {
  workspace: Workspace;
  availableWorkspaces?: Workspace[];
  onTransferClick?: (teamData: Workspace) => void;
  showArrow?: boolean;
  isLoading?: boolean;
}

export const WorkspaceShareMenu: React.FC<Props> = ({ onTransferClick, isLoading, defaultActiveWorkspaces = 0 }) => {
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const activeWorkspace = useSelector(getActiveWorkspace);

  const filteredAvailableWorkspaces = availableWorkspaces.filter((workspace) => !workspace.browserstackDetails); // Filtering our Browserstack Workspaces)

  const sortedTeams: Workspace[] = useMemo(
    () =>
      filteredAvailableWorkspaces
        ? [...filteredAvailableWorkspaces].sort(
            (a: Workspace, b: Workspace) => (b.accessCount ?? 0) - (a.accessCount ?? 0)
          )
        : [],
    [filteredAvailableWorkspaces]
  );

  const menuItems: MenuProps["items"] = useMemo(() => {
    return sortedTeams
      .slice(defaultActiveWorkspaces || 0)
      .map((team: Workspace, index: number) => {
        if (!defaultActiveWorkspaces && team?.id === activeWorkspace?.id) return null;
        return {
          key: index,
          label: <WorkspaceItem isLoading={isLoading} onTransferClick={onTransferClick} workspace={team} />,
        };
      })
      .filter(Boolean);
  }, [sortedTeams, activeWorkspace?.id, onTransferClick, defaultActiveWorkspaces, isLoading]);

  const chooseOtherWorkspaceItem = (
    <div className="workspace-share-menu-item-card workspace-share-menu-dropdown">
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
            {sortedTeams.slice(0, defaultActiveWorkspaces).map((team: Workspace, index: number) => (
              <WorkspaceItem isLoading={isLoading} workspace={team} onTransferClick={onTransferClick} key={index} />
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
          trigger={filteredAvailableWorkspaces?.length > 1 ? ["click"] : undefined}
          onOpenChange={(open) => {
            if (open) trackShareModalWorkspaceDropdownClicked();
          }}
        >
          <div>
            <WorkspaceItem workspace={activeWorkspace} showArrow availableWorkspaces={filteredAvailableWorkspaces} />
          </div>
        </Dropdown>
      )}
    </>
  );
};

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({
  workspace,
  onTransferClick,
  availableWorkspaces,
  showArrow = false,
  isLoading = false,
}) => {
  return (
    <div
      className={`workspace-share-menu-item-card ${
        showArrow && (availableWorkspaces?.length ?? 0) > 1 ? "workspace-share-menu-dropdown" : ""
      }`}
    >
      <Row align="middle" className="items-center">
        <WorkspaceAvatar workspace={workspace} size={35} />
        <span className="workspace-card-description">
          <div className="text-white">{workspace.name}</div>
          <div className="text-gray">
            {workspace.accessCount ?? 0} {(workspace.accessCount ?? 0) !== 1 ? "members" : "member"}
          </div>
        </span>
      </Row>
      {showArrow ? (
        availableWorkspaces?.length && availableWorkspaces?.length > 1 ? (
          <MdOutlineKeyboardArrowDown className="text-gray header mr-8" />
        ) : null
      ) : (
        <RQButton
          disabled={isLoading}
          type="link"
          className="workspace-menu-item-transfer-btn"
          onClick={() => onTransferClick?.(workspace)}
        >
          Copy here
        </RQButton>
      )}
    </div>
  );
};
