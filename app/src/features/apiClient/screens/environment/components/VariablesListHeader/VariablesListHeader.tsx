import React from "react";
import { MdDisplaySettings } from "@react-icons/all-files/md/MdDisplaySettings";
import { Input } from "antd";
import { MdOutlineChevronRight } from "@react-icons/all-files/md/MdOutlineChevronRight";
import { MdOutlineSearch } from "@react-icons/all-files/md/MdOutlineSearch";
import "./variablesListHeader.scss";

interface VariablesListHeaderProps {
  searchValue: string;
  currentEnvironmentName: string;
  onSearchValueChange: (value: string) => void;
}

export const VariablesListHeader: React.FC<VariablesListHeaderProps> = ({
  searchValue,
  onSearchValueChange,
  currentEnvironmentName = "New",
}) => {
  return (
    <div className="variables-list-header">
      <div className="env-view-breadcrumb">
        <MdDisplaySettings />
        <span className="env-view-breadcrumb-1">
          API Client <MdOutlineChevronRight />
        </span>
        <span className="env-view-breadcrumb-1">
          Environments <MdOutlineChevronRight />
        </span>
        <span className="env-view-breadcrumb-2">{currentEnvironmentName}</span>
      </div>
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
