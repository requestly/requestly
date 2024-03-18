import "./index.scss";
import React, { useCallback, useEffect, useState } from "react";
import {
  fileRecord,
  AccessedFileCategoryTag,
  getFileContents,
  getRecentlyAccesedFiles,
  openFileSelector,
} from "./desktopFileAccessActions";
import { toast } from "utils/Toast";
import SpinnerCard from "components/misc/SpinnerCard";
import { RQButton, RQModal } from "lib/design-system/components";
import { Divider } from "antd";
import {
  trackFileSelectionFailed,
  trackFileSuccessfullySelected,
  trackImportFileBtnClicked,
  trackOpenSystemFileSelector,
  trackRecentlyAccessedFileClicked,
  trackUnexpectedFailureAfterFileSelection,
} from "./analytics";

interface FileDropZoneProps {
  onFileParsed: (fileContents: string, fileName: string, filePath: string) => void;
  category?: AccessedFileCategoryTag;
}
const FileDropZone: React.FC<FileDropZoneProps> = (props) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleBrowseAndSelectFilesClick = useCallback(async () => {
    trackOpenSystemFileSelector(props.category);
    setIsProcessing(true);
    try {
      const file = await openFileSelector(props.category);
      if (file) {
        trackFileSuccessfullySelected(props.category);
        props.onFileParsed(file.contents, file.name, file.filePath);
      }
      trackUnexpectedFailureAfterFileSelection(props.category);
    } catch (e) {
      trackFileSelectionFailed(props.category);
      console.error(e);
      toast.error("Error opening file selector");
    }
    setIsProcessing(false);
  }, [props]);

  return (
    <RQButton onClick={handleBrowseAndSelectFilesClick} loading={isProcessing} type="primary">
      Browser and select your file
    </RQButton>
  );
};

interface RecentlyAccessedFilesListProps {
  onFileSelected: (fileContents: string, fileName: string, filePath: string) => void;
  fileCategory?: AccessedFileCategoryTag;
  onError: (error: any) => void;
}

const RecentlyAccessedFilesList: React.FC<RecentlyAccessedFilesListProps> = (props) => {
  const [recentFiles, setRecentFiles] = useState<fileRecord[]>([]);
  const [fetchedOnce, setFetchedOnce] = useState<boolean>(false);
  useEffect(() => {
    getRecentlyAccesedFiles(props.fileCategory || "unknown")
      .then((files) => {
        console.log("Fetched Recent files", files);
        setRecentFiles(files ?? []);
        setFetchedOnce(true);
      })
      .catch((e) => {
        console.error(e);
        toast.error("Error fetching recently accessed files");
      });
  }, [props.fileCategory]);

  const handleFileClicked = useCallback(
    (file: fileRecord) => {
      getFileContents(file.filePath)
        .then((fileContents) => {
          if (!fileContents) return;
          props.onFileSelected(fileContents, file.name, file.filePath);
        })
        .catch(props.onError);
    },
    [props]
  );

  return (
    <div className="recently-accessed-container">
      <div className="header text-center">Recently Accessed File</div>
      {fetchedOnce ? (
        recentFiles.length ? (
          <ul>
            {recentFiles.map((file) => {
              return (
                <li
                  key={file.filePath}
                  onClick={(event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
                    event.preventDefault();
                    handleFileClicked(file);
                    trackRecentlyAccessedFileClicked(file.category);
                  }}
                >
                  {file.name}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center mt-4">No recently fetched files</div>
        )
      ) : (
        <SpinnerCard />
      )}
    </div>
  );
};

interface FilePickerProps {
  btnText?: string;
  modalTitle?: string;
  dropMessage?: string;
  category?: AccessedFileCategoryTag;
  onFileParsed: (fileContents: string, fileName: string, filePath: string) => void;
}

export const FilePickerModalBtn: React.FC<FilePickerProps> = (props) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  return (
    <>
      <RQButton
        type="primary"
        onClick={() => {
          setIsModalVisible(true);
          trackImportFileBtnClicked(props.category);
        }}
        className="mt-8"
      >
        {props.btnText ?? "Open File"}
      </RQButton>
      <RQModal
        title={props.modalTitle || "Select File to be opened"}
        open={isModalVisible}
        footer={null}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        wrapClassName="file-picker-modal-content"
        centered
      >
        <div className="import-modal-content-wrapper">
          <div className="file-handler-wrapper">
            <div className="header text-center mb-2">{props.dropMessage ?? "Select the file from your device"}</div>
            <div className="file-drop-zone">
              <FileDropZone
                onFileParsed={(fileContents, fileName, filePath) => {
                  props.onFileParsed(fileContents, fileName, filePath);
                  setIsModalVisible(false);
                }}
                category={props.category}
              />
            </div>
          </div>
          <Divider type="vertical" className="file-picker-modal-divider" />
          <div className="recently-accessed">
            <RecentlyAccessedFilesList
              onFileSelected={props.onFileParsed}
              fileCategory={props.category}
              onError={(error) => {
                console.error(error);
                toast.error("Error fetching file contents", error);
              }}
            />
          </div>
        </div>
      </RQModal>
    </>
  );
};
