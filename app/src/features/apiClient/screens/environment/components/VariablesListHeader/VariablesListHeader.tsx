import React from "react";
import { Input } from "antd";
import { MdOutlineSearch } from "@react-icons/all-files/md/MdOutlineSearch";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import { useLocation } from "react-router-dom";
import "./variablesListHeader.scss";

interface VariablesListHeaderProps {
  searchValue: string;
  currentEnvironmentName: string;
  environmentId: string;
  onSearchValueChange: (value: string) => void;
}

export const VariablesListHeader: React.FC<VariablesListHeaderProps> = ({
  searchValue,
  onSearchValueChange,
  environmentId,
  currentEnvironmentName = "New",
}) => {
  const { renameEnvironment } = useEnvironmentManager();
  const { replaceTab } = useTabsLayoutContext();
  const location = useLocation();

  return (
    <div className="variables-list-header">
      <RQBreadcrumb
        autoFocus={location.search.includes("new")}
        placeholder="New Environment"
        recordName={currentEnvironmentName}
        onBlur={(newName) => {
          renameEnvironment(environmentId, newName).then(() => {
            replaceTab(environmentId, {
              id: environmentId,
              title: newName,
              url: `${PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE}/${environmentId}`,
            });
          });
        }}
      />
      <div className="variables-list-action-container">
        <Input
          placeholder="Search"
          prefix={<MdOutlineSearch />}
          className="variables-list-search-input"
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
        />
      </div>
    </div>
  );
};
