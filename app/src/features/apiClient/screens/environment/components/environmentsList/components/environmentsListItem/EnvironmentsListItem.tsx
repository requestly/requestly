import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { IoMdGlobe } from "@react-icons/all-files/io/IoMdGlobe";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { Dropdown, Input, Tooltip, Typography } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "utils/Toast";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";
import {
  trackEnvironmentDeleted,
  trackEnvironmentDuplicated,
  trackEnvironmentRenamed,
} from "modules/analytics/events/features/apiClient";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { EnvironmentViewTabSource } from "../../../environmentView/EnvironmentViewTabSource";
import { IoChevronForward } from "@react-icons/all-files/io5/IoChevronForward";
import RequestlyIcon from "assets/img/brand/rq_logo.svg";
import PostmanIcon from "assets/img/brand/postman-icon.svg";
import { useCommand } from "features/apiClient/commands";
import { useEnvironment } from "features/apiClient/hooks/useEnvironment.hook";
import { useActiveEnvironment } from "features/apiClient/hooks/useActiveEnvironment.hook";
import { useContextId } from "features/apiClient/contexts/contextId.context";

export enum ExportType {
  REQUESTLY = "requestly",
  POSTMAN = "postman",
}

interface EnvironmentsListItemProps {
  isReadOnly: boolean;
  environmentId: string;
  onExportClick?: (environment: { id: string; name: string }, exportType: ExportType) => void;
}

export enum EnvironmentMenuKey {
  RENAME = "rename",
  DUPLICATE = "duplicate",
  EXPORT = "export",
  EXPORT_REQUESTLY = "export_requestly",
  EXPORT_POSTMAN = "export_postman",
  DELETE = "delete",
}

