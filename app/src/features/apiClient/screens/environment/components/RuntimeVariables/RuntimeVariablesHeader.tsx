import React from "react";
import { Input } from "antd";
import { MdOutlineSearch } from "@react-icons/all-files/md/MdOutlineSearch";
import { RQButton } from "lib/design-system-v2/components";
import "./runtimevariableHeader.scss";
import InfoIcon from "components/misc/InfoIcon";
import { MdOutlineDelete } from "@react-icons/all-files/md/MdOutlineDelete";

interface RuntimeVariablesHeaderProps {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onDeleteAll: () => void;
  onSave: () => Promise<void>;
}
export const RuntimeVariablesHeader: React.FC<RuntimeVariablesHeaderProps> = ({
  searchValue,
  onSearchValueChange,
  onDeleteAll,
  onSave,
}) => {
  return (
    <div className="runtime-variables-list-header">
      <div className="runtime-variables-header-info">
        <span className="header-title">RuntimeVariables</span>
        <InfoIcon text="runtime" />
      </div>
      <div className="runtime-variables-list-action-container">
        <Input
          placeholder="Search"
          prefix={<MdOutlineSearch />}
          className="runtime-variables-list-search-input"
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
        />

        <div className="runtime-variables-list-action-btn">
          <RQButton
            icon={<MdOutlineDelete />}
            type="primary"
            onClick={onDeleteAll}
            style={{
              background: "none",
              border: "none",
            }}
          >
            Delete All
          </RQButton>
          <RQButton
            icon={<MdOutlineDelete />}
            type="primary"
            onClick={() => {
              onSave();
            }}
            style={{
              background: "none",
              border: "none",
            }}
          >
            Save
          </RQButton>
        </div>
      </div>
    </div>
  );
};
