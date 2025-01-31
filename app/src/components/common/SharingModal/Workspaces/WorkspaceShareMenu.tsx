import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Avatar, Row, Dropdown } from "antd";
import { getUniqueColorForWorkspace } from "features/workspaces/components/WorkspaceAvatar";
import { RQButton } from "lib/design-system/components";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import type { MenuProps } from "antd";
import { trackShareModalWorkspaceDropdownClicked } from "modules/analytics/events/misc/sharing";
import { getActiveWorkspaceIds, getAllWorkspaces } from "store/slices/workspaces/selectors";
import { getActiveWorkspaceId, isPersonalWorkspace } from "features/workspaces/utils";
import { Workspace } from "features/workspaces/types";

interface Props {
  /**
   * The default number of active workspaces to display before dropdown menu.
   */
  defaultActiveWorkspaces?: number;
  onTransferClick: (workspace: Workspace) => void;
  isLoading: boolean;
}

interface WorkspaceItemProps {
  workspace: Workspace;
  availableWorkspaces?: Workspace[];
  onTransferClick?: (workspace: Workspace) => void;
  showArrow?: boolean;
  isLoading?: boolean;
}

export const WorkspaceShareMenu: React.FC<Props> = ({ onTransferClick, isLoading, defaultActiveWorkspaces = 0 }) => {
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const activeWorkspaceIds = useSelector(getActiveWorkspaceIds);
  const activeWorkspaceId = getActiveWorkspaceId(activeWorkspaceIds);

  const activeWorkspace: Workspace = useMemo(
    () => availableWorkspaces?.find((team: Workspace) => team?.id === activeWorkspaceId),
    [activeWorkspaceId, availableWorkspaces]
  );
  const sortedWorkspaces: Workspace[] = useMemo(
    () =>
      availableWorkspaces
        ? [...availableWorkspaces].sort((a: Workspace, b: Workspace) => b.accessCount - a.accessCount)
        : [],
    [availableWorkspaces]
  );

  const filteredWorkspaces = sortedWorkspaces.filter((workspace: Workspace) => !isPersonalWorkspace(workspace?.id));

  const menuItems: MenuProps["items"] = useMemo(() => {
    return filteredWorkspaces
      .slice(defaultActiveWorkspaces || 0)
      .map((workspace: Workspace, index: number) => {
        if (!defaultActiveWorkspaces && workspace?.id === activeWorkspace?.id) return null;
        return {
          key: index,
          label: <WorkspaceItem isLoading={isLoading} onTransferClick={onTransferClick} workspace={workspace} />,
        };
      })
      .filter(Boolean);
  }, [filteredWorkspaces, activeWorkspace?.id, onTransferClick, defaultActiveWorkspaces, isLoading]);

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
            {filteredWorkspaces.slice(0, defaultActiveWorkspaces).map((workspace: Workspace, index: number) => (
              <WorkspaceItem
                isLoading={isLoading}
                workspace={workspace}
                onTransferClick={onTransferClick}
                key={index}
              />
            ))}
          </div>
          {filteredWorkspaces.length > defaultActiveWorkspaces && (
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
          trigger={availableWorkspaces?.length > 1 ? ["click"] : [null]}
          onOpenChange={(open) => {
            if (open) trackShareModalWorkspaceDropdownClicked();
          }}
        >
          <div>
            <WorkspaceItem workspace={activeWorkspace} showArrow availableWorkspaces={availableWorkspaces} />
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
        showArrow && availableWorkspaces?.length > 1 && "workspace-share-menu-dropdown"
      }`}
    >
      <Row align="middle" className="items-center">
        <Avatar
          size={35}
          className="workspace-avatar"
          shape="square"
          icon={workspace.name ? workspace.name?.[0]?.toUpperCase() : "W"}
          style={{
            backgroundColor: `${getUniqueColorForWorkspace(workspace.id ?? "", workspace.name)}`,
          }}
        />
        <span className="workspace-card-description">
          <div className="text-white">{workspace.name}</div>
          <div className="text-gray">
            {workspace.accessCount} {workspace.accessCount > 1 ? "members" : "member"}
          </div>
        </span>
      </Row>
      {showArrow ? (
        availableWorkspaces?.length > 1 ? (
          <MdOutlineKeyboardArrowDown className="text-gray header mr-8" />
        ) : null
      ) : (
        <RQButton
          disabled={isLoading}
          type="link"
          className="workspace-menu-item-transfer-btn"
          onClick={() => onTransferClick(workspace)}
        >
          Copy here
        </RQButton>
      )}
    </div>
  );
};
