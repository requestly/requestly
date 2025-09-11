import React, { useState } from "react";
import { RunConfigOrderedRequests } from "../RunConfigOrderedRequests/RunConfigOrderedRequests";
import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineRestartAlt } from "@react-icons/all-files/md/MdOutlineRestartAlt";
import "./runConfigContainer.scss";

const RunConfiguration: React.FC = () => {
  return <></>;
};

export const RunConfigContainer: React.FC<{}> = (props) => {
  const [selectAll, setSelectAll] = useState(true);

  const onChange = (e: CheckboxChangeEvent) => {
    setSelectAll(e.target.value);
  };

  const handleResetClick = () => {
    // TODO
  };

  return (
    <div className="run-config-container">
      <div className="run-config-ordered-requests-header">
        <Checkbox checked={selectAll} onChange={onChange}>
          Select all
        </Checkbox>
        <RQButton type="transparent" size="small" icon={<MdOutlineRestartAlt />} onClick={handleResetClick}>
          Reset
        </RQButton>
      </div>

      <RunConfigOrderedRequests />
      <RunConfiguration />
    </div>
  );
};
