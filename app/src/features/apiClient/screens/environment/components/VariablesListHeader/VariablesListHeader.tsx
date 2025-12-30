import React, { useEffect, useCallback } from "react";
import { Input, Dropdown } from "antd";
import { MdOutlineSearch } from "@react-icons/all-files/md/MdOutlineSearch";
import { RQBreadcrumb, RQButton } from "lib/design-system-v2/components";
import PATHS from "config/constants/sub/paths";
import { isGlobalEnvironment } from "../../utils";
import { KEYBOARD_SHORTCUTS } from "../../../../../../constants/keyboardShortcuts";
import { RoleBasedComponent } from "features/rbac";
// TEMP: Commented out for testing buffer migration
// import { useCommand } from "features/apiClient/commands";
import "./variablesListHeader.scss";
import RequestlyIcon from "assets/img/brand/rq_logo.svg";
import PostmanIcon from "assets/img/brand/postman-icon.svg";
import { toast } from "utils/Toast";
import { updateEnvironmentName, useApiClientRepository } from "features/apiClient/slices";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";

interface VariablesListHeaderProps {
  searchValue: string;
  currentEnvironmentName: string;
  environmentId: string;
  hideBreadcrumb?: boolean;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  isNewEnvironment?: boolean;
  exportActions?: {
    showExport: boolean;
    enableExport: boolean;
    onRequestlyExportClick: () => void;
    onPostmanExportClick: () => void;
  };
  onSearchValueChange: (value: string) => void;
  onSave: () => Promise<void>;
}

export const VariablesListHeader: React.FC<VariablesListHeaderProps> = ({
  searchValue,
  onSearchValueChange,
  environmentId,
  currentEnvironmentName = "New",
  hideBreadcrumb = false,
  onSave,
  exportActions,
  hasUnsavedChanges,
  isSaving,
  isNewEnvironment
}) => {
  // TEMP: Commented out for testing buffer migration - rename functionality needs Zustand context
  // const {
  //   env: { renameEnvironment },
  // } = useCommand();
  // const { setTitle, getIsActive, getIsNew, setIsNew } = useGenericState();
  const dispatch = useApiClientDispatch();
  const workspaceId = useWorkspaceId();

  const repos = useApiClientRepository(workspaceId);
  const enableHotKey = true;

  const handleNewEnvironmentNameChange = async (newName: string) => {
    try {
      const updatedName = newName || "New Environment";

      await dispatch(
        updateEnvironmentName({
          environmentId,
          name: updatedName,
          repository: repos.environmentVariablesRepository,
        })
      ).unwrap();

      console.log("Rename disabled for testing. Would rename to:", updatedName);
    } catch (error) {
      toast.error(error.message || "Could not rename environment!");
    }
  };

  const handleSave = useCallback(async () => {
    try {
      await onSave();
      toast.success("Environment saved successfully");
    } catch (error) {
      toast.error(error.message || "Could not save environment!");
    }
  }, [onSave]);

  return (
    <div className="variables-list-header">
      {!hideBreadcrumb ? (
        <div className="variables-list-header-breadcrumb-container">
          <RQBreadcrumb
            autoFocus={isNewEnvironment}
            placeholder="New Environment"
            recordName={currentEnvironmentName}
            onBlur={(newName) => {
              handleNewEnvironmentNameChange(newName);
            }}
            disabled={isGlobalEnvironment(environmentId)}
            defaultBreadcrumbs={[
              { label: "API Client", pathname: PATHS.API_CLIENT.INDEX },
              {
                isEditable: true,
                pathname: window.location.pathname,
                label: currentEnvironmentName,
              },
            ]}
          />
        </div>
      ) : (
        <div />
      )}

      <div className="variables-list-action-container">
        <Input
          placeholder="Search"
          prefix={<MdOutlineSearch />}
          className="variables-list-search-input"
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onSearchValueChange("");
            }
          }}
        />

        <div className="variables-list-btn-actions-container">
          <RoleBasedComponent resource="api_client_environment" permission="update">
            {exportActions?.showExport && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "requestly",
                      label: "Requestly",
                      icon: <img src={RequestlyIcon} alt="Requestly Icon" height={16} />,
                      onClick: exportActions?.onRequestlyExportClick,
                    },
                    {
                      key: "postman",
                      label: "Postman (v2.1 format)",
                      icon: <img src={PostmanIcon} alt="Postman Icon" height={16} />,
                      onClick: exportActions?.onPostmanExportClick,
                    },
                  ],
                }}
                trigger={["click"]}
                placement="bottomLeft"
              >
                <RQButton type="secondary" disabled={!exportActions?.enableExport}>
                  Export as
                </RQButton>
              </Dropdown>
            )}
          </RoleBasedComponent>

          <RQButton
            showHotKeyText
            hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_ENVIRONMENT?.hotKey}
            enableHotKey={enableHotKey}
            type="primary"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            loading={isSaving}
          >
            Save
          </RQButton>
        </div>
      </div>
    </div>
  );
};
