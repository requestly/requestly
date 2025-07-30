import React from "react";
import { FaAngleDown } from "@react-icons/all-files/fa/FaAngleDown";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { Dropdown } from "antd";
import { useApiClientFileStore } from "features/apiClient/hooks/useApiClientFileStore.hook";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { FaRegFileLines } from "@react-icons/all-files/fa6/FaRegFileLines";
import { BiError } from "@react-icons/all-files/bi/BiError";
import "./FileDropdown.scss";
import { formatBytes, truncateString } from "features/apiClient/screens/apiClient/utils";
import InfoIcon from "components/misc/InfoIcon";
import { RQAPI } from "features/apiClient/types";
import { HUNDERED_MB_IN_BYTE } from "features/apiClient/constants";

interface FileDropdownProps {
  MultipartFormEntry: RQAPI.FormDataKeyValuePair;
  onAddMoreFiles: () => void;
  onDeleteFile: (fileId: string) => void;
}

const FileDropdown: React.FC<FileDropdownProps> = ({ onAddMoreFiles, onDeleteFile, MultipartFormEntry }) => {
  console.log("DEBUG", MultipartFormEntry);
  const getFilesByIds = useApiClientFileStore((state) => state.getFilesByIds);
  const multipartFormFileIds = Array.isArray(MultipartFormEntry.value)
    ? MultipartFormEntry.value.map((file) => file.id)
    : [];

  const filesFromStore = getFilesByIds(multipartFormFileIds);

  if (filesFromStore.length === 0) {
    return null;
  }

  //Filter the files that are larger than 100MB
  const largeFiles = filesFromStore.filter((file) => file.size >= HUNDERED_MB_IN_BYTE);
  const hasLargeFiles = largeFiles.length > 0;
  const hasMultipleLargeFiles = largeFiles.length > 1;

  const getDropDownItems = () => {
    const fileSeperator = filesFromStore.map((file) => ({
      key: file.id,
      label: (
        <div className="file-dropdown-item-container">
          <div className="file-info">
            {file.isFileValid ? <FaRegFileLines className="file-icon" /> : <BiError className="invalid-icon" />}

            <span className={`file-name ${file.isFileValid ? "" : "file-invalid"}`} title={file.name}>
              {truncateString(file.name, 150)}
            </span>
          </div>
          <div className="file-details">
            <span className="file-size">{formatBytes(file.size)}</span>
            <RQButton
              className="file-dropdown-remove-button"
              icon={<RiDeleteBinLine />}
              size="small"
              onClick={() => {
                onDeleteFile(file.id);
              }}
            />
          </div>
        </div>
      ),
    }));

    const addMoreSeperator = [
      {
        key: "add-more",
        label: (
          <div className="add-more-file-container">
            <RQButton
              className="file-dropdown-add-button"
              size="small"
              onClick={() => {
                onAddMoreFiles();
              }}
            >
              + Add more files
            </RQButton>
          </div>
        ),
      },
    ];
    return [...fileSeperator, ...addMoreSeperator];
  };

  return (
    <>
      <Dropdown
        menu={{
          items: getDropDownItems(),
          className: "key-value-table-file-dropdown",
        }}
        placement="bottomLeft"
        trigger={["click"]}
      >
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
            {truncateString(filesFromStore[0].name, 10)}
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
