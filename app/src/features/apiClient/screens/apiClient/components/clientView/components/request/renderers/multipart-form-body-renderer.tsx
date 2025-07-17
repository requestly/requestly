import { Col, Input } from "antd";
import { displayMultiFileSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { useApiClientFilesStore } from "features/apiClient/store/apiClientFilesStore";
import { RQButton } from "lib/design-system/components";
import react from "react";
import { RequestBodyProps } from "../request-body-types";

export const MultipartFormBodyRenderer: react.FC<{ setRequestEntry: RequestBodyProps["setRequestEntry"] }> = ({
  setRequestEntry,
}) => {
  const { _addFile } = useApiClientFilesStore((state) => state);

  return (
    <Col>
      <Input />
      <RQButton
        onClick={() =>
          displayMultiFileSelector(
            (selectedFilePaths: string[]) => {
              console.log("Selected files:", selectedFilePaths);
              selectedFilePaths.forEach((filePath) => {
                const fileName = filePath.split("/").pop();
                const fileId = `${fileName}-${Date.now()}`; // we can use uuid as well
                _addFile(fileId, {
                  name: fileName,
                  path: filePath,
                  source: "desktop",
                  isFileValid: true,
                });
              });
              // add the file details to requestEntry using setRequestEntry
            },
            {
              properties: ["multiSelections", "openFile", "openDirectory"],
            }
          )
        }
      >
        Upload files
      </RQButton>
    </Col>
  );
};
