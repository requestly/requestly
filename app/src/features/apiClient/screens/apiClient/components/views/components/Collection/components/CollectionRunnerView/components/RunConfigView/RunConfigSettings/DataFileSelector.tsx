import React from "react";
import { MdOutlineFileUpload } from "@react-icons/all-files/md/MdOutlineFileUpload";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { RQButton } from "lib/design-system-v2/components";

export const DataFileSelector: React.FC<{
  handleSelectFile: () => void;
}> = ({ handleSelectFile }) => {
  return (
    <>
      <RQButton
        size="small"
        icon={<MdOutlineFileUpload />}
        onClick={() => {
          handleSelectFile();
        }}
      >
        Select file
      </RQButton>

      <div className="file-upload-info">
        <MdOutlineInfo className="file-info-icon" />
        <span className="file-type-info">Supports JSON & CSV files (max 100MB)</span>
      </div>
    </>
  );
};