export const EnvironmentsListItem: React.FC<EnvironmentsListItemProps> = ({
  isReadOnly,
  environmentId,
  onExportClick,
}) => {
  const {
    env: { renameEnvironment, duplicateEnvironment, deleteEnvironment },
  } = useCommand();

  const contextId = useContextId();
  const activeEnvironment = useActiveEnvironment();
  const environment = useEnvironment(environmentId, (s) => s);

  const [isRenameInputVisible, setIsRenameInputVisible] = useState(false);
  // TODO: can be cleaned up
  const [newEnvironmentName, setNewEnvironmentName] = useState(environment.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [openTab, closeTabBySource, activeTabSource] = useTabServiceWithSelector((state) => [
    state.openTab,
    state.closeTabBySource,
    state.activeTabSource,
  ]);

  const activeTabSourceId = useMemo(() => {
    if (activeTabSource) {
      return activeTabSource.getSourceId();
    }
  }, [activeTabSource]);

  const handleEnvironmentRename = useCallback(async () => {
    try {
      if (newEnvironmentName === environment.name) {
        setIsRenameInputVisible(false);
        return;
      }

      setIsRenaming(true);
      await renameEnvironment({ environmentId: environment.id, newName: newEnvironmentName });

      trackEnvironmentRenamed();
      openTab(
        new EnvironmentViewTabSource({
          id: environment.id,
          title: newEnvironmentName,
          context: {
            id: contextId,
          },
        })
      );
      toast.success("Environment renamed successfully");
    } catch (error) {
      toast.error("Failed to rename environment");
    } finally {
      setIsRenaming(false);
      setIsRenameInputVisible(false);
    }
  }, [newEnvironmentName, environment.id, environment.name, renameEnvironment, openTab]);

  const handleEnvironmentDuplicate = useCallback(async () => {
    try {
      toast.loading("Duplicating environment...");
      await duplicateEnvironment({ environmentId: environment.id });

      trackEnvironmentDuplicated();
      toast.success("Environment duplicated successfully");
    } catch (error) {
      toast.error("Failed to duplicate environment");
    }
  }, [environment.id, duplicateEnvironment]);

  const handleEnvironmentDelete = useCallback(async () => {
    try {
      toast.loading("Deleting environment...");
      await deleteEnvironment({ environmentId: environment.id });

      closeTabBySource(environment.id, "environments");

      trackEnvironmentDeleted();
      toast.success("Environment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete environment");
    }
  }, [environment.id, deleteEnvironment, closeTabBySource]);

  const menuItems = useMemo(() => {
    return [
      {
        key: EnvironmentMenuKey.RENAME,
        label: "Rename",
        onClick: () => setIsRenameInputVisible(true),
      },
      { key: EnvironmentMenuKey.DUPLICATE, label: "Duplicate", onClick: () => handleEnvironmentDuplicate() },
      {
        key: EnvironmentMenuKey.EXPORT,
        expandIcon: <IoChevronForward style={{ position: "absolute", right: 12 }} />,
        label: <span style={{ marginRight: 12 }}>Export as</span>,
        children: [
          {
            key: EnvironmentMenuKey.EXPORT_REQUESTLY,
            label: "Requestly",
            icon: <img src={RequestlyIcon} alt="Requestly Icon" style={{ width: 16, height: 16, marginRight: 8 }} />,
            onClick: () => onExportClick?.(environment, ExportType.REQUESTLY),
          },
          {
            key: EnvironmentMenuKey.EXPORT_POSTMAN,
            label: "Postman (v2.1 format)",
            onClick: () => onExportClick?.(environment, ExportType.POSTMAN),
            icon: <img src={PostmanIcon} alt="Postman Icon" style={{ width: 16, height: 16, marginRight: 8 }} />,
          },
        ],
      },
      { key: EnvironmentMenuKey.DELETE, label: "Delete", danger: true, onClick: () => handleEnvironmentDelete() },
    ];
  }, [handleEnvironmentDuplicate, onExportClick, environment, handleEnvironmentDelete]);

  if (isRenameInputVisible) {
    return (
      <Input
        className="environment-input"
        autoFocus
        defaultValue={environment.name}
        onChange={(e) => setNewEnvironmentName(e.target.value)}
        onPressEnter={handleEnvironmentRename}
        onBlur={handleEnvironmentRename}
        disabled={isRenaming}
      />
    );
  }

  return (
    <div
      className={`environments-list-item ${environment.id === activeTabSourceId ? "active" : ""}`}
      onClick={() => {
        openTab(
          new EnvironmentViewTabSource({
            id: environment.id,
            title: environment.name,
            context: {
              id: contextId,
            },
          })
        );
      }}
    >
      <div className="environments-list-item__label">
        <Typography.Text
          ellipsis={{
            tooltip: {
              title: environment.name,
              placement: "right",
              color: "#000",
              mouseEnterDelay: 0.5,
            },
          }}
        >
          {isGlobalEnvironment(environment.id) && <IoMdGlobe className="global-var-icon" />}
          {environment.name}
          {isGlobalEnvironment(environment.id) && (
            <Tooltip
              overlayClassName="active-environment-tooltip"
              title={
                <span>
                  Global variables are accessible across the workspace and editable by all the workspace members.{" "}
                  <Link
                    to="https://docs.requestly.com/general/api-client/environments-and-variables#global-variables"
                    target="_blank"
                  >
                    Learn more.
                  </Link>
                </span>
              }
              placement="right"
              showArrow={false}
            >
              <span>
                <MdInfoOutline className="global-var-info-icon" />
              </span>
            </Tooltip>
          )}
        </Typography.Text>
        <Tooltip
          overlayClassName="active-environment-tooltip"
          title="Active Environment"
          placement="right"
          showArrow={false}
        >
          <span>
            {environment.id === activeEnvironment?.id && !isGlobalEnvironment(environment.id) ? (
              <MdOutlineCheckCircle className="active-env-icon" />
            ) : (
              ""
            )}
          </span>
        </Tooltip>
      </div>
      {/* wrapping dropdown in a div to prevent it from triggering click events on parent div element*/}

      {isReadOnly ? null : (
        <div onClick={(e) => e.stopPropagation()}>
          {!isGlobalEnvironment(environment.id) ? (
            <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
              <RQButton
                size="small"
                type="transparent"
                icon={<MdOutlineMoreHoriz />}
                className="environment-list-item-dropdown-button"
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          ) : null}
        </div>
      )}
    </div>
  );
};
