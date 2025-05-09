import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { IoMdGlobe } from "@react-icons/all-files/io/IoMdGlobe";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { Dropdown, Input, Tooltip, Typography } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQButton } from "lib/design-system-v2/components";
import React, { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "utils/Toast";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";
import {
  trackEnvironmentDeleted,
  trackEnvironmentDuplicated,
  trackEnvironmentRenamed,
} from "modules/analytics/events/features/apiClient";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { EnvironmentViewTabSource } from "../../../environmentView/EnvironmentViewTabSource";

interface EnvironmentsListItemProps {
  isReadOnly: boolean;
  environment: {
    id: string;
    name: string;
    isGlobal?: boolean;
  };
  onExportClick?: (environment: { id: string; name: string }) => void;
}

export enum EnvironmentMenuKey {
  RENAME = "rename",
  DUPLICATE = "duplicate",
  DELETE = "delete",
  EXPORT = "export",
}

export const EnvironmentsListItem: React.FC<EnvironmentsListItemProps> = ({
  isReadOnly,
  environment,
  onExportClick,
}) => {
  const { envId } = useParams();
  const {
    getCurrentEnvironment,
    renameEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
    getAllEnvironments,
    setCurrentEnvironment,
  } = useEnvironmentManager();
  const allEnvironments = getAllEnvironments();
  const { currentEnvironmentId } = getCurrentEnvironment();
  const [isRenameInputVisible, setIsRenameInputVisible] = useState(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState(environment.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [openTab, activeTabId, closeTabBySource] = useTabServiceWithSelector((state) => [
    state.openTab,
    state.activeTabId,
    state.closeTabBySource,
  ]);

  const handleEnvironmentRename = useCallback(async () => {
    if (newEnvironmentName === environment.name) {
      setIsRenameInputVisible(false);
      return;
    }
    setIsRenaming(true);
    renameEnvironment(environment.id, newEnvironmentName)
      .then(() => {
        trackEnvironmentRenamed();
        openTab(new EnvironmentViewTabSource({ id: environment.id, title: newEnvironmentName }));
        toast.success("Environment renamed successfully");
      })
      .catch(() => {
        toast.error("Failed to rename environment");
      })
      .finally(() => {
        setIsRenaming(false);
        setIsRenameInputVisible(false);
      });
  }, [newEnvironmentName, environment.id, environment.name, renameEnvironment, openTab]);

  const handleEnvironmentDuplicate = useCallback(async () => {
    toast.loading("Duplicating environment...");
    duplicateEnvironment(environment.id)
      .then(() => {
        trackEnvironmentDuplicated();
        toast.success("Environment duplicated successfully");
      })
      .catch(() => {
        toast.error("Failed to duplicate environment");
      });
  }, [environment.id, duplicateEnvironment]);

  const handleEnvironmentDelete = useCallback(() => {
    toast.loading("Deleting environment...");
    deleteEnvironment(environment.id)
      .then(() => {
        closeTabBySource(environment.id, "environments");

        trackEnvironmentDeleted();
        toast.success("Environment deleted successfully");
        const availableEnvironments = allEnvironments.filter((env) => env.id !== environment.id);
        const isActiveEnvironmentBeingDeleted = environment.id === currentEnvironmentId;
        if (availableEnvironments.length && (envId === environment.id || isActiveEnvironmentBeingDeleted)) {
          if (isActiveEnvironmentBeingDeleted) {
            if (availableEnvironments.length > 1) {
              const nonGlobalEnvironments = availableEnvironments.filter((env) => !isGlobalEnvironment(env.id));
              setCurrentEnvironment(nonGlobalEnvironments[0].id);
            }
          }
        }
      })
      .catch(() => {
        toast.error("Failed to delete environment");
      });
  }, [
    environment.id,
    deleteEnvironment,
    allEnvironments,
    envId,
    currentEnvironmentId,
    setCurrentEnvironment,
    closeTabBySource,
  ]);

  const menuItems = useMemo(() => {
    return [
      {
        key: EnvironmentMenuKey.RENAME,
        label: "Rename",
        onClick: () => setIsRenameInputVisible(true),
      },
      { key: EnvironmentMenuKey.DUPLICATE, label: "Duplicate", onClick: () => handleEnvironmentDuplicate() },
      { key: EnvironmentMenuKey.EXPORT, label: "Export", onClick: () => onExportClick?.(environment) },
      { key: EnvironmentMenuKey.DELETE, label: "Delete", danger: true, onClick: () => handleEnvironmentDelete() },
    ];
  }, [handleEnvironmentDuplicate, onExportClick, environment, handleEnvironmentDelete]);

  if (isRenameInputVisible) {
    return (
      <Input
        className="environment-input"
        autoFocus
        value={newEnvironmentName}
        onChange={(e) => setNewEnvironmentName(e.target.value)}
        onPressEnter={handleEnvironmentRename}
        onBlur={handleEnvironmentRename}
        disabled={isRenaming}
      />
    );
  }

  return (
    <div
      className={`environments-list-item ${environment.id === envId && `${activeTabId}` === envId ? "active" : ""}`}
      onClick={() => {
        openTab(new EnvironmentViewTabSource({ id: environment.id, title: environment.name }));
      }}
    >
      <div className="environments-list-item__label">
        <Typography.Text
          ellipsis={{
            tooltip: environment.name,
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
              placement="top"
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
          placement="top"
          showArrow={false}
        >
          <span>
            {environment.id === currentEnvironmentId && !isGlobalEnvironment(environment.id) ? (
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
