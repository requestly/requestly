import { MdOutlineSearch } from "@react-icons/all-files/md/MdOutlineSearch";
import { Input } from "antd";
import InfoIcon from "components/misc/InfoIcon";
import React from "react";

export const RuntimevariablesHeader: React.FC = () => {
  return (
    <div className="runtime-variables-header">
      <div className="runtime-variables-header-title">Runtime Variables</div>
      <div className="runtime-variables-info-icon">
        {/*FIXME: Add message here */}
        <InfoIcon text="pata nhi" />
      </div>

      <div className="runtime-variables-action-container">
        <Input
          placeholder="Search Variables"
          prefix={<MdOutlineSearch />}
          className="runtime-variables-search-input"
          value={""}
          onChange={() => {}}
        />
      </div>
    </div>
  );
};
