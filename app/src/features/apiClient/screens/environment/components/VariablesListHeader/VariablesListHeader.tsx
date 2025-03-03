import React from "react";
import { Input } from "antd";
import { MdOutlineSearch } from "@react-icons/all-files/md/MdOutlineSearch";
import { RQBreadcrumb, RQButton } from "lib/design-system-v2/components";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import { useLocation } from "react-router-dom";
import "./variablesListHeader.scss";
import { isGlobalEnvironment } from "../../utils";
import { KEYBOARD_SHORTCUTS } from "../../../../../../constants/keyboardShortcuts";
import { ReadOnlyModeAlert } from "features/apiClient/screens/apiClient/components/clientView/components/ReadOnlyModeAlert/ReadOnlyModeAlert";
interface VariablesListHeaderProps {
  isReadRole: boolean;
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
  isReadRole,
}) => {
  const { renameEnvironment } = useEnvironmentManager();
  const { replaceTab } = useTabsLayoutContext();
  const location = useLocation();

  const handleNewEnvironmentNameChange = (newName: string) => {
    renameEnvironment(environmentId, newName).then(() => {
      replaceTab(environmentId, {
        id: environmentId,
        title: newName,
        url: `${PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE}/${encodeURIComponent(environmentId)}`,
      });
    });
  };

  return (
    <div className="variables-list-header">
      {!hideBreadcrumb ? (
        <RQBreadcrumb
          autoFocus={location.search.includes("new")}
          placeholder="New Environment"
          recordName={currentEnvironmentName}
          onBlur={handleNewEnvironmentNameChange}
          disabled={isGlobalEnvironment(environmentId)}
        />
      ) : (
        <div />
      )}

      {isReadRole ? (
        <ReadOnlyModeAlert description="As a viewer, you can update variables with current values and test the APIs, but saving your updates is not permitted." />
      ) : null}

      <div className="variables-list-action-container">
        <Input
          placeholder="Search"
          prefix={<MdOutlineSearch />}
          className="variables-list-search-input"
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
        />

        {isReadRole ? null : (
          <div className="variables-list-btn-actions-container">
            <RQButton
              showHotKeyText
              hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_ENVIRONMENT.hotKey}
              type="primary"
              onClick={onSave}
              disabled={!hasUnsavedChanges}
              loading={isSaving}
            >
              Save
            </RQButton>

            {exportActions?.showExport && (
              <RQButton type="primary" onClick={exportActions?.onExportClick} disabled={!exportActions?.enableExport}>
                Export
              </RQButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
