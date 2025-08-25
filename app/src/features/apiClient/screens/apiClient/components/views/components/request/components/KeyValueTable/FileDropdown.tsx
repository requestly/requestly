import React from "react";
import { FaAngleDown } from "@react-icons/all-files/fa/FaAngleDown";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { Dropdown } from "antd";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { FaRegFileLines } from "@react-icons/all-files/fa6/FaRegFileLines";
import { BiError } from "@react-icons/all-files/bi/BiError";
import "./FileDropdown.scss";
import { formatBytes, getFileExtension, truncateString } from "features/apiClient/screens/apiClient/utils";
import InfoIcon from "components/misc/InfoIcon";
import { RQAPI } from "features/apiClient/types";
import { LARGE_FILE_SIZE } from "features/apiClient/constants";
import { useApiClientFileStore } from "features/apiClient/store/apiClientFilesStore";

interface FileDropdownProps {
  MultipartFormEntry: RQAPI.FormDataKeyValuePair;
  onAddMoreFiles: () => void;
  onDeleteFile: (fileId: string) => void;
}

const FileDropdown: React.FC<FileDropdownProps> = ({ onAddMoreFiles, onDeleteFile, MultipartFormEntry }) => {
  const getFilesByIds = useApiClientFileStore((state) => state.getFilesByIds);
  const multipartFormFileIds = Array.isArray(MultipartFormEntry.value)
    ? MultipartFormEntry.value.map((file) => file.id)
    : [];

  const filesFromStore = getFilesByIds(multipartFormFileIds);

  if (filesFromStore.length === 0) {
    return null;
  }

  //Filter the files that are larger than 100MB
  const largeFiles = filesFromStore.filter((file) => file.size >= LARGE_FILE_SIZE);
  const hasLargeFiles = largeFiles.length > 0;
  const hasMultipleLargeFiles = largeFiles.length > 1;

  const DropdownContent = () => (
    <div className="key-value-table-file-dropdown">
      <div className="file-list-scroll-container">
        {filesFromStore.map((file) => (
          <div className="file-dropdown-item-container" key={file.id}>
            <div className="file-info">
              {file.isFileValid ? <FaRegFileLines className="file-icon" /> : <BiError className="invalid-icon" />}
              <span className={`file-name ${file.isFileValid ? "" : "file-invalid"}`}>
                {truncateString(file.name, 20)} <span className="file-extension">{getFileExtension(file.name)}</span>
              </span>
            </div>
            <div className="file-details">
              <span className="file-size">{formatBytes(file.size)}</span>
              <RQButton
                className="file-dropdown-remove-button"
                icon={<RiDeleteBinLine />}
                size="small"
                onClick={() => onDeleteFile(file.id)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="add-more-file-container">
        <RQButton className="file-dropdown-add-button" size="small" onClick={onAddMoreFiles}>
          + Add more files
        </RQButton>
      </div>
    </div>
  );

  return (
    <>
      <Dropdown dropdownRender={DropdownContent} placement="bottomLeft" trigger={["click"]}>
        <RQButton size="small" className="key-value-table-file-button">
          {filesFromStore[0].isFileValid ? (
            <FaRegFileLines className="bin-icon" />
          ) : (
            <>
              <RQTooltip
                title={
                  filesFromStore.length > 1
                    ? "Some files are no longer available on the selected path on your device. Please remove and upload them again to continue."
                    : "This file is no longer available on the selected path on your device. Please remove and upload it again to continue."
                }
                placement="bottom"
              >
                <BiError className="invalid-icon" />
              </RQTooltip>
            </>
          )}
          <span className={`button-text ${filesFromStore[0].isFileValid ? "" : "file-invalid"}`}>
            {truncateString(filesFromStore[0].name, 10)}{" "}
            <span className="file-extension">{getFileExtension(filesFromStore[0].name)}</span>
          </span>
          <span className="file-counter">{filesFromStore.length > 1 && ` +${filesFromStore.length - 1}`}</span>
          <FaAngleDown className="down-outlined-icon" />
        </RQButton>
      </Dropdown>

      {hasLargeFiles && (
        <InfoIcon
          text={
            hasMultipleLargeFiles
              ? `Multiple files are larger than 100 MB and may take longer to send request and get the response.`
              : "This file size is over 100 MB and may take longer to send request and get the response."
          }
          showArrow={false}
          style={{
            position: "relative",
            left: "8px",
            width: "16px",
            height: "16px",
          }}
        />
      )}
    </>
  );
};

export default FileDropdown;
