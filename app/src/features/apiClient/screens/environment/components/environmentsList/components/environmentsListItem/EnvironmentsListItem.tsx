import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { IoMdGlobe } from "@react-icons/all-files/io/IoMdGlobe";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { Dropdown, Input, Tooltip, Typography } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import PATHS from "config/constants/sub/paths";
import { TabsLayoutContextInterface, useTabsLayoutContext } from "layouts/TabsLayout";
import { RQButton } from "lib/design-system-v2/components";
import React, { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { redirectToEnvironment } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";

interface EnvironmentsListItemProps {
  environment: {
    id: string;
    name: string;
    isGlobal?: boolean;
  };

  openTab: TabsLayoutContextInterface["openTab"];
}

export enum EnvironmentMenuKey {
  RENAME = "rename",
  DUPLICATE = "duplicate",
  DELETE = "delete",
}

export const EnvironmentsListItem: React.FC<EnvironmentsListItemProps> = ({ environment, openTab }) => {
  const navigate = useNavigate();
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
  const { updateTab, activeTab } = useTabsLayoutContext();

  const { closeTab } = useTabsLayoutContext();

  const handleEnvironmentRename = useCallback(async () => {
    if (newEnvironmentName === environment.name) {
      setIsRenameInputVisible(false);
      return;
    }
    setIsRenaming(true);
    renameEnvironment(environment.id, newEnvironmentName)
      .then(() => {
        updateTab(environment.id, { title: newEnvironmentName });
        toast.success("Environment renamed successfully");
      })
      .catch(() => {
        toast.error("Failed to rename environment");
      })
      .finally(() => {
        setIsRenaming(false);
        setIsRenameInputVisible(false);
      });
  }, [newEnvironmentName, environment.id, environment.name, renameEnvironment, updateTab]);

  const handleEnvironmentDuplicate = useCallback(async () => {
    toast.loading("Duplicating environment...");
    duplicateEnvironment(environment.id)
      .then(() => {
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
        toast.success("Environment deleted successfully");
        const availableEnvironments = allEnvironments.filter((env) => env.id !== environment.id);
        const isActiveEnvironmentBeingDeleted = environment.id === currentEnvironmentId;
        if (availableEnvironments.length && (envId === environment.id || isActiveEnvironmentBeingDeleted)) {
          redirectToEnvironment(navigate, availableEnvironments[0].id);
          if (isActiveEnvironmentBeingDeleted) {
            setCurrentEnvironment(availableEnvironments[0].id);
          }
        }
        closeTab(environment.id);
      })
      .catch(() => {
        toast.error("Failed to delete environment");
      });
  }, [
    environment.id,
    deleteEnvironment,
    allEnvironments,
    navigate,
    envId,
    currentEnvironmentId,
    setCurrentEnvironment,
    closeTab,
  ]);

  const menuItems = useMemo(() => {
    return [
      {
        key: EnvironmentMenuKey.RENAME,
        label: "Rename",
        onClick: () => setIsRenameInputVisible(true),
      },
      { key: EnvironmentMenuKey.DUPLICATE, label: "Duplicate", onClick: () => handleEnvironmentDuplicate() },
      { key: EnvironmentMenuKey.DELETE, label: "Delete", danger: true, onClick: () => handleEnvironmentDelete() },
    ];
  }, [handleEnvironmentDuplicate, handleEnvironmentDelete]);

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
      key={environment.id}
      className={`environments-list-item ${environment.id === envId && activeTab?.id === envId ? "active" : ""}`}
      onClick={() => {
        redirectToEnvironment(navigate, environment.id);
        openTab(environment.id, {
          title: environment.name,
          url: `${PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE}/${environment.id}`,
        });
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
                    to="https://docs.requestly.com/general/api-client/environments-and-variables/add-and-use-variables"
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
            {environment.id === currentEnvironmentId ? <MdOutlineCheckCircle className="active-env-icon" /> : ""}
          </span>
        </Tooltip>
      </div>
      {/* wrapping dropdown in a div to prevent it from triggering click events on parent div element*/}
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
    </div>
  );
};
