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
import { IoChevronForward } from "@react-icons/all-files/io5/IoChevronForward";
import RequestlyIcon from "assets/img/brand/rq_logo.svg";
import PostmanIcon from "assets/img/brand/postman-icon.svg";

interface EnvironmentsListItemProps {
  isReadOnly: boolean;
  environment: {
    id: string;
    name: string;
    isGlobal?: boolean;
  };
  onExportClick?: (environment: { id: string; name: string }) => void;
  onPostmanExportClick?: (environment: { id: string; name: string }) => void;
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
  environment,
  onExportClick,
  onPostmanExportClick,
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
      {
        key: EnvironmentMenuKey.EXPORT,
        expandIcon: <IoChevronForward style={{ position: "absolute", right: 12 }} />,
        label: <span style={{ marginRight: 12 }}>Export as</span>,
        children: [
          {
            key: EnvironmentMenuKey.EXPORT_REQUESTLY,
            label: "Requestly",
            icon: <img src={RequestlyIcon} alt="Requestly Icon" style={{ width: 16, height: 16, marginRight: 8 }} />,
            onClick: () => onExportClick?.(environment),
          },
          {
            key: EnvironmentMenuKey.EXPORT_POSTMAN,
            label: "Postman (v2.1 format)",
            onClick: () => onPostmanExportClick?.(environment),
            icon: <img src={PostmanIcon} alt="Postman Icon" style={{ width: 16, height: 16, marginRight: 8 }} />,
          },
        ],
      },
      { key: EnvironmentMenuKey.DELETE, label: "Delete", danger: true, onClick: () => handleEnvironmentDelete() },
    ];
  }, [handleEnvironmentDuplicate, onExportClick, onPostmanExportClick, environment, handleEnvironmentDelete]);

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
        openTab(new EnvironmentViewTabSource({ id: environment.id, title: environment.name }));
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
