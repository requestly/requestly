import React, { useCallback } from "react";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { MdOutlineSave } from "@react-icons/all-files/md/MdOutlineSave";
import { MdOutlineVideoLibrary } from "@react-icons/all-files/md/MdOutlineVideoLibrary";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import "./runConfigHeader.scss";

export const RunConfigHeader: React.FC = () => {
  const handleSaveClick = useCallback(() => {}, []);
  const handleRunClick = useCallback(() => {}, []);

  return (
    <div className="run-config-header">
      <div className="title">
        Configuration
        <RQTooltip
          title={
            ""
            // TODO: add title
          }
        >
          <MdInfoOutline />
        </RQTooltip>
      </div>

      <div className="actions">
        <RQButton size="small" icon={<MdOutlineSave />} onClick={handleSaveClick}>
          Save
        </RQButton>
        {/* TODO: For CLI support convert it into dropdown button */}
        <RQButton size="small" type="primary" icon={<MdOutlineVideoLibrary />} onClick={handleRunClick}>
          Run
        </RQButton>
      </div>
    </div>
  );
};
