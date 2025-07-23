import React, { useEffect } from "react";
import { DownOutlined } from "@ant-design/icons";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { Dropdown } from "antd";
import { useApiClientFileStore } from "features/apiClient/hooks/useApiClientFileStore.hook";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { FaRegFileLines } from "@react-icons/all-files/fa6/FaRegFileLines";
import { BiError } from "@react-icons/all-files/bi/BiError";
import "./DropdownFileCard.scss";
import { formatBytes, truncateString } from "features/apiClient/screens/apiClient/utils";
import InfoIcon from "components/misc/InfoIcon";

interface DropdownFileProps {
  onAddMoreFiles: () => void;
  onDeleteFile: (fileId: string) => void;
}

const DropdownFile: React.FC<DropdownFileProps> = ({ onAddMoreFiles, onDeleteFile }) => {
  const { files, isFilePresentLocally } = useApiClientFileStore((state) => state);

  const storedFiles = Object.keys(files).map((id) => ({
    id,
    ...files[id],
  }));

  //check if this is called only for the removal case of file
  useEffect(() => {
    storedFiles.forEach((file) => {
      isFilePresentLocally(file.id)
        .then((isValid) => {
          console.log(`File ${file.id} is valid:`, isValid);
        })
        .catch((error) => {
          console.error(`Error checking file ${file.id}:`, error);
        });
    });
  }, [isFilePresentLocally, storedFiles]);

  //Filter the files that are larger than 100MB
  const largeFiles = storedFiles.filter((file) => file.size >= 104857600);
  const hasLargeFiles = largeFiles.length > 0;
  const hasMultipleLargeFiles = largeFiles.length > 1;

  const getDropDownItems = () => {
    const FileSeperator = storedFiles.map((file) => ({
      key: file.id,
      label: (
        <div className="file-dropdown-item-container">
          <div className="file-info">
            {file.isFileValid ? <FaRegFileLines className="file-icon" /> : <BiError className="invalid-icon" />}

            <span className={`file-name ${file.isFileValid ? "" : "file-invalid"}`} title={file.name}>
              {file.name}
            </span>
            <span className="file-size">{formatBytes(file.size)}</span>
          </div>
          <RQButton
            className="file-dropdown-remove-button"
            style={{
              backgroundColor: "transparent",
              border: "none",
              marginBottom: "4px",
            }}
            icon={<RiDeleteBinLine />}
            size="small"
            onClick={() => {
              onDeleteFile(file.id);
            }}
          />
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
    return [...FileSeperator, ...addMoreSeperator];
  };

  return (
    <>
      <Dropdown
        menu={{
          items: getDropDownItems(),
          className: "key-value-table-file-dropdown",
        }}
        placement="bottomRight"
        trigger={["click"]}
      >
        <RQButton className="key-value-table-file-button">
          {storedFiles[0].isFileValid ? (
            <FaRegFileLines className="bin-icon" />
          ) : (
            <>
              <RQTooltip
                title={
                  storedFiles.length > 1
                    ? "Some files are no longer available on the selected path on your device. Please remove and upload them again to continue."
                    : "This file is no longer available on the selected path on your device. Please remove and upload it again to continue."
                }
                placement="bottom"
              >
                <BiError className="invalid-icon" />
              </RQTooltip>
            </>
          )}
          <span className={`button-text ${storedFiles[0].isFileValid ? "" : "file-invalid"}`}>
            {truncateString(storedFiles[0]?.name, 15)}
          </span>
          <span className="file-counter">{storedFiles.length > 1 && ` +${storedFiles.length - 1}`}</span>
          <DownOutlined className="down-outlined-icon" />
        </RQButton>
      </Dropdown>

      {hasLargeFiles && (
        <InfoIcon
          text={
            hasMultipleLargeFiles
              ? `Multiple files are larger than 100MB and may take longer to send request and get the response.`
              : "This file size is over 100 MB and may take longer to send request and get the response."
          }
          showArrow={false}
          style={{
            position: "relative",
            left: "8px",
            top: "7px",
            width: "16px",
            height: "16px",
          }}
        />
      )}
    </>
  );
};

export default DropdownFile;
