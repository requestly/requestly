import React, { useCallback, useState } from "react";
import { FileFeature, useApiClientFileStore } from "features/apiClient/store/apiClientFilesStore";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineRemoveRedEye } from "@react-icons/all-files/md/MdOutlineRemoveRedEye";
import { BiError } from "@react-icons/all-files/bi/BiError";
import { getFileExtension, truncateString } from "features/apiClient/screens/apiClient/utils";
import { RxCross2 } from "@react-icons/all-files/rx/RxCross2";
import { DataFileModals } from "../ParseFileModal/DataFileModals";
import { displayFileSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { useRunConfigStore } from "../../../run.context";
import { MdOutlineFileUpload } from "@react-icons/all-files/md/MdOutlineFileUpload";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";

export const DataFileUploadView: React.FC = () => {
  const [showDataFileModal, setShowDataFileModal] = useState<boolean>(false);
  //this single state is handling the which viewtype should be shown in modal
  const [modalContext, setModalContext] = useState<"success" | "view" | "largeFile" | "loading" | "error">("success");
  // const [dataFileMetadata, setDataFileMetadata] = useState<{ name: string; path: string; size: number } | null>(null);

  const [dataFile, removeDataFile, setDataFile] = useRunConfigStore((s) => [
    s.dataFile,
    s.removeDataFile,
    s.setDataFile,
  ]);
  const [getFilesByIds] = useApiClientFileStore((s) => [s.getFilesByIds]);
  const file = getFilesByIds([dataFile?.id])?.[0] ?? null;

  const handleFileSelection = useCallback(() => {
    displayFileSelector(
      (file: { name: string; path: string; size: number }) => {
        const fileId = file.name + "-" + Date.now();
        setDataFile({
          id: fileId,
          name: file.name,
          path: file.path,
          size: file.size,
          source: "desktop",
          fileFeature: FileFeature.COLLECTION_RUNNER,
        });

        setModalContext("loading");
        setShowDataFileModal(true);
      },
      {
        filters: [{ name: "File formats allowed", extensions: ["json", "csv"] }],
      }
    );
  }, [setDataFile]);

  console.log("!!!debug", "file", file);

  if (!dataFile) {
    return (
      <>
        <RQButton size="small" icon={<MdOutlineFileUpload />} onClick={handleFileSelection}>
          Select file
        </RQButton>

        <div className="file-upload-info">
          <MdOutlineInfo className="file-info-icon" />
          <span className="file-type-info">Supports JSON & CSV files (max 100MB)</span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="file-uploaded-section">
        <RQButton
          size="small"
          type="secondary"
          className="file-uploaded-button"
          onClick={() => {
            setModalContext("view");
            setShowDataFileModal(true);
          }}
        >
          {file.isFileValid ? (
            <MdOutlineRemoveRedEye className="eye-icon" />
          ) : (
            <>
              <RQTooltip
                title={"The file you selected is not available. Please remove and upload a new file to continue."}
                placement="top"
              >
                <BiError className="invalid-icon" />
              </RQTooltip>
            </>
          )}
          <span className={`button-text ${file.isFileValid ? "" : "file-invalid"}`}>
            {truncateString(file.name, 35) + getFileExtension(file.name)}
          </span>
        </RQButton>

        {/*Clear File or Delete File */}
        <RQTooltip title={`clear file`}>
          <RQButton
            size="small"
            className="clear-file-btn"
            onClick={() => {
              removeDataFile();
            }}
            type="transparent"
          >
            {dataFile && <RxCross2 />}
          </RQButton>
        </RQTooltip>
      </div>
      {showDataFileModal && (
        <DataFileModals
          initialStatus={modalContext}
          onClose={() => setShowDataFileModal(false)}
          onFileSelected={() => setShowDataFileModal(true)}
          handleSelectFile={handleFileSelection}
          dataFile={dataFile}
          isDataFileValid={file.isFileValid ?? true}
        />
      )}
    </>
  );
};
