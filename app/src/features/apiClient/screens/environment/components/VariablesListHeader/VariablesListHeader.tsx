import React from "react";
import { Input } from "antd";
import { MdOutlineSearch } from "@react-icons/all-files/md/MdOutlineSearch";
import { RQBreadcrumb, RQButton } from "lib/design-system-v2/components";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import PATHS from "config/constants/sub/paths";
import { isGlobalEnvironment } from "../../utils";
import { KEYBOARD_SHORTCUTS } from "../../../../../../constants/keyboardShortcuts";
import { RoleBasedComponent } from "features/rbac";
import { useGenericState } from "hooks/useGenericState";
import "./variablesListHeader.scss";

interface VariablesListHeaderProps {
  searchValue: string;
  currentEnvironmentName: string;
  environmentId: string;
  hasUnsavedChanges: boolean;
  hideBreadcrumb?: boolean;
  isSaving: boolean;
  exportActions?: { showExport: boolean; enableExport: boolean; onExportClick: () => void };
  onSearchValueChange: (value: string) => void;
  onSave: () => Promise<void>;
}

export const VariablesListHeader: React.FC<VariablesListHeaderProps> = ({
  searchValue,
  onSearchValueChange,
  environmentId,
  hasUnsavedChanges,
  isSaving,
  currentEnvironmentName = "New",
  hideBreadcrumb = false,
  onSave,
  exportActions,
}) => {
  const { renameEnvironment } = useEnvironmentManager();
  const { setTitle, getIsActive, getIsNew } = useGenericState();
  const enableHotKey = getIsActive();
  const isNewEnvironment = getIsNew();

  const handleNewEnvironmentNameChange = (newName: string) => {
    const updatedName = newName || "New Environment";
    renameEnvironment(environmentId, updatedName).then(() => {
      setTitle(updatedName);
    });
  };

  return (
    <div className="variables-list-header">
      {!hideBreadcrumb ? (
        <RQBreadcrumb
          autoFocus={isNewEnvironment}
          placeholder="New Environment"
          recordName={currentEnvironmentName}
          onBlur={handleNewEnvironmentNameChange}
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
        />

        <div className="variables-list-btn-actions-container">
          <RQButton
            showHotKeyText
            hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_ENVIRONMENT.hotKey}
            enableHotKey={enableHotKey}
            type="primary"
            onClick={onSave}
            disabled={!hasUnsavedChanges}
            loading={isSaving}
          >
            Save
          </RQButton>

          <RoleBasedComponent resource="api_client_environment" permission="update">
            {exportActions?.showExport && (
              <RQButton type="primary" onClick={exportActions?.onExportClick} disabled={!exportActions?.enableExport}>
                Export
              </RQButton>
            )}
          </RoleBasedComponent>
        </div>
      </div>
    </div>
  );
};
