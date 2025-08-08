import React from "react";
import { Input, Dropdown } from "antd";
import { MdOutlineSearch } from "@react-icons/all-files/md/MdOutlineSearch";
import { RQBreadcrumb, RQButton } from "lib/design-system-v2/components";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import PATHS from "config/constants/sub/paths";
import { isGlobalEnvironment } from "../../utils";
import { KEYBOARD_SHORTCUTS } from "../../../../../../constants/keyboardShortcuts";
import { RoleBasedComponent } from "features/rbac";
import { useGenericState } from "hooks/useGenericState";
import "./variablesListHeader.scss";
import RequestlyIcon from "assets/img/brand/rq_logo.svg";
import PostmanIcon from "assets/img/brand/postman-icon.svg";

interface VariablesListHeaderProps {
  searchValue: string;
  currentEnvironmentName: string;
  environmentId: string;
  hasUnsavedChanges: boolean;
  hideBreadcrumb?: boolean;
  isSaving: boolean;
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
        <div className="variables-list-header-breadcrumb-container">
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
        />

        <div className="variables-list-btn-actions-container">
          <RoleBasedComponent resource="api_client_environment" permission="update">
            {exportActions?.showExport && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "export",
                      label: "Export As",
                      type: "group",
                    },
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
                  Export
                </RQButton>
              </Dropdown>
            )}
          </RoleBasedComponent>

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
        </div>
      </div>
    </div>
  );
};
