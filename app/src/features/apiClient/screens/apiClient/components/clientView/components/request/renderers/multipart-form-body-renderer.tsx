import { Col, Input } from "antd";
import { displayMultiFileSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { RQButton } from "lib/design-system/components";
import react from "react";
import { RequestBodyProps } from "../request-body-types";
import { RQAPI } from "features/apiClient/types";
import { useApiClientFileStore } from "features/apiClient/hooks/useApiClientFileStore.hook";

export const MultipartFormBodyRenderer: react.FC<{ setRequestEntry: RequestBodyProps["setRequestEntry"] }> = ({
  setRequestEntry,
}) => {
  const { addFile, files } = useApiClientFileStore((state) => state);
  // TODO:aarush requestBody to be extracted from useFormBody and requestBodyStateManager
  // Match the file id with the files in the store and render the file error state wherever requiered
  console.log("!!!debug", "files in multipart renderer", files);

  return (
    <Col>
      <Input />
      <RQButton
        onClick={() =>
          // TODO @aarush to handle file removal as well
          displayMultiFileSelector(
            (selectedFilePaths: string[]) => {
              console.log("Selected files:", selectedFilePaths);
              const selectedFiles = selectedFilePaths.map((filePath) => {
                const fileName = filePath.split("/").pop();
                const fileId = fileName + "-" + Date.now(); // Generate a unique ID for the file/uuid can be used as well
                return {
                  id: fileId,
                  name: fileName,
                  path: filePath,
                  source: "desktop",
                };
              });
              selectedFiles.forEach((file) => {
                addFile(file.id, {
                  name: file.name,
                  path: file.path,
                  source: "desktop",
                  isFileValid: true,
                });
              });
              // add the file details to requestEntry using setRequestEntry
              // TODO: @aarush to fix it with bodyContainer logic
              setRequestEntry((prev) => {
                return {
                  ...prev,
                  contentType: "multipart/form-data",
                  request: {
                    ...prev.request,
                    body: [
                      {
                        id: 1,
                        key: "jsonFile",
                        isEnabled: true,
                        value: selectedFiles,
                      },
                      // {
                      //   id: 2,
                      //   key: "stringValue",
                      //   isEnabled: true,
                      //   value: "stringified value",
                      // },
                    ] as RQAPI.MultipartFormBody, // Assuming this is the correct type
                  },
                };
              });
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
